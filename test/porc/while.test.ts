import { dialect, parse, testWc } from "../test_utils";

describe("WHILE", () => {
  dialect(["bigquery", "mysql"], () => {
    it("supports WHILE statement", () => {
      testWc(`
        WHILE x < 10 DO
          SET x = x + 1;
          SELECT x;
        END WHILE
      `);
    });
  });

  dialect("sqlite", () => {
    it("does not support WHILE statement", () => {
      expect(() => parse("WHILE true DO SELECT 1; END WHILE")).toThrowError();
    });
  });
});
