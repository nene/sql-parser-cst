import { dialect, parse, testWc } from "../test_utils";

describe("CASE", () => {
  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("supports basic CASE statement", () => {
      testWc(`
        CASE animal
          WHEN 1 THEN
            SET x = 'dog';
          WHEN 2 THEN
            SET x = 'cat';
          ELSE
            SET x = 'mouse';
          END CASE
      `);
    });

    it("supports searched CASE statement", () => {
      testWc(`
        CASE
          WHEN animal=1 THEN
            SELECT 'dog';
          WHEN animal=2 THEN
            SELECT 'cat';
          ELSE
            SELECT 'mouse';
        END CASE
      `);
    });

    it("supports CASE statement without else", () => {
      testWc(`
        CASE
          WHEN animal=1 THEN
            SET x = 'dog';
            SELECT x;
        END CASE
      `);
    });
  });

  dialect("sqlite", () => {
    it("does not support CASE statement", () => {
      expect(() => parse("CASE foo WHEN 1 THEN SELECT 1; END CASE")).toThrowError();
    });
  });

  dialect("postgresql", () => {
    it.skip("TODO:postgres", () => {
      expect(true).toBe(true);
    });
  });
});
