import { dialect, parse, testWc } from "../test_utils";

describe("LOOP", () => {
  dialect(["bigquery", "mysql"], () => {
    it("supports basic infinite LOOP", () => {
      testWc(`
        LOOP
          SET x = x + 1;
        END LOOP
      `);
    });
  });

  dialect("sqlite", () => {
    it("does not support LOOP statement", () => {
      expect(() => parse("LOOP SELECT 1; END LOOP")).toThrowError();
    });
  });
});
