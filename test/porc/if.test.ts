import { dialect, parse, testWc } from "../test_utils";

describe("IF", () => {
  dialect(["bigquery", "mysql"], () => {
    it("supports basic IF statement", () => {
      testWc(`IF true THEN SELECT 1; END IF`);
    });

    it("supports ELSE", () => {
      testWc(`
        IF true THEN
          SET x = 1;
          SELECT x;
        ELSE
          SET x = 2;
          SELECT x;
        END IF
      `);
    });

    it("supports ELSEIF", () => {
      testWc(`
        IF x > 100 THEN
          SET y = 'ancient';
        ELSEIF x > 75 THEN
          SET y = 'old';
        ELSEIF x > 50 THEN
          SET y = 'normal';
        ELSEIF x > 25 THEN
          SET y = 'young';
        ELSE
          SET y = 'childish';
        END IF
      `);
    });

    it("supports nested IF", () => {
      testWc(`
        IF x > 100 THEN
          IF y < 10 THEN
            SELECT 1;
          END IF;
        END IF
      `);
    });
  });

  dialect("sqlite", () => {
    it("does not support IF statement", () => {
      expect(() => parse("IF true THEN SELECT 1; END IF")).toThrowError();
    });
  });
});
