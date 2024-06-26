import { dialect, parse, testWc } from "../test_utils";

describe("SET", () => {
  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("supports SET statement", () => {
      testWc("SET x = 10");
    });

    dialect("bigquery", () => {
      it("supports struct destructuting assignment", () => {
        testWc("SET (x, y, z) = (1, 'foo', false)");
      });
    });

    dialect(["mysql", "mariadb"], () => {
      it("supports multiple assignments", () => {
        testWc("SET x = 1, y = 'foo', z = false");
      });
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports SET statement", () => {
      testWc("SET @x = 10");
    });

    it("supports multiple assignments", () => {
      testWc("SET @x = 1, @y = 'foo', @z = false");
    });

    it("supports scalar subquery", () => {
      testWc("SET @sum_age = (SELECT SUM(age) FROM user)");
    });
  });

  dialect("sqlite", () => {
    it("does not support SET statement", () => {
      expect(() => parse("SET x = 1")).toThrowError();
    });
  });

  dialect("postgresql", () => {
    it.skip("TODO:postgres", () => {
      expect(true).toBe(true);
    });
  });
});
