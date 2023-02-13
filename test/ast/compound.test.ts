import { parseAst } from "./ast_test_utils";

describe("compound select", () => {
  it("parses UNION", () => {
    expect(parseAst("SELECT 1 UNION ALL SELECT 2")).toMatchInlineSnapshot(`
      {
        "statements": [
          {
            "left": {
              "columns": [
                {
                  "type": "number_literal",
                  "value": 1,
                },
              ],
              "type": "select_stmt",
            },
            "operator": "union all",
            "right": {
              "columns": [
                {
                  "type": "number_literal",
                  "value": 2,
                },
              ],
              "type": "select_stmt",
            },
            "type": "compound_select_stmt",
          },
        ],
        "type": "program",
      }
    `);
  });
});
