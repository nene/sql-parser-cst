import { dialect, test, testWc } from "../test_utils";

describe("function", () => {
  dialect("bigquery", () => {
    describe("CREATE FUNCTION", () => {
      it("supports basic CREATE FUNCTION", () => {
        testWc("CREATE FUNCTION foo ( ) AS (1 * 2)");
        testWc("CREATE FUNCTION foo.bar.baz ( ) AS (1)");
      });

      it("supports parameters", () => {
        testWc("CREATE FUNCTION multiplicate ( x INT , y INT ) AS (x * y)");
      });

      it("supports OR REPLACE", () => {
        testWc("CREATE OR REPLACE FUNCTION foo() AS (1)");
      });

      it("supports TEMPORARY FUNCTION", () => {
        testWc("CREATE TEMP FUNCTION foo() AS (1)");
        testWc("CREATE TEMPORARY FUNCTION foo() AS (1)");
      });

      it("supports IF NOT EXISTS", () => {
        testWc("CREATE FUNCTION IF NOT EXISTS foo() AS (1)");
      });

      it("supports RETURNS", () => {
        testWc("CREATE FUNCTION foo() RETURNS INT AS (1)");
      });

      describe("JS functions", () => {
        it("supports LANGUAGE JS", () => {
          testWc("CREATE FUNCTION foo() RETURNS INT LANGUAGE js AS 'return(x*y);'");
        });

        it("supports DETERMINISTIC / NOT DETERMINISTIC", () => {
          testWc(`CREATE FUNCTION foo() RETURNS STRING DETERMINISTIC LANGUAGE js AS 'return("");'`);
          testWc(`CREATE FUNCTION foo() RETURNS INT NOT DETERMINISTIC LANGUAGE js AS 'return(0);'`);
        });
      });
    });
  });

  dialect(["mysql", "sqlite"], () => {
    it("does not support CREATE FUNCTION", () => {
      expect(() => test("CREATE FUNCTION foo() AS (1 + 2)")).toThrowError();
    });
  });
});
