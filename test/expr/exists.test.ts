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
                  "asStructOrValueKw": undefined,
                  "columns": {
                    "items": [
                      {
                        "text": "1",
                        "type": "number",
                        "value": 1,
                      },
                    ],
                    "type": "list_expr",
                  },
                  "distinctKw": undefined,
                  "options": [],
                  "selectKw": {
                    "name": "SELECT",
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
            "name": "EXISTS",
            "text": "EXISTS",
            "type": "keyword",
          },
          "type": "prefix_op_expr",
        },
        "operator": {
          "name": "NOT",
          "text": "NOT",
          "type": "keyword",
        },
        "type": "prefix_op_expr",
      }
    `);
  });
});
