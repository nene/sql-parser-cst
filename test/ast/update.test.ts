import { createParseSpecificStmt } from "./ast_test_utils";

describe("update", () => {
  const parseAstUpdate = createParseSpecificStmt("update_stmt");

  it("parses basic UPDATE", () => {
    expect(parseAstUpdate(`UPDATE tbl SET x = 1, y = 2 WHERE true`)).toMatchInlineSnapshot(`
      {
        "assignments": [
          {
            "column": {
              "name": "x",
              "type": "identifier",
            },
            "expr": {
              "type": "number_literal",
              "value": 1,
            },
            "type": "column_assignment",
          },
          {
            "column": {
              "name": "y",
              "type": "identifier",
            },
            "expr": {
              "type": "number_literal",
              "value": 2,
            },
            "type": "column_assignment",
          },
        ],
        "tables": [
          {
            "name": "tbl",
            "type": "identifier",
          },
        ],
        "type": "update_stmt",
        "where": {
          "type": "boolean_literal",
          "value": true,
        },
      }
    `);
  });

  it("parses WITH .. FROM .. ORDER BY .. LIMIT clauses", () => {
    expect(
      parseAstUpdate(`
        WITH foo AS (SELECT 1)
        UPDATE tbl
        SET x = 1, y = 2
        FROM foo
        ORDER BY col
        LIMIT 2
      `)
    ).toMatchInlineSnapshot(`
      {
        "assignments": [
          {
            "column": {
              "name": "x",
              "type": "identifier",
            },
            "expr": {
              "type": "number_literal",
              "value": 1,
            },
            "type": "column_assignment",
          },
          {
            "column": {
              "name": "y",
              "type": "identifier",
            },
            "expr": {
              "type": "number_literal",
              "value": 2,
            },
            "type": "column_assignment",
          },
        ],
        "from": {
          "name": "foo",
          "type": "identifier",
        },
        "limit": {
          "type": "number_literal",
          "value": 2,
        },
        "orderBy": [
          {
            "name": "col",
            "type": "identifier",
          },
        ],
        "tables": [
          {
            "name": "tbl",
            "type": "identifier",
          },
        ],
        "type": "update_stmt",
        "with": {
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
        },
      }
    `);
  });

  it("parses UPDATE OR ABORT", () => {
    expect(parseAstUpdate(`UPDATE OR ABORT tbl SET x=1`).orAction).toBe("abort");
  });

  it("parses multi-column assignment", () => {
    expect(parseAstUpdate(`UPDATE tbl SET (x, y) = (1, 2)`).assignments).toMatchInlineSnapshot(`
      [
        {
          "column": {
            "items": [
              {
                "name": "x",
                "type": "identifier",
              },
              {
                "name": "y",
                "type": "identifier",
              },
            ],
            "type": "list_expr",
          },
          "expr": {
            "items": [
              {
                "type": "number_literal",
                "value": 1,
              },
              {
                "type": "number_literal",
                "value": 2,
              },
            ],
            "type": "list_expr",
          },
          "type": "column_assignment",
        },
      ]
    `);
  });
});
