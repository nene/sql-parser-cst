import { dialect, notDialect, parseExpr, testExpr, testExprWc } from "../test_utils";

describe("ROW constructor", () => {
  dialect("postgresql", () => {
    it("supports ROW constructor", () => {
      testExprWc("ROW ( )");
      testExprWc("ROW ( 1, 'Hello', TRUE, NULL )");
    });

    it("supports comparison of ROW constructors", () => {
      testExpr("ROW(1, 2, NULL) < ROW(1, 3, 0)");
      testExpr("ROW(1, 2, 0) IS DISTINCT FROM ROW(1, 2, NULL)");
    });

    // To ensure we don't parse it as a function call
    it("parses ROW() as row_constructor", () => {
      expect(parseExpr("ROW(1, 2, 3)")).toMatchInlineSnapshot(`
        {
          "row": {
            "expr": {
              "items": [
                {
                  "text": "1",
                  "type": "number_literal",
                  "value": 1,
                },
                {
                  "text": "2",
                  "type": "number_literal",
                  "value": 2,
                },
                {
                  "text": "3",
                  "type": "number_literal",
                  "value": 3,
                },
              ],
              "type": "list_expr",
            },
            "type": "paren_expr",
          },
          "rowKw": {
            "name": "ROW",
            "text": "ROW",
            "type": "keyword",
          },
          "type": "row_constructor",
        }
      `);
    });
  });

  notDialect("postgresql", () => {
    it("does not support ROW() constructor", () => {
      expect(() => parseExpr("ROW(1, 2, 3)")).toThrowError();
    });
  });
});
