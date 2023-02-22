import { dialect, test } from "./test_utils";

describe("SQLite specific statements", () => {
  dialect("sqlite", () => {
    describe("ATTACH DATABASE", () => {
      it("supports ATTACH DATABASE statement", () => {
        test("ATTACH DATABASE 'dbs/business.db' AS business_schema");
        test("ATTACH 'dbs/business.db' AS business_schema");
        test("ATTACH /*c1*/ DATABASE /*c2*/ 'dbs/business.db' /*c3*/ AS /*c4*/ business_schema");
      });
    });

    describe("DETACH DATABASE", () => {
      it("supports DETACH DATABASE statement", () => {
        test("DETACH DATABASE my_schema");
        test("DETACH my_schema");
        test("DETACH /*c1*/ DATABASE /*c2*/ my_schema");
      });
    });

    describe("VACUUM", () => {
      it("supports VACUUM statement", () => {
        test("VACUUM");
        test("VACUUM my_schema");
        test("VACUUM INTO '/my/file.db'");
        test("VACUUM my_schema INTO '/my/file.db'");
        test("VACUUM /*c1*/ my_schema /*c2*/ INTO /*c3*/ '/my/file.db'");
      });
    });

    describe("REINDEX", () => {
      it("supports REINDEX statement", () => {
        test("REINDEX");
        test("REINDEX tbl");
        test("REINDEX my_schema.tbl");
        test("REINDEX /*c1*/ tbl");
      });
    });

    describe("PRAGMA", () => {
      it("supports quering PRAGMA name", () => {
        test("PRAGMA function_list");
        test("PRAGMA my_schema.foreign_key_check");
        test("PRAGMA /*c1*/ function_list");
      });

      it("supports setting PRAGMA value", () => {
        test("PRAGMA encoding = 'UTF-8'");
        test("PRAGMA my_schema.synchronous = 2");
        test("PRAGMA /*c1*/ encoding /*c2*/ = /*c3*/ 'UTF-16'");
      });

      it("supports setting PRAGMA value with keyword", () => {
        test("PRAGMA my_schema.journal_mode = DELETE");
      });

      it("supports calling PRAGMA function", () => {
        test("PRAGMA optimize(0x02)");
        test("PRAGMA my_schema.integrity_check(my_table)");
        test("PRAGMA /*c1*/ table_list /*c1*/( /*c2*/ my_tbl /*c3*/)");
      });

      it("supports calling PRAGMA function with keyword", () => {
        test("PRAGMA my_schema.wal_checkpoint(FULL)");
      });
    });
  });

  // This is need for the non-SQLite case, otherwise Jest will fail because of empty test suite
  it("ignore empty testsuite", () => {
    expect(true).toBeTruthy();
  });
});
