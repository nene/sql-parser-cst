import { dialect, notDialect, test, testWc } from "../../test_utils";

describe("select FROM + TABLESAMPLE", () => {
  dialect("bigquery", () => {
    it("supports TABLESAMPLE", () => {
      testWc("SELECT * FROM my_table TABLESAMPLE SYSTEM ( 10 PERCENT )");
    });

    it("supports TABLESAMPLE inside JOIN", () => {
      test("SELECT * FROM tbl1 TABLESAMPLE SYSTEM (1 percent) JOIN tbl2");
    });
  });

  notDialect("bigquery", () => {
    it("does not support TABLESAMPLE", () => {
      expect(() => test("SELECT * FROM tbl TABLESAMPLE SYSTEM (5 PERCENT)")).toThrowError();
    });
  });
});
