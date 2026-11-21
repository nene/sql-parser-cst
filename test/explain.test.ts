import { dialect, test, testWc } from "./test_utils";

describe("explain", () => {
  dialect(["mysql", "mariadb", "sqlite", "postgresql", "plpgsql"], () => {
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

  dialect(["mysql", "mariadb", "postgresql", "plpgsql"], () => {
    it("supports EXPLAIN ANALYZE", () => {
      testWc("EXPLAIN ANALYZE SELECT 1");
    });
  });

  dialect(["postgresql", "plpgsql"], () => {
    it("supports EXPLAIN [ANALYZE] VERBOSE", () => {
      testWc("EXPLAIN VERBOSE SELECT 1");
      testWc("EXPLAIN ANALYZE VERBOSE SELECT 1");
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

  dialect(["postgresql", "plpgsql"], () => {
    describe("options", () => {
      it("supports single option", () => {
        testWc("EXPLAIN (ANALYZE) SELECT 1");
        testWc("EXPLAIN (VERBOSE) SELECT 1");
      });

      it("supports value-less options", () => {
        testWc(
          `EXPLAIN (
            ANALYZE,
            VERBOSE,
            COSTS,
            SETTINGS,
            GENERIC_PLAN,
            BUFFERS,
            SERIALIZE,
            WAL,
            TIMING,
            SUMMARY,
            MEMORY,
            IO
          ) SELECT 1`
        );
      });

      it("supports boolean values", () => {
        testWc(`
          EXPLAIN (
            ANALYZE true,
            VERBOSE false,
            COSTS true,
            SETTINGS false,
            GENERIC_PLAN true,
            BUFFERS false,
            WAL true,
            TIMING false,
            SUMMARY true,
            MEMORY false,
            IO true
          ) SELECT 1`);
      });

      it("supports ON/OFF boolean values", () => {
        testWc("EXPLAIN ( ANALYZE ON, VERBOSE OFF ) SELECT 1");
      });

      it("supports 0/1 boolean values", () => {
        testWc("EXPLAIN ( ANALYZE 1, VERBOSE 0 ) SELECT 1");
      });

      it("supports FORMAT", () => {
        testWc("EXPLAIN (FORMAT TEXT) SELECT 1");
        testWc("EXPLAIN (FORMAT XML) SELECT 1");
        testWc("EXPLAIN (FORMAT JSON) SELECT 1");
        testWc("EXPLAIN (FORMAT YAML) SELECT 1");
      });

      it("supports SERIALIZE", () => {
        // Note: In practice, SERIALIZE option only works together with ANALYZE
        testWc("EXPLAIN (ANALYZE, SERIALIZE NONE) SELECT 1");
        testWc("EXPLAIN (ANALYZE, SERIALIZE TEXT) SELECT 1");
        testWc("EXPLAIN (ANALYZE, SERIALIZE BINARY) SELECT 1");
      });
    });
  });

  dialect("bigquery", () => {
    it("does not support EXPLAIN", () => {
      expect(() => test("EXPLAIN SELECT * FROM foo")).toThrow();
    });
  });
});
