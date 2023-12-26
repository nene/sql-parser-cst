import { dialect, parseExpr, testExpr } from "../test_utils";

describe("date/time literal", () => {
  it("supports TIME", () => {
    testExpr(`TIME '20:15:00'`);
    expect(parseExpr(`TIME '10:05:58'`)).toMatchInlineSnapshot(`
      {
        "string": {
          "text": "'10:05:58'",
          "type": "string_literal",
          "value": "10:05:58",
        },
        "timeKw": {
          "name": "TIME",
          "text": "TIME",
          "type": "keyword",
        },
        "type": "time_literal",
      }
    `);
  });

  it("supports DATE", () => {
    testExpr(`DATE '1995-06-01'`);
    expect(parseExpr(`DATE '1995-06-01'`)).toMatchInlineSnapshot(`
      {
        "dateKw": {
          "name": "DATE",
          "text": "DATE",
          "type": "keyword",
        },
        "string": {
          "text": "'1995-06-01'",
          "type": "string_literal",
          "value": "1995-06-01",
        },
        "type": "date_literal",
      }
    `);
  });

  dialect(["sqlite", "mysql", "mariadb", "bigquery"], () => {
    it("supports DATETIME", () => {
      testExpr(`DATEtime '1995-06-01 20:15:00'`);
      testExpr(`DATETIME /* com1 */ '20:15:00'`);
      expect(parseExpr(`DATETIME '1995-06-01 20:15:00'`)).toMatchInlineSnapshot(`
        {
          "datetimeKw": {
            "name": "DATETIME",
            "text": "DATETIME",
            "type": "keyword",
          },
          "string": {
            "text": "'1995-06-01 20:15:00'",
            "type": "string_literal",
            "value": "1995-06-01 20:15:00",
          },
          "type": "datetime_literal",
        }
      `);
    });
  });

  it("supports TIMESTAMP", () => {
    testExpr(`timestamp '1995-06-01 20:15:00'`);
    expect(parseExpr(`TIMESTAMP '1995-06-01 20:15:00'`)).toMatchInlineSnapshot(`
      {
        "string": {
          "text": "'1995-06-01 20:15:00'",
          "type": "string_literal",
          "value": "1995-06-01 20:15:00",
        },
        "timestampKw": {
          "name": "TIMESTAMP",
          "text": "TIMESTAMP",
          "type": "keyword",
        },
        "type": "timestamp_literal",
      }
    `);
  });

  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("datetime with double-quoted string", () => {
      testExpr(`TIME "20:15:00"`);
      testExpr(`DATE "1995-06-01"`);
      testExpr(`DATEtime "1995-06-01 20:15:00"`);
      testExpr(`timestamp "1995-06-01 20:15:00"`);
    });
  });
});
