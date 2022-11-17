import { dialect, test } from "./test_utils";

describe("explain", () => {
  dialect(["sqlite", "mysql"], () => {
    it("supports explaining of SELECT statement", () => {
      test("EXPLAIN SELECT * FROM foo");
      test("EXPLAIN /*c1*/ SELECT * FROM foo");
    });

    it("supports explaining of INSERT/UPDATE/DELETE statements", () => {
      test("EXPLAIN INSERT INTO foo VALUES (1, 2, 3)");
      test("EXPLAIN UPDATE tbl SET name = 'unknown'");
      test("EXPLAIN DELETE FROM tbl WHERE id = 2");
    });
  });

  dialect("sqlite", () => {
    it("supports EXPLAIN QUERY PLAN", () => {
      test("EXPLAIN QUERY PLAN SELECT 1");
      test("EXPLAIN /*c1*/ QUERY /*c2*/ PLAN /*c3*/ SELECT 1");
    });
  });

  dialect("mysql", () => {
    it("supports DESCRIBE/DESC instead of EXPLAIN", () => {
      test("DESCRIBE SELECT 1");
      test("DESC SELECT 1");
    });

    it("supports EXPLAIN ANALYZE", () => {
      test("EXPLAIN ANALYZE SELECT 1");
      test("DESCRIBE /*c1*/ ANALYZE /*c2*/ SELECT 1");
    });
  });

  dialect("bigquery", () => {
    it("does not support EXPLAIN", () => {
      expect(() => test("EXPLAIN SELECT * FROM foo")).toThrowError();
    });
  });
});
