import { dialect, test } from "./test_utils";

describe("delete from", () => {
  it("supports DELETE FROM without WHERE", () => {
    test("DELETE FROM tbl");
    test("DELETE FROM db.tbl");
  });

  it("supports DELETE FROM .. WHERE", () => {
    test("DELETE FROM tbl WHERE x > 0");
    test("DELETE /*c1*/ FROM /*c2*/ tbl /*c3*/ WHERE /*c4*/ true");
  });

  it("supports aliased table name", () => {
    test("DELETE FROM tbl AS t");
    test("DELETE FROM tbl t");
    test("DELETE FROM tbl /*c1*/ AS /*c2*/ t");
  });

  dialect("sqlite", () => {
    it("supports WITH ... DELETE FROM ..", () => {
      test("WITH subsel AS (SELECT 1) DELETE FROM tbl");
      test("WITH subsel AS (SELECT 1) /*c*/ DELETE FROM tbl");
    });
  });

  dialect("sqlite", () => {
    it("supports DELETE ... RETURNING ...", () => {
      test("DELETE FROM tbl WHERE x > 0 RETURNING col1, col2");
      test("DELETE FROM tbl WHERE x > 0 /*c1*/ RETURNING /*c2*/ *");
    });
  });
});
