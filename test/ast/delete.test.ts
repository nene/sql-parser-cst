import { createParseSpecificStmt } from "./ast_test_utils";

describe("delete", () => {
  const parseAstDelete = createParseSpecificStmt("delete_stmt");

  it("parses basic DELETE FROM", () => {
    expect(parseAstDelete(`DELETE FROM tbl WHERE true`)).toMatchInlineSnapshot(`
      {
        "table": {
          "name": "tbl",
          "type": "identifier",
        },
        "type": "delete_stmt",
        "where": {
          "type": "boolean_literal",
          "value": true,
        },
      }
    `);
  });

  it("parses WITH clause", () => {
    expect(parseAstDelete(`WITH foo AS (SELECT 1) DELETE FROM tbl`).with).toMatchInlineSnapshot(`
      {
        "tables": [
          {
            "expr": {
              "columns": [
                {
                  "type": "number_literal",
                  "value": 1,
                },
              ],
              "type": "select_stmt",
            },
            "table": {
              "name": "foo",
              "type": "identifier",
            },
            "type": "common_table_expression",
          },
        ],
        "type": "with_clause",
      }
    `);
  });

  it("parses RETURNING", () => {
    expect(parseAstDelete(`DELETE FROM tbl RETURNING 1`).returning).toMatchInlineSnapshot(`
      [
        {
          "type": "number_literal",
          "value": 1,
        },
      ]
    `);
  });

  it("parses ORDER BY and LIMIT clauses", () => {
    expect(parseAstDelete(`DELETE FROM tbl ORDER BY col1 LIMIT 10`)).toMatchInlineSnapshot(`
      {
        "limit": {
          "type": "number_literal",
          "value": 10,
        },
        "orderBy": [
          {
            "name": "col1",
            "type": "identifier",
          },
        ],
        "table": {
          "name": "tbl",
          "type": "identifier",
        },
        "type": "delete_stmt",
      }
    `);
  });
});
