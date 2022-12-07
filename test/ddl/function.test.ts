import { dialect, test } from "../test_utils";

describe("function", () => {
  dialect("bigquery", () => {
    describe("CREATE FUNCTION", () => {
      it("supports basic CREATE FUNCTION", () => {
        test("CREATE FUNCTION foo() AS (1 * 2)");
        test("CREATE /*c1*/ FUNCTION /*c2*/ foo /*c3*/ ( /*c4*/ ) /*c5*/ AS /*c6*/ (1 * 2)");
      });
    });
  });

  dialect(["mysql", "sqlite"], () => {
    it("does not support CREATE FUNCTION", () => {
      expect(() => test("CREATE FUNCTION foo() AS (1 + 2)")).toThrowError();
    });
  });
});
