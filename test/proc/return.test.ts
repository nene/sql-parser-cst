import { dialect, parse, testWc } from "../test_utils";

describe("RETURN", () => {
  dialect(["bigquery", "plpgsql"], () => {
    it("supports RETURN statement without value", () => {
      testWc(`RETURN`);
    });
  });

  dialect(["mysql", "mariadb", "plpgsql"], () => {
    it("supports RETURN statement with value", () => {
      testWc(`RETURN 5 + 5`);
    });

    it("supports RETURN with multiple values", () => {
      testWc(`RETURN (1, 2, 3)`);
    });
  });

  dialect(["sqlite", "postgresql"], () => {
    it("does not support RETURN statement", () => {
      expect(() => parse("RETURN")).toThrow();
    });
  });
});
