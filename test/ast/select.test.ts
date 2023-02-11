import { parseAstStmt } from "./ast_test_utils";

describe("select", () => {
  it("parses simple SELECT", () => {
    expect(parseAstStmt("SELECT id, 'hello' + 1")).toMatchInlineSnapshot(`
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
      }
    `);
  });

  it("parses SELECT DISTINCT", () => {
    expect(parseAstStmt("SELECT DISTINCT id")).toMatchInlineSnapshot(`
      {
        "columns": [
          {
            "name": "id",
            "type": "identifier",
          },
        ],
        "distinct": "distinct",
        "type": "select_stmt",
      }
    `);
  });
});
