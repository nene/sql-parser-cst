import { parseAstStmt } from "./ast_test_utils";

describe("insert", () => {
  it("parses basic INSERT", () => {
    expect(
      parseAstStmt(`
        INSERT INTO tbl (col1, col2)
        VALUES (1, 2), (3, 4)
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
        "table": {
          "name": "tbl",
          "type": "identifier",
        },
        "type": "insert_stmt",
        "values": {
          "type": "values_clause",
          "values": [
            [
              {
                "type": "number_literal",
                "value": 1,
              },
              {
                "type": "number_literal",
                "value": 2,
              },
            ],
            [
              {
                "type": "number_literal",
                "value": 3,
              },
              {
                "type": "number_literal",
                "value": 4,
              },
            ],
          ],
        },
      }
    `);
  });

  it("parses WITH..INSERT", () => {
    expect(
      parseAstStmt(`
        WITH foo AS (SELECT 1)
        INSERT INTO tbl
        VALUES (1)
      `)
    ).toMatchInlineSnapshot(`
      {
        "table": {
          "name": "tbl",
          "type": "identifier",
        },
        "type": "insert_stmt",
        "values": {
          "type": "values_clause",
          "values": [
            [
              {
                "type": "number_literal",
                "value": 1,
              },
            ],
          ],
        },
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

  it("parses INSERT OR REPLACE", () => {
    expect(parseAstStmt(`INSERT OR REPLACE INTO tbl VALUES (1)`)).toMatchInlineSnapshot(`
      {
        "orAction": "replace",
        "table": {
          "name": "tbl",
          "type": "identifier",
        },
        "type": "insert_stmt",
        "values": {
          "type": "values_clause",
          "values": [
            [
              {
                "type": "number_literal",
                "value": 1,
              },
            ],
          ],
        },
      }
    `);
  });

  it("parses REPLACE INTO statement the same as INSERT OR REPLACE INTO", () => {
    expect(parseAstStmt(`REPLACE INTO tbl VALUES (1)`)).toMatchInlineSnapshot(`
      {
        "orAction": "replace",
        "table": {
          "name": "tbl",
          "type": "identifier",
        },
        "type": "insert_stmt",
        "values": {
          "type": "values_clause",
          "values": [
            [
              {
                "type": "number_literal",
                "value": 1,
              },
            ],
          ],
        },
      }
    `);
  });
});
