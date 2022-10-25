import { dialect, test } from "./test_utils";

describe("insert into", () => {
  it("supports INSERT INTO with values", () => {
    test("INSERT INTO tbl VALUES (1, 2, 3)");
  });

  it("supports INSERT INTO with columns and values", () => {
    test("INSERT INTO tbl (col1, col2, col3) VALUES (1, 2, 3)");
    test(`INSERT /*c1*/ INTO /*c2*/ tbl /*c3*/ (/*c4*/ col1 /*c5*/,/*c6*/ col2 /*c7*/) /*c8*/
          VALUES /*c9*/ (/*c10*/ 1 /*c11*/,/*c12*/ 2 /*c13*/)`);
  });

  it("supports multiple values", () => {
    test("INSERT INTO tbl VALUES (1, 2, 3), (4, 5, 6), (7, 8, 9)");
    test("INSERT INTO tbl VALUES (1) /*c1*/,/*c2*/ (2)");
  });

  it("supports insert from query", () => {
    test("INSERT INTO tbl SELECT 1, 2, 3");
    test("INSERT INTO tbl (col1, col2, col3) SELECT 1, 2, 3");
    test("INSERT INTO tbl (SELECT 1, 2, 3)");
    test("INSERT INTO tbl /*c1*/ SELECT 1");
  });

  dialect("mysql", () => {
    it("supports INSERT without INTO", () => {
      test("INSERT tbl VALUES (1, 2, 3)");
    });
  });
});
