import { dialect, parse, test, testWc } from "../test_utils";

describe("ASSERT", () => {
  dialect(["bigquery", "plpgsql"], () => {
    it("supports basic ASSERT statement", () => {
      test(`ASSERT x > 0`);
    });
  });

  dialect("bigquery", () => {
    it("supports ASSERT with AS message", () => {
      testWc("ASSERT ((SELECT count(*) FROM tbl) > 10) AS 'Table must contain at least 10 rows!'");
    });
  });

  dialect("plpgsql", () => {
    it("supports ASSERT with , message", () => {
      testWc(`ASSERT x > 0, 'x must be positive'`);
    });
  });

  dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
    it("does not support ASSERT statement", () => {
      expect(() => parse("ASSERT x > 0")).toThrow();
    });
  });
});
