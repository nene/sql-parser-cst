import { dialect, parse, testWc } from "../test_utils";

describe("CALL", () => {
  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("supports CALL statement", () => {
      testWc(`CALL my_schema.proc_name(1, 2)`);
    });
  });

  dialect("sqlite", () => {
    it("does not support WHILE statement", () => {
      expect(() => parse("CALL foo()")).toThrowError();
    });
  });
});
