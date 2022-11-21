import { dialect, parseExpr, testExpr } from "../test_utils";

describe("extract()", () => {
  dialect(["bigquery", "mysql"], () => {
    it("supports extract() expression", () => {
      testExpr(`EXTRACT(DAY FROM col1)`);
      testExpr(`EXTRACT /*c1*/ ( /*c2*/ HOUR /*c3*/ FROM /*c4*/ col1 /*c5*/)`);
    });

    function testExtractUnits(units: string[]) {
      units.forEach((unit) => {
        it(`supports extracting ${unit}`, () => {
          testExpr(`extract(${unit} from my_col)`);
        });
      });
    }

    dialect("bigquery", () => {
      testExtractUnits([
        "MICROSECOND",
        "MILLISECOND",
        "SECOND",
        "MINUTE",
        "HOUR",
        "DAYOFWEEK",
        "DAY",
        "DAYOFYEAR",
        "WEEK",
        "ISOWEEK",
        "MONTH",
        "QUARTER",
        "YEAR",
        "ISOYEAR",
        "DATE",
        "TIME",
      ]);
    });

    dialect("mysql", () => {
      testExtractUnits([
        "MICROSECOND",
        "SECOND",
        "MINUTE",
        "HOUR",
        "DAY",
        "WEEK",
        "MONTH",
        "QUARTER",
        "YEAR",
        "SECOND_MICROSECOND",
        "MINUTE_MICROSECOND",
        "MINUTE_SECOND",
        "HOUR_MICROSECOND",
        "HOUR_SECOND",
        "HOUR_MINUTE",
        "DAY_MICROSECOND",
        "DAY_SECOND",
        "DAY_MINUTE",
        "DAY_HOUR",
        "YEAR_MONTH",
      ]);
    });

    it("parses extract() expression", () => {
      expect(parseExpr(`EXTRACT(SECOND FROM col1)`)).toMatchInlineSnapshot(`
        {
          "args": {
            "expr": {
              "expr": {
                "column": {
                  "name": "col1",
                  "text": "col1",
                  "type": "identifier",
                },
                "type": "column_ref",
              },
              "fromKw": {
                "name": "FROM",
                "text": "FROM",
                "type": "keyword",
              },
              "type": "extract_from",
              "unitKw": {
                "name": "SECOND",
                "text": "SECOND",
                "type": "keyword",
              },
            },
            "type": "paren_expr",
          },
          "extractKw": {
            "name": "EXTRACT",
            "text": "EXTRACT",
            "type": "keyword",
          },
          "type": "extract_expr",
        }
      `);
    });
  });

  dialect("sqlite", () => {
    it("does not support extract expression", () => {
      expect(() => parseExpr("EXTRACT(DAY FROM col)")).toThrowError();
    });
  });
});
