import { dialect, testWc } from "./test_utils";

describe("vacuum", () => {
  dialect(["sqlite", "postgresql", "plpgsql"], () => {
    it("supports plain VACUUM statement", () => {
      testWc("VACUUM");
    });
  });

  dialect("sqlite", () => {
    it("supports VACUUM schema_name", () => {
      testWc("VACUUM my_schema");
    });

    it("supports VACUUM INTO file", () => {
      testWc("VACUUM INTO '/my/file.db'");
      testWc("VACUUM my_schema INTO '/my/file.db'");
    });
  });

  dialect(["postgresql", "plpgsql"], () => {
    it("supports VACUUM table_name", () => {
      testWc("VACUUM my_table");
    });

    it("supports VACUUM with multiple tables", () => {
      testWc("VACUUM tbl1, tbl2");
    });

    it("supports VACUUM table_name with inheritance modifiers", () => {
      testWc("VACUUM my_table *, ONLY my_table");
    });

    it("supports VACUUM table_name with columns", () => {
      testWc("VACUUM my_table (col1, col2), my_table * (col3)");
    });

    describe("options", () => {
      it("supports value-less options", () => {
        testWc("VACUUM ( FULL, FREEZE, VERBOSE ) my_table");
      });

      it("supports boolean options", () => {
        testWc(`
          VACUUM (
            FULL true,
            FREEZE false,
            VERBOSE ON,
            ANALYZE OFF,
            DISABLE_PAGE_SKIPPING 0,
            SKIP_LOCKED 1,
            PROCESS_MAIN true,
            PROCESS_TOAST false,
            TRUNCATE ON,
            SKIP_DATABASE_STATS OFF,
            ONLY_DATABASE_STATS 0
          ) my_table`);
      });

      it("supports INDEX_CLEANUP option", () => {
        testWc("VACUUM (INDEX_CLEANUP AUTO) my_table");
        testWc("VACUUM (INDEX_CLEANUP ON) my_table");
        testWc("VACUUM (INDEX_CLEANUP OFF) my_table");
      });

      it("supports PARALLEL option", () => {
        testWc("VACUUM (PARALLEL 4) my_table");
      });

      it("supports BUFFER_USAGE_LIMIT <size> option", () => {
        testWc("VACUUM (BUFFER_USAGE_LIMIT 128) my_table");
      });
    });
  });

  dialect(["mysql", "mariadb", "bigquery", "postgresql", "plpgsql"], () => {
    it("does not support VACUUM statement", () => {
      expect(() => test("VACUUM")).toThrow();
    });
  });
});
