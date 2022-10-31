import { dialect, test } from "./test_utils";

describe("analyze", () => {
  dialect("sqlite", () => {
    it("supports plain ANALYZE", () => {
      test("ANALYZE");
    });

    it("supports ANALYZE table_name", () => {
      test("ANALYZE my_tbl");
      test("ANALYZE schm.my_tbl");
      test("ANALYZE /*c1*/ my_tbl");
    });
  });

  dialect("mysql", () => {
    it("supports ANALYZE TABLE table_name", () => {
      test("ANALYZE TABLE my_tbl");
      test("ANALYZE TABLE schm.my_tbl");
      test("ANALYZE /*c1*/ TABLE /*c2*/ my_tbl");
    });

    it("supports ANALYZE TABLE with multiple tables", () => {
      test("ANALYZE TABLE tbl1, tbl2, tbl3");
      test("ANALYZE TABLE /*c1*/ tbl1 /*c2*/,/*c3*/ tbl2");
    });
  });
});
