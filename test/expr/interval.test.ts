import { dialect, parseExpr, testExpr, testExprWc } from "../test_utils";

describe("temporal intervals", () => {
  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("supports INTERVAL with number argument", () => {
      testExprWc(`INTERVAL 3 DAY`);
    });

    it("supports INTERVAL with string argument", () => {
      testExpr(`INTERVAL '3' DAY`);
    });

    it("supports standard time units", () => {
      testExpr(`INTERVAL 3 YEAR`);
      testExpr(`INTERVAL 3 MONTH`);
      testExpr(`INTERVAL 3 DAY`);
      testExpr(`INTERVAL 3 HOUR`);
      testExpr(`INTERVAL 3 MINUTE`);
      testExpr(`INTERVAL 3 SECOND`);
    });

    it("parses INTERVAL to syntax node", () => {
      expect(parseExpr(`INTERVAL 42 DAY`)).toMatchInlineSnapshot(`
        {
          "expr": {
            "text": "42",
            "type": "number_literal",
            "value": 42,
          },
          "intervalKw": {
            "name": "INTERVAL",
            "text": "INTERVAL",
            "type": "keyword",
          },
          "type": "interval_expr",
          "unit": {
            "type": "interval_unit",
            "unitKw": {
              "name": "DAY",
              "text": "DAY",
              "type": "keyword",
            },
          },
        }
      `);
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports additional MySQL time units", () => {
      testExpr(`INTERVAL 3 QUARTER`);
      testExpr(`INTERVAL 3 WEEK`);
      testExpr(`INTERVAL 3 MICROSECOND`);
    });

    it("supports MySQL time_range units", () => {
      testExpr(`INTERVAL '10.123' SECOND_MICROSECOND`);
      testExpr(`INTERVAL '30:50.123' MINUTE_MICROSECOND`);
      testExpr(`INTERVAL '45:15' MINUTE_SECOND`);
      testExpr(`INTERVAL '11:25:58.123' HOUR_MICROSECOND`);
      testExpr(`INTERVAL '11:25:58' HOUR_SECOND`);
      testExpr(`INTERVAL '11:25' HOUR_MINUTE`);
      testExpr(`INTERVAL '8 11:25:58.123' DAY_MICROSECOND`);
      testExpr(`INTERVAL '8 11:25:58' DAY_SECOND`);
      testExpr(`INTERVAL '8 11:25' DAY_MINUTE`);
      testExpr(`INTERVAL '8 11' DAY_HOUR`);
      testExpr(`INTERVAL '3-6' YEAR_MONTH`);
    });
  });

  dialect("bigquery", () => {
    it("supports BigQuery time range syntax", () => {
      testExprWc(`INTERVAL '11:25:58' HOUR TO SECOND`);
      testExprWc(`INTERVAL '8 11:25' DAY TO MINUTE`);
      testExprWc(`INTERVAL '8 11' MONTH TO DAY`);
      testExprWc(`INTERVAL '3-6' YEAR TO MONTH`);
    });

    it("parses INTERVAL range to syntax node", () => {
      expect(parseExpr(`INTERVAL '3-6' YEAR TO MONTH`)).toMatchInlineSnapshot(`
        {
          "expr": {
            "text": "'3-6'",
            "type": "string_literal",
            "value": "3-6",
          },
          "intervalKw": {
            "name": "INTERVAL",
            "text": "INTERVAL",
            "type": "keyword",
          },
          "type": "interval_expr",
          "unit": {
            "fromUnit": {
              "type": "interval_unit",
              "unitKw": {
                "name": "YEAR",
                "text": "YEAR",
                "type": "keyword",
              },
            },
            "toKw": {
              "name": "TO",
              "text": "TO",
              "type": "keyword",
            },
            "toUnit": {
              "type": "interval_unit",
              "unitKw": {
                "name": "MONTH",
                "text": "MONTH",
                "type": "keyword",
              },
            },
            "type": "interval_unit_range",
          },
        }
      `);
    });
  });

  dialect(["sqlite", "postgresql"], () => {
    it("does not support INTERVAL expressions", () => {
      expect(() => testExpr(`INTERVAL 1 DAY`)).toThrowError();
    });
  });
});
