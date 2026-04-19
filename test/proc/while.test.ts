import { dialect, parse, testWc } from "../test_utils";

describe("WHILE", () => {
  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("supports WHILE statement", () => {
      testWc(`
        WHILE x < 10 DO
          SELECT x + 1;
          SELECT x;
        END WHILE
      `);
    });

    it("supports begin & end label", () => {
      testWc(`
        my_label: WHILE x < 10 DO
          SELECT 1;
        END WHILE my_label
      `);
    });
  });

  dialect(["plpgsql"], () => {
    it("supports WHILE .. LOOP statement", () => {
      testWc(`
        WHILE x < 10 LOOP
          SELECT x + 1;
          SELECT x;
        END LOOP
      `);
    });

    it("supports begin & end label", () => {
      testWc(`
        <<my_label>> WHILE x < 10 LOOP
          SELECT 1;
        END LOOP my_label
      `);
    });
  });

  dialect(["sqlite", "postgresql"], () => {
    it("does not support WHILE statement", () => {
      expect(() => parse("WHILE true DO SELECT 1; END WHILE")).toThrow();
    });
    it("does not support WHILE .. LOOP statement", () => {
      expect(() => parse("WHILE true LOOP SELECT 1; END LOOP")).toThrow();
    });
  });
});
