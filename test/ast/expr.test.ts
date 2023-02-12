import { parseAstExpr } from "./ast_test_utils";

describe("select", () => {
  it("parses binary expr", () => {
    expect(parseAstExpr("'hello' + 1")).toMatchInlineSnapshot(`
      {
        "left": {
          "type": "string_literal",
          "value": "hello",
        },
        "operator": "+",
        "right": {
          "type": "string_literal",
          "value": "hello",
        },
        "type": "binary_expr",
      }
    `);
  });

  it("parses simple func call", () => {
    expect(parseAstExpr("my_func(1, 2)")).toMatchInlineSnapshot(`
      {
        "args": [
          {
            "type": "number_literal",
            "value": 1,
          },
          {
            "type": "number_literal",
            "value": 2,
          },
        ],
        "name": {
          "name": "my_func",
          "type": "identifier",
        },
        "type": "func_call",
      }
    `);
  });

  it("parses func call with DISTINCT", () => {
    expect(parseAstExpr("count(DISTINCT id)")).toMatchInlineSnapshot(`
      {
        "args": [
          {
            "name": "id",
            "type": "identifier",
          },
        ],
        "distinct": true,
        "name": {
          "name": "count",
          "type": "identifier",
        },
        "type": "func_call",
      }
    `);
  });
});
