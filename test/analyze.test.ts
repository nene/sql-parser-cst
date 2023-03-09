import { dialect, test, testWc } from "./test_utils";

describe("analyze", () => {
  dialect("sqlite", () => {
    it("supports plain ANALYZE", () => {
      test("ANALYZE");
    });

    it("supports ANALYZE table_name", () => {
      testWc("ANALYZE my_tbl");
      test("ANALYZE schm.my_tbl");
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
      expect(() => test("ANALYZE my_tbl")).toThrowError();
    });
  });
});
