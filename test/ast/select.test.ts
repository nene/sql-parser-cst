import { parseAst } from "./ast_test_utils";

describe("select", () => {
  it("parses simple SELECT", () => {
    expect(parseAst("SELECT id, 'hello' + 1")).toMatchInlineSnapshot(`
      {
        "statements": [
          {
            "columns": [
              {
                "name": "id",
                "type": "identifier",
              },
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
              },
            ],
            "type": "select_stmt",
          },
        ],
        "type": "program",
      }
    `);
  });
});
