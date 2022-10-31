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

    describe("CREATE VIRTUAL TABLE", () => {
      it("supports CREATE VIRTUAL TABLE statement", () => {
        test("CREATE VIRTUAL TABLE tbl USING my_module");
        test("CREATE VIRTUAL TABLE schm.tbl USING my_module");
        test("CREATE VIRTUAL TABLE IF NOT EXISTS tbl USING my_module");
        test("CREATE VIRTUAL TABLE tbl USING my_module(1, 2, 3)");
        test(
          `CREATE /*c1*/ VIRTUAL /*c2*/ TABLE /*c3*/ IF /*c4*/ NOT /*c5*/ EXISTS /*c6*/ tbl /*c7*/
          USING /*c8*/ my_module /*c9*/ (/*c10*/ 1 /*c11*/,/*c12*/ 2 /*c13*/)`
        );
      });
    });
  });

  // This is need for the non-SQLite case, otherwise Jest will fail because of empty test suite
  it("ignore empty testsuite", () => {
    expect(true).toBeTruthy();
  });
});
