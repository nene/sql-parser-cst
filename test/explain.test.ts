import { dialect, test, testWc } from "./test_utils";

describe("explain", () => {
  dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
    it("supports explaining of SELECT statement", () => {
      testWc("EXPLAIN SELECT * FROM foo");
    });

    it("supports explaining of INSERT/UPDATE/DELETE statements", () => {
      test("EXPLAIN INSERT INTO foo VALUES (1, 2, 3)");
      test("EXPLAIN UPDATE tbl SET name = 'unknown'");
      test("EXPLAIN DELETE FROM tbl WHERE id = 2");
    });
  });

  dialect("sqlite", () => {
    it("supports EXPLAIN QUERY PLAN", () => {
      testWc("EXPLAIN QUERY PLAN SELECT 1");
    });
  });

  dialect(["mysql", "mariadb", "postgresql"], () => {
    it("supports EXPLAIN ANALYZE", () => {
      testWc("EXPLAIN ANALYZE SELECT 1");
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports DESCRIBE/DESC instead of EXPLAIN", () => {
      testWc("DESCRIBE SELECT 1");
      testWc("DESC SELECT 1");
    });

    it("supports DESCRIBE ANALYZE", () => {
      testWc("DESCRIBE ANALYZE SELECT 1");
    });
  });

  dialect("bigquery", () => {
    it("does not support EXPLAIN", () => {
      expect(() => test("EXPLAIN SELECT * FROM foo")).toThrowError();
    });
  });
});
