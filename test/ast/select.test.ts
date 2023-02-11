import { parseAst } from "./ast_test_utils";

describe("select", () => {
  it("parses simple SELECT", () => {
    expect(parseAst("SELECT id, 'hello' + 1")).toMatchInlineSnapshot(`
      {
        "range": undefined,
        "statements": [
          {
            "columns": [
              {
                "name": "id",
                "range": undefined,
                "type": "identifier",
              },
              {
                "left": {
                  "range": undefined,
                  "type": "string_literal",
                  "value": "hello",
                },
                "operator": "+",
                "range": undefined,
                "right": {
                  "range": undefined,
                  "type": "string_literal",
                  "value": "hello",
                },
                "type": "binary_expr",
              },
            ],
            "distinct": undefined,
            "range": undefined,
            "type": "select_stmt",
          },
        ],
        "type": "program",
      }
    `);
  });
});
