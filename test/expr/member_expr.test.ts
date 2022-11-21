import { dialect, parseExpr, testExpr } from "../test_utils";

describe("member_expr", () => {
  dialect("bigquery", () => {
    it("supports simple array subscript", () => {
      testExpr(`my_array[0]`);
      testExpr(`my_array[1+2]`);
      testExpr(`my_array /*c1*/ [ /*c1*/ 8 /*c1*/]`);
    });
  });

  dialect(["mysql", "sqlite"], () => {
    it("does not support array subscripts", () => {
      expect(() => parseExpr("my_array[0]")).toThrowError();
    });
  });
});
