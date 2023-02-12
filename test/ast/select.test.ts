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

  it("parses aliases", () => {
    expect(parseAstStmt("SELECT x AS foo")).toMatchInlineSnapshot(`
      {
        "columns": [
          {
            "alias": {
              "name": "foo",
              "type": "identifier",
            },
            "expr": {
              "name": "x",
              "type": "identifier",
            },
            "type": "alias",
          },
        ],
        "type": "select_stmt",
      }
    `);
  });
});
