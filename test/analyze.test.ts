import { dialect, test, testWc } from "./test_utils";

describe("analyze", () => {
  dialect(["sqlite", "postgresql", "plpgsql"], () => {
    it("supports plain ANALYZE", () => {
      test("ANALYZE");
    });

    it("supports ANALYZE table_name", () => {
      testWc("ANALYZE my_tbl");
      test("ANALYZE schm.my_tbl");
    });
  });

  dialect(["postgresql", "plpgsql"], () => {
    it("supports ANALYZE with multiple tables", () => {
      testWc("ANALYZE tbl1, tbl2, tbl3");
    });

    it("supports ONLY and * inheritance modifiers", () => {
      testWc("ANALYZE tbl1 *, ONLY tbl2");
    });

    it("supports columns after table name", () => {
      testWc("ANALYZE tbl1 (col1, col2), tbl2 (col3)");
      testWc("ANALYZE ONLY tbl1 (col1, col2), tbl2 * (col3)");
    });

    it("supports ANALYZE VERBOSE", () => {
      testWc("ANALYZE VERBOSE tbl1");
    });

    describe("options", () => {
      it("supports value-less options", () => {
        testWc("ANALYZE ( VERBOSE, SKIP_LOCKED, BUFFER_USAGE_LIMIT ) my_table");
      });

      it("supports boolean options", () => {
        testWc("ANALYZE (VERBOSE true) my_table");
        testWc("ANALYZE (SKIP_LOCKED false) my_table");
        testWc("ANALYZE (VERBOSE ON, SKIP_LOCKED OFF) my_table");
        testWc("ANALYZE (VERBOSE 1, SKIP_LOCKED 0) my_table");
      });

      it("supports BUFFER_USAGE_LIMIT <size> option", () => {
        testWc("ANALYZE (BUFFER_USAGE_LIMIT 128) my_table");
      });
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports ANALYZE TABLE table_name", () => {
      testWc("ANALYZE TABLE my_tbl");
      test("ANALYZE TABLE schm.my_tbl");
    });

    it("supports ANALYZE TABLE with multiple tables", () => {
      testWc("ANALYZE TABLE tbl1, tbl2, tbl3");
    });
  });

  dialect("bigquery", () => {
    it("does not support ANALYZE", () => {
      expect(() => test("ANALYZE my_tbl")).toThrow();
    });
  });
});
