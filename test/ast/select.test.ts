import { parseAstStmt } from "./ast_test_utils";

describe("select", () => {
  it("parses SELECT with standard clauses", () => {
    expect(
      parseAstStmt(`
        SELECT col1, col2
        FROM tbl
        WHERE true
        GROUP BY col3
        HAVING false
        ORDER BY col4
        LIMIT 100
      `)
    ).toMatchInlineSnapshot(`
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
        "from": {
          "name": "tbl",
          "type": "identifier",
        },
        "groupBy": [
          {
            "name": "col3",
            "type": "identifier",
          },
        ],
        "having": {
          "type": "boolean_literal",
          "value": false,
        },
        "limit": {
          "type": "number_literal",
          "value": 100,
        },
        "orderBy": [
          {
            "name": "col4",
            "type": "identifier",
          },
        ],
        "type": "select_stmt",
        "where": {
          "type": "boolean_literal",
          "value": true,
        },
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
