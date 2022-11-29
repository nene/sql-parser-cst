import { dialect, parse, test } from "../test_utils";

describe("truncate table", () => {
  dialect("bigquery", () => {
    it("supports TRUNCATE TABLE statement", () => {
      test("TRUNCATE TABLE tbl");
      test("TRUNCATE TABLE db.tbl");
      test("TRUNCATE /*c1*/ TABLE /*c2*/ tbl");
    });
  });

  dialect(["sqlite", "mysql"], () => {
    it("does not support TRUNCATE TABLE", () => {
      expect(() => parse("TRUNCATE TABLE foo")).toThrowError();
    });
  });
});
