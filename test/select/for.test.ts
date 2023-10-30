import { dialect, testClauseWc } from "../test_utils";

describe("select FOR", () => {
  dialect("postgresql", () => {
    it("supports FOR clause with different lock strengths", () => {
      testClauseWc("FOR UPDATE");
      testClauseWc("FOR NO KEY UPDATE");
      testClauseWc("FOR SHARE");
      testClauseWc("FOR KEY SHARE");
    });

    it("supports OF table_name, ...", () => {
      testClauseWc("FOR UPDATE OF tbl1");
      testClauseWc("FOR UPDATE OF tbl1, tbl2, tbl3");
    });

    it("supports NOWAIT / SKIP LOCKED", () => {
      testClauseWc("FOR UPDATE NOWAIT");
      testClauseWc("FOR UPDATE SKIP LOCKED");
    });

    it("supports combination of OF and SKIP LOCKED", () => {
      testClauseWc("FOR KEY SHARE OF my_table SKIP LOCKED");
    });
  });

  dialect(["mysql", "mariadb", "sqlite", "bigquery"], () => {
    it("ignore empty testsuite", () => {
      expect(true).toBeTruthy();
    });
  });
});
