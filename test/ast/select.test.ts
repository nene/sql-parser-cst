import { parseAstStmt } from "./ast_test_utils";

describe("select", () => {
  it("parses simple SELECT", () => {
    expect(parseAstStmt("SELECT col1, col2")).toMatchInlineSnapshot(`
      {
        "columns": [
          {
            "name": "col1",
            "type": "identifier",
          },
          {
            "name": "col2",
            "type": "identifier",
          },
        ],
        "type": "select_stmt",
      }
    `);
  });

  it("parses SELECT DISTINCT", () => {
    expect(parseAstStmt("SELECT DISTINCT *")).toMatchInlineSnapshot(`
      {
        "columns": [
          {
            "type": "all_columns",
          },
        ],
        "distinct": "distinct",
        "type": "select_stmt",
      }
    `);
  });
});
