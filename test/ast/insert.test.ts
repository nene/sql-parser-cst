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
      }
    `);
  });
});
