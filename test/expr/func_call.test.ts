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
            "items": [
              {
                "text": "1",
                "type": "number",
                "value": 1,
              },
            ],
            "type": "list_expr",
          },
          "type": "paren_expr",
        },
        "name": {
          "name": "my_func",
          "text": "my_func",
          "type": "identifier",
        },
        "type": "func_call",
      }
    `);
  });

  it("supports special functions without parenthesis", () => {
    testExpr("CURRENT_TIME");
    testExpr("CURRENT_DATE");
    testExpr("CURRENT_TIMESTAMP");
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
  });
});
