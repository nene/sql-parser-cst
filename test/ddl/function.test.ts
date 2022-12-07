import { dialect, test, testWc } from "../test_utils";

describe("function", () => {
  dialect("bigquery", () => {
    describe("CREATE FUNCTION", () => {
      it("supports basic CREATE FUNCTION", () => {
        testWc("CREATE FUNCTION foo ( ) AS (1 * 2)");
      });
    });
  });

  dialect(["mysql", "sqlite"], () => {
    it("does not support CREATE FUNCTION", () => {
      expect(() => test("CREATE FUNCTION foo() AS (1 + 2)")).toThrowError();
    });
  });
});
