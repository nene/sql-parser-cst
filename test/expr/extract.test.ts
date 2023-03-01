import { dialect, parseExpr, testExpr, testExprWc } from "../test_utils";

describe("extract()", () => {
  dialect(["bigquery", "mysql"], () => {
    it("supports extract() expression", () => {
      testExprWc(`EXTRACT ( DAY FROM col1 )`);
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

      it("supports extracting WEEK with weekday parameter", () => {
        testExpr(`extract(WEEK(MONDAY) from my_col)`);
        testExpr(`extract(WEEK(TUESDAY) from my_col)`);
        testExpr(`extract(WEEK(WEDNESDAY) from my_col)`);
        testExpr(`extract(WEEK(THURSDAY) from my_col)`);
        testExpr(`extract(WEEK(FRIDAY) from my_col)`);
        testExpr(`extract(WEEK(SATURDAY) from my_col)`);
        testExprWc(`extract(WEEK ( SUNDAY ) from my_col)`);
      });
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
                "name": "col1",
                "text": "col1",
                "type": "identifier",
              },
              "fromKw": {
                "name": "FROM",
                "text": "FROM",
                "type": "keyword",
              },
              "type": "extract_from",
              "unit": {
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
