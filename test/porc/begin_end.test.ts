import { dialect, parse, testWc } from "../test_utils";

describe("BEGIN..END", () => {
  dialect(["bigquery", "mysql"], () => {
    it("supports BEGIN..END block", () => {
      testWc(`
        BEGIN
          SELECT 1;
          SELECT 2;
        END
      `);
    });

    it("supports nested BEGIN..END block", () => {
      testWc(`
        BEGIN
          SELECT 1;
          BEGIN
            SELECT 2;
          END;
        END
      `);
    });
  });

  dialect("bigquery", () => {
    it("supports BEGIN..EXCEPTION..END", () => {
      testWc(`
        BEGIN
          SELECT 1;
          SELECT 2;
        EXCEPTION WHEN ERROR THEN
          SELECT 'err1';
          SELECT 'err2';
        END
      `);
    });
  });

  dialect("sqlite", () => {
    it("does not support BEGIN..END block", () => {
      expect(() => parse("BEGIN SELECT 1; END")).toThrowError();
    });
  });
});
