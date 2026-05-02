import { dialect, notDialect, test, testWc } from "../test_utils";

describe("PERFORM statement", () => {
  dialect("plpgsql", () => {
    it("supports PERFORM instead of SELECT keyword in SELECT-statement", () => {
      testWc("PERFORM * FROM person WHERE age < 15");
    });

    it("supports PERFORM + UNION", () => {
      testWc("PERFORM 1 UNION SELECT 2");
    });
  });

  notDialect("plpgsql", () => {
    it("does not support PERFORM-statement", () => {
      expect(() => test("PERFORM * FROM person WHERE age < 15")).toThrow();
    });
  });
});
