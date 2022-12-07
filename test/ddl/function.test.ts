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
    });
  });

  dialect(["mysql", "sqlite"], () => {
    it("does not support CREATE FUNCTION", () => {
      expect(() => test("CREATE FUNCTION foo() AS (1 + 2)")).toThrowError();
    });
  });
});
