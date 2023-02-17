import { parseAstStmt } from "./ast_test_utils";

describe("update", () => {
  it("parses basic UPDATE", () => {
    expect(parseAstStmt(`UPDATE tbl SET x = 1, y = 2`)).toMatchInlineSnapshot(`
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
      }
    `);
  });
});
