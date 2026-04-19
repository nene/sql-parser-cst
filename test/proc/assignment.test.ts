import { dialect, parse, testWc } from "../test_utils";

describe("Assignment", () => {
  dialect(["plpgsql"], () => {
    it("supports basic assignment statement", () => {
      testWc("x = 10");
      testWc("x := 10");
    });

    it("supports complex expression on right side", () => {
      testWc("x := sqrt(2) / pi");
    });
  });

  dialect(["mysql", "mariadb", "bigquery", "sqlite", "postgresql"], () => {
    it("does not support assignment statement", () => {
      expect(() => parse("x = 1")).toThrow();
    });
  });
});
