import { dialect, parseStmt, test, testWc } from "./test_utils";

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
    it("supports EXPLAIN VERBOSE", () => {
      testWc("EXPLAIN VERBOSE SELECT 1");
      testWc("EXPLAIN ANALYZE VERBOSE SELECT 1");
    });

    describe("explain options", () => {
      it("supports single option", () => {
        testWc("EXPLAIN (ANALYZE) SELECT 1");
        testWc("EXPLAIN (VERBOSE) SELECT 1");
      });

      it("supports multiple options", () => {
        testWc("EXPLAIN ( ANALYZE, BUFFERS, COSTS false ) SELECT 1");
      });

      it("supports all option names", () => {
        testWc(
          "EXPLAIN (ANALYZE, VERBOSE, COSTS, SETTINGS, GENERIC_PLAN, BUFFERS, SERIALIZE, " +
            "WAL, TIMING, SUMMARY, MEMORY, FORMAT TEXT) SELECT 1"
        );
      });

      it("supports boolean values", () => {
        testWc("EXPLAIN (ANALYZE true, TIMING false) SELECT 1");
        testWc("EXPLAIN (ANALYZE ON, TIMING OFF) SELECT 1");
        testWc("EXPLAIN (ANALYZE 1, TIMING 0) SELECT 1");
      });

      it("supports FORMAT", () => {
        testWc("EXPLAIN (FORMAT TEXT) SELECT 1");
        testWc("EXPLAIN (FORMAT XML) SELECT 1");
        testWc("EXPLAIN (FORMAT JSON) SELECT 1");
        testWc("EXPLAIN (FORMAT YAML) SELECT 1");
        testWc("EXPLAIN (FORMAT 'json') SELECT 1");
      });

      it("supports SERIALIZE", () => {
        testWc("EXPLAIN (ANALYZE, SERIALIZE NONE) SELECT 1");
        testWc("EXPLAIN (ANALYZE, SERIALIZE TEXT) SELECT 1");
        testWc("EXPLAIN (ANALYZE, SERIALIZE BINARY) SELECT 1");
      });

      it("supports options with non-SELECT statements", () => {
        testWc("EXPLAIN (ANALYZE, BUFFERS) UPDATE tbl SET x = 1");
        testWc("EXPLAIN (ANALYZE, BUFFERS) CREATE TABLE foo AS SELECT 1");
      });

      it("still supports EXPLAIN of parenthesized SELECT", () => {
        testWc("EXPLAIN (SELECT 1)");
      });

      it("parses options", () => {
        expect(parseStmt("EXPLAIN (ANALYZE, FORMAT JSON) SELECT 1")).toMatchInlineSnapshot(`
          {
            "explainKw": {
              "name": "EXPLAIN",
              "text": "EXPLAIN",
              "type": "keyword",
            },
            "options": {
              "expr": {
                "items": [
                  {
                    "name": {
                      "name": "ANALYZE",
                      "text": "ANALYZE",
                      "type": "keyword",
                    },
                    "type": "explain_option",
                    "value": undefined,
                  },
                  {
                    "name": {
                      "name": "FORMAT",
                      "text": "FORMAT",
                      "type": "keyword",
                    },
                    "type": "explain_option",
                    "value": {
                      "name": "JSON",
                      "text": "JSON",
                      "type": "keyword",
                    },
                  },
                ],
                "type": "list_expr",
              },
              "type": "paren_expr",
            },
            "statement": {
              "clauses": [
                {
                  "columns": {
                    "items": [
                      {
                        "text": "1",
                        "type": "number_literal",
                        "value": 1,
                      },
                    ],
                    "type": "list_expr",
                  },
                  "modifiers": [],
                  "selectKw": {
                    "name": "SELECT",
                    "text": "SELECT",
                    "type": "keyword",
                  },
                  "type": "select_clause",
                },
              ],
              "type": "select_stmt",
            },
            "type": "explain_stmt",
          }
        `);
      });
    });
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("does not support EXPLAIN options", () => {
      expect(() => test("EXPLAIN (ANALYZE) SELECT 1")).toThrow();
      expect(() => test("EXPLAIN VERBOSE SELECT 1")).toThrow();
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
      expect(() => test("EXPLAIN SELECT * FROM foo")).toThrow();
    });
  });
});
