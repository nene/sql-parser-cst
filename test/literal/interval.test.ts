import { dialect, parseExpr, testExpr } from "../test_utils";

describe("INTERVAL literal", () => {
  dialect(["mysql", "mariadb", "bigquery", "postgresql"], () => {
    it("supports INTERVAL with string argument and unit", () => {
      testExpr(`INTERVAL '3' DAY`);
    });

    it("supports standard time units", () => {
      testExpr(`INTERVAL '3' YEAR`);
      testExpr(`INTERVAL '3' MONTH`);
      testExpr(`INTERVAL '3' DAY`);
      testExpr(`INTERVAL '3' HOUR`);
      testExpr(`INTERVAL '3' MINUTE`);
      testExpr(`INTERVAL '3' SECOND`);
    });

    it("parses INTERVAL with unit to syntax node", () => {
      expect(parseExpr(`INTERVAL '42' DAY`)).toMatchInlineSnapshot(`
        {
          "intervalKw": {
            "name": "INTERVAL",
            "text": "INTERVAL",
            "type": "keyword",
          },
          "precision": undefined,
          "type": "interval_literal",
          "unit": {
            "type": "interval_unit",
            "unitKw": {
              "name": "DAY",
              "text": "DAY",
              "type": "keyword",
            },
          },
          "value": {
            "text": "'42'",
            "type": "string_literal",
            "value": "42",
          },
        }
      `);
    });
  });

  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("supports INTERVAL with number argument", () => {
      testExpr(`INTERVAL 3 DAY`);
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

  dialect(["bigquery", "postgresql"], () => {
    it("supports time range syntax", () => {
      testExpr(`INTERVAL '11:25:58' HOUR TO SECOND`);
      testExpr(`INTERVAL '8 11:25' DAY TO MINUTE`);
      testExpr(`INTERVAL '8 11' MONTH TO DAY`);
      testExpr(`INTERVAL '3-6' YEAR TO MONTH`);
    });

    it("parses INTERVAL range to syntax node", () => {
      expect(parseExpr(`INTERVAL '3-6' YEAR TO MONTH`)).toMatchInlineSnapshot(`
        {
          "intervalKw": {
            "name": "INTERVAL",
            "text": "INTERVAL",
            "type": "keyword",
          },
          "precision": undefined,
          "type": "interval_literal",
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
          "value": {
            "text": "'3-6'",
            "type": "string_literal",
            "value": "3-6",
          },
        }
      `);
    });
  });

  dialect("bigquery", () => {
    it("supports additional BigQuery time units", () => {
      testExpr(`INTERVAL 3 WEEK`);
      testExpr(`INTERVAL 3 QUARTER`);
      testExpr(`INTERVAL 3 MILLISECOND`);
      testExpr(`INTERVAL 3 MICROSECOND`);
    });
  });

  dialect("postgresql", () => {
    it("supports INTERVAL with just string argument", () => {
      testExpr(`INTERVAL '1 year 25 days'`);
    });

    it("supports INTERVAL literal with various PostgreSQL string types", () => {
      testExpr(`INTERVAL U&'1 day'`);
      testExpr(`INTERVAL E'1 day'`);
      testExpr("INTERVAL $$1 day$$");
    });

    it("supports INTERVAL with precision argument", () => {
      testExpr(`INTERVAL (4) '8 second'`);
    });

    it("supports INTERVAL with range and precision argument", () => {
      testExpr(`INTERVAL '8' SECOND (4)`);
      testExpr(`INTERVAL '8' DAY TO SECOND (2)`);
    });

    it("parses INTERVAL range with precision as interval_literal", () => {
      expect(parseExpr(`INTERVAL '8' SECOND (4)`).type).toBe("interval_literal");
    });
  });

  dialect("sqlite", () => {
    it("does not support INTERVAL literals", () => {
      expect(() => testExpr(`(INTERVAL '1' DAY)`)).toThrowError();
    });
  });
});
