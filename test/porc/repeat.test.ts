import { dialect, parse, testWc } from "../test_utils";

describe("REPEAT", () => {
  dialect(["bigquery", "mysql"], () => {
    it("supports REPEAT statement", () => {
      testWc(`
        REPEAT
          SET x = x + 1;
        UNTIL x > 10 END REPEAT
      `);
    });
  });

  dialect("sqlite", () => {
    it("does not support REPEAT statement", () => {
      expect(() => parse("REPEAT SELECT 1; UNTIL true END REPEAT")).toThrowError();
    });
  });
});
