import { dialect, testWc } from "./test_utils";

describe("SQLite specific statements", () => {
  dialect("sqlite", () => {
    describe("ATTACH DATABASE", () => {
      it("supports ATTACH DATABASE statement", () => {
        testWc("ATTACH DATABASE 'dbs/business.db' AS business_schema");
        testWc("ATTACH 'dbs/business.db' AS business_schema");
      });
    });

    describe("DETACH DATABASE", () => {
      it("supports DETACH DATABASE statement", () => {
        testWc("DETACH DATABASE my_schema");
        testWc("DETACH my_schema");
      });
    });

    describe("VACUUM", () => {
      it("supports VACUUM statement", () => {
        testWc("VACUUM");
        testWc("VACUUM my_schema");
        testWc("VACUUM INTO '/my/file.db'");
        testWc("VACUUM my_schema INTO '/my/file.db'");
      });
    });

    describe("REINDEX", () => {
      it("supports REINDEX statement", () => {
        testWc("REINDEX");
        testWc("REINDEX tbl");
        testWc("REINDEX my_schema.tbl");
      });
    });

    describe("PRAGMA", () => {
      it("supports quering PRAGMA name", () => {
        testWc("PRAGMA function_list");
        testWc("PRAGMA my_schema.foreign_key_check");
      });

      it("supports setting PRAGMA value", () => {
        testWc("PRAGMA encoding = 'UTF-8'");
        testWc("PRAGMA my_schema.synchronous = 2");
      });

      it("supports setting PRAGMA value with keyword", () => {
        testWc("PRAGMA my_schema.journal_mode = DELETE");
      });

      it("supports calling PRAGMA function", () => {
        testWc("PRAGMA optimize(0x02)");
        testWc("PRAGMA my_schema.integrity_check(my_table)");
      });

      it("supports calling PRAGMA function with keyword", () => {
        testWc("PRAGMA my_schema.wal_checkpoint(FULL)");
      });
    });
  });

  // This is need for the non-SQLite case, otherwise Jest will fail because of empty test suite
  it("ignore empty testsuite", () => {
    expect(true).toBeTruthy();
  });
});
