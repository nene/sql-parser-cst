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
              "range": [
                54,
                55,
              ],
              "type": "number_literal",
              "value": 1,
            },
            {
              "range": [
                57,
                58,
              ],
              "type": "number_literal",
              "value": 2,
            },
          ],
          [
            {
              "range": [
                62,
                63,
              ],
              "type": "number_literal",
              "value": 3,
            },
            {
              "range": [
                65,
                66,
              ],
              "type": "number_literal",
              "value": 4,
            },
          ],
        ],
      }
    `);
  });
});
