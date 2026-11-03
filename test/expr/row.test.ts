import { dialect, parseExpr, testExpr, testExprWc } from "../test_utils";

describe("ROW constructor", () => {
  dialect(["postgresql", "plpgsql"], () => {
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

    it("the ROW keyword is optional when there is more than one element in list", () => {
      testExprWc("(1, 2)");
      testExprWc("( 1, 'Hello', TRUE, NULL )");
    });

    // To ensure we don't parse it as plain parenthesis
    it("parses (1, 2) as row_constructor", () => {
      expect(parseExpr("(1, 2)")).toMatchInlineSnapshot(`
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
              ],
              "type": "list_expr",
            },
            "type": "paren_expr",
          },
          "type": "row_constructor",
        }
      `);
    });
  });

  dialect(["mysql"], () => {
    it("does not support ROW() constructor", () => {
      expect(() => parseExpr("ROW(1, 2, 3)")).toThrow();
    });
  });
  dialect(["bigquery", "mariadb", "sqlite"], () => {
    it("parses ROW() as a function", () => {
      expect(parseExpr("ROW(1, 2, 3)").type).toBe("func_call");
    });
  });
  dialect(["mariadb", "sqlite"], () => {
    it("parses (1, 2) as a plain paren_expr", () => {
      expect(parseExpr("(1, 2)").type).toBe("paren_expr");
    });
  });
  dialect(["bigquery"], () => {
    // See struct.test.ts for more
    it("parses (1, 2) as a struct", () => {
      expect(parseExpr("(1, 2)").type).toBe("struct_expr");
    });
  });
});
