import { dialect, parseExpr, testExpr } from "../test_utils";

describe("temporal intervals", () => {
  dialect("mysql", () => {
    it("supports INTERVAL expressions", () => {
      testExpr(`INTERVAL 3 YEAR`);
      testExpr(`INTERVAL 3 QUARTER`);
      testExpr(`INTERVAL 3 MONTH`);
      testExpr(`INTERVAL 3 WEEK`);
      testExpr(`INTERVAL 3 DAY`);
      testExpr(`INTERVAL 3 HOUR`);
      testExpr(`INTERVAL 3 MINUTE`);
      testExpr(`INTERVAL 3 SECOND`);
      testExpr(`INTERVAL 3 MICROSECOND`);
      testExpr(`INTERVAL /*c1*/ 3 /*c2*/ DAY`);
    });

    it("parses INTERVAL to syntax node", () => {
      expect(parseExpr(`INTERVAL 42 DAY`)).toMatchInlineSnapshot(`
        {
          "expr": {
            "text": "42",
            "type": "number",
            "value": 42,
          },
          "intervalKw": {
            "name": "INTERVAL",
            "text": "INTERVAL",
            "type": "keyword",
          },
          "type": "interval_expr",
          "unitKw": {
            "name": "DAY",
            "text": "DAY",
            "type": "keyword",
          },
        }
      `);
    });
  });

  dialect("bigquery", () => {
    it.skip("supports INTERVAL with string argument", () => {});
  });

  dialect("sqlite", () => {
    it("does not support INTERVAL expressions", () => {
      expect(() => testExpr(`INTERVAL 1 DAY`)).toThrowError("Expected");
    });
  });
});
