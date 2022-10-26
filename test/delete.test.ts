import { test } from "./test_utils";

describe("delete from", () => {
  it("supports DELETE FROM without WHERE", () => {
    test("DELETE FROM tbl");
    test("DELETE FROM db.tbl");
  });

  it("supports DELETE FROM .. WHERE", () => {
    test("DELETE FROM tbl WHERE x > 0");
    test("DELETE /*c1*/ FROM /*c2*/ tbl /*c3*/ WHERE /*c4*/ true");
  });
});
