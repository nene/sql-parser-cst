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
  });

  // This is need for the non-SQLite case, otherwise Jest will fail because of empty test suite
  it("ignore empty testsuite", () => {
    expect(true).toBeTruthy();
  });
});
