import { parseExpr, testExpr } from "./test_utils";

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
            "children": [
              {
                "text": "1",
                "type": "number",
              },
            ],
            "type": "expr_list",
          },
          "type": "paren_expr",
        },
        "name": {
          "text": "my_func",
          "type": "identifier",
        },
        "type": "func_call",
      }
    `);
  });
});
