import { dialect, parse, testWc } from "../test_utils";

describe("DECLARE", () => {
  dialect(["bigquery", "mysql"], () => {
    it("supports DECLARE statement", () => {
      testWc("DECLARE my_var INT");
    });

    it("supports default value", () => {
      testWc("DECLARE my_var DATE DEFAULT 5 + 8");
    });

    it("supports multiple variables", () => {
      testWc("DECLARE foo, bar , baz INT");
    });

    dialect("bigquery", () => {
      it("supports DECLARE without type", () => {
        testWc("DECLARE my_var");
        testWc("DECLARE foo, bar");
        testWc("DECLARE foo DEFAULT 1");
      });
    });
  });

  dialect("sqlite", () => {
    it("does not support DECLARE statement", () => {
      expect(() => parse("DECLARE x INT")).toThrowError();
    });
  });
});
