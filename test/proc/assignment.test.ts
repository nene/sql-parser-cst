import { dialect, parse, testWc } from "../test_utils";

describe("Assignment", () => {
  dialect(["plpgsql"], () => {
    it("supports basic assignment statement", () => {
      testWc("x = 10");
      testWc("x := 10");
    });

    it("supports complex expression on right side", () => {
      testWc("x := sqrt(2) / pi");
    });

    it("supports record field assignment", () => {
      testWc("foo.bar := 15");
    });

    it("supports array index assignment", () => {
      testWc("foo[3] := 15");
    });

    it("supports array slice assignment", () => {
      testWc("foo[1:5] := 25");
    });

    it("supports long chain assignment", () => {
      testWc("foo[n].bar.baz := 42");
    });
  });

  dialect(["mysql", "mariadb", "bigquery", "sqlite", "postgresql"], () => {
    it("does not support assignment statement", () => {
      expect(() => parse("x = 1")).toThrow();
    });
  });
});
