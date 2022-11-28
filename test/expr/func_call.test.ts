import { dialect, parseExpr, testExpr } from "../test_utils";

describe("function call", () => {
  it("supports simple function call", () => {
    testExpr(`my_func(1, 2)`);
    testExpr(`my_func /*c1*/ (/*c2*/ 1 /*c3*/ , /*c4*/ 2 /*c5*/)`);
  });

  it("supports function call with empty arguments list", () => {
    testExpr(`my_func()`);
    testExpr(`my_func( /* some comment here */ )`);
  });

  it("supports aggregate function count(*)", () => {
    testExpr(`count(*)`);
    testExpr(`count( /*c1*/ * /*c2*/ )`);
  });

  it("supports aggregate functions with DISTINCT keyword", () => {
    testExpr(`count(DISTINCT col)`);
    testExpr(`avg(DISTINCT col)`);
    testExpr(`sum(DISTINCT col)`);
    testExpr(`sum(/*c1*/ distinct /*c2*/ col /*c3*/)`);
  });

  it("parses function call to syntax tree", () => {
    expect(parseExpr(`my_func(1)`)).toMatchInlineSnapshot(`
      {
        "args": {
          "expr": {
            "args": {
              "items": [
                {
                  "text": "1",
                  "type": "number",
                  "value": 1,
                },
              ],
              "type": "list_expr",
            },
            "distinctKw": undefined,
            "limit": undefined,
            "nullHandlingKw": undefined,
            "orderBy": undefined,
            "type": "func_args",
          },
          "type": "paren_expr",
        },
        "filter": undefined,
        "name": {
          "name": "my_func",
          "text": "my_func",
          "type": "identifier",
        },
        "over": undefined,
        "type": "func_call",
      }
    `);
  });

  describe("paren-less functions", () => {
    function testIsFunction(str: string) {
      expect(parseExpr(str)).toEqual({
        type: "func_call",
        name: { type: "identifier", name: str, text: str },
      });
    }

    it("supports standard special functions without parenthesis", () => {
      testIsFunction("CURRENT_TIME");
      testIsFunction("CURRENT_DATE");
      testIsFunction("CURRENT_TIMESTAMP");
    });

    dialect("bigquery", () => {
      it("supports additional special functions without parenthesis", () => {
        testIsFunction("CURRENT_DATETIME");
      });
    });

    dialect("mysql", () => {
      it("supports additional special functions without parenthesis", () => {
        testIsFunction("CURRENT_USER");
        testIsFunction("LOCALTIME");
        testIsFunction("LOCALTIMESTAMP");
      });
    });
  });

  it("parses special paren-less function to func_call node", () => {
    expect(parseExpr("CURRENT_TIME")).toMatchInlineSnapshot(`
      {
        "name": {
          "name": "CURRENT_TIME",
          "text": "CURRENT_TIME",
          "type": "identifier",
        },
        "type": "func_call",
      }
    `);
  });

  dialect("sqlite", () => {
    it("supports FILTER clause for aggregate functions", () => {
      testExpr(`count(*) FILTER (WHERE job_id = 2)`);
      testExpr(`count(*) /*c1*/ FILTER /*c2*/ (/*c3*/ WHERE /*c4*/ true /*c5*/)`);
    });
  });

  dialect("bigquery", () => {
    it("supports functions with reserved keywords as names", () => {
      testExpr(`LEFT('hello', 3)`);
      testExpr(`RIGHT('hello', 3)`);
    });

    it("supports ARRAY function", () => {
      testExpr(`ARRAY(SELECT * FROM tbl)`);
    });

    it("supports COLLATE function", () => {
      testExpr(`COLLATE('abc', 'und:ci')`);
    });
  });

  dialect("bigquery", () => {
    it("supports named function arguments", () => {
      testExpr(`my_func(arg1 => 'foo', arg2 => 'bar')`);
    });

    it("supports mix of named and positional function arguments", () => {
      testExpr(`SEARCH('foo', 'f', analyzer => 'NO_OP_ANALYZER')`);
    });
  });

  dialect("bigquery", () => {
    it("supports INGORE|RESPECT NULLS", () => {
      testExpr(`my_func(arg1, arg2 IGNORE NULLS)`);
      testExpr(`my_func(arg1, arg2 /*c1*/ RESPECT /*c2*/ NULLS /*c3*/)`);
    });

    it("supports ORDER BY clause", () => {
      testExpr(`my_func(arg1, arg2 ORDER BY foo, bar DESC)`);
    });

    it("supports LIMIT clause", () => {
      testExpr(`my_func(arg1, arg2 LIMIT 10)`);
    });

    it("supports combination of DISTINCT, NULLS, ORDER BY, LIMIT", () => {
      testExpr(`my_func(DISTINCT arg1, arg2 IGNORE NULLS ORDER BY foo LIMIT 10)`);
      testExpr(`
        my_func(
          DISTINCT arg1, arg2
          /*c1*/ IGNORE NULLS
          /*c2*/ ORDER BY foo
          /*c3*/ LIMIT 10
          /*c4*/
        )
      `);
    });
  });
});
