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

  it("parses function call to syntax tree", () => {
    expect(parseExpr(`my_func(1)`)).toMatchInlineSnapshot(`
      {
        "args": {
          "type": "func_args_list",
          "values": [
            {
              "text": "1",
              "type": "number",
            },
          ],
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
