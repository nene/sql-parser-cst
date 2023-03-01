import { dialect, parseExpr, testExpr, testExprWc } from "../test_utils";

describe("function call", () => {
  it("supports simple function call", () => {
    testExprWc(`my_func ( 1 , 2 )`);
  });

  it("supports function call with empty arguments list", () => {
    testExpr(`my_func()`);
    testExpr(`my_func( /* some comment here */ )`);
  });

  it("supports aggregate function count(*)", () => {
    testExpr(`count(*)`);
    testExprWc(`count( * )`);
  });

  it("supports aggregate functions with DISTINCT keyword", () => {
    testExpr(`count(DISTINCT col)`);
    testExpr(`avg(DISTINCT col)`);
    testExpr(`sum(DISTINCT col)`);
    testExprWc(`sum( distinct col )`);
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
                  "type": "number_literal",
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

  describe("namespaced functions", () => {
    it("supports calling user-defined functions", () => {
      testExpr(`my_dataset.multiply_by_three(5)`);
    });

    it("supports calling namespaced functions", () => {
      testExpr(`NET.IP_FROM_STRING(addr_str)`);
    });

    dialect("bigquery", () => {
      it("supports SAFE. prefix for function calls", () => {
        testExpr(`SAFE.SUBSTR('foo', 0, -2)`);
      });
    });
  });

  dialect("sqlite", () => {
    it("supports FILTER clause for aggregate functions", () => {
      testExprWc(`count(*) FILTER (WHERE job_id = 2)`);
    });
  });

  describe("functions with reserved keywords as names", () => {
    dialect(["bigquery", "mysql"], () => {
      it("IF() function", () => {
        testExpr(`IF(x > 3, 'yes', 'no')`);
      });

      it("LEFT() / RIGHT() functions", () => {
        testExpr(`LEFT('hello', 3)`);
        testExpr(`RIGHT('hello', 3)`);
      });
    });

    dialect("bigquery", () => {
      it("supports COLLATE function", () => {
        testExpr(`COLLATE('abc', 'und:ci')`);
      });

      it("supports ARRAY function", () => {
        testExpr(`ARRAY(SELECT * FROM tbl)`);
      });
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
      testExprWc(`my_func(arg1, arg2 IGNORE NULLS)`);
    });

    it("supports ORDER BY clause", () => {
      testExpr(`my_func(arg1, arg2 ORDER BY foo, bar DESC)`);
    });

    it("supports LIMIT clause", () => {
      testExpr(`my_func(arg1, arg2 LIMIT 10)`);
    });

    it("supports combination of DISTINCT, NULLS, ORDER BY, LIMIT", () => {
      testExprWc(`my_func(DISTINCT arg1, arg2 IGNORE NULLS ORDER BY foo LIMIT 10)`);
    });
  });
});
