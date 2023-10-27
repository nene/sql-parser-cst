import { dialect, parse, testWc } from "../test_utils";

describe("RETURN", () => {
  dialect("bigquery", () => {
    it("supports RETURN statement without value", () => {
      testWc(`RETURN`);
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports RETURN statement with value", () => {
      testWc(`RETURN 5 + 5`);
    });
  });

  dialect("sqlite", () => {
    it("does not support RETURN statement", () => {
      expect(() => parse("RETURN")).toThrowError();
    });
  });

  dialect("postgresql", () => {
    it("TODO:postgres", () => {
      expect(true).toBe(true);
    });
  });
});
