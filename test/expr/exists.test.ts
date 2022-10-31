import { parseExpr, testExpr } from "../test_utils";

describe("EXISTS expression", () => {
  it("supports EXISTS expression", () => {
    testExpr(`EXISTS (SELECT 1)`);
    testExpr(`EXISTS /*c1*/ (SELECT 1)`);
  });

  it("supports NOT EXISTS expression", () => {
    testExpr(`NOT EXISTS (SELECT 1)`);
  });

  // Check that we're using unary operators: NOT & EXISTS
  it("parses NOT EXISTS to syntax tree", () => {
    expect(parseExpr("NOT EXISTS (SELECT 1)")).toMatchInlineSnapshot(`
      {
        "expr": {
          "expr": {
            "expr": {
              "clauses": [
                {
                  "columns": {
                    "items": [
                      {
                        "text": "1",
                        "type": "number",
                      },
                    ],
                    "type": "expr_list",
                  },
                  "options": [],
                  "selectKw": {
                    "text": "SELECT",
                    "type": "keyword",
                  },
                  "type": "select_clause",
                },
              ],
              "type": "select_stmt",
            },
            "type": "paren_expr",
          },
          "operator": {
            "text": "EXISTS",
            "type": "keyword",
          },
          "type": "unary_expr",
        },
        "operator": {
          "text": "NOT",
          "type": "keyword",
        },
        "type": "unary_expr",
      }
    `);
  });
});
