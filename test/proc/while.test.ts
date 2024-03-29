import { dialect, parse, testWc } from "../test_utils";

describe("WHILE", () => {
  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("supports WHILE statement", () => {
      testWc(`
        WHILE x < 10 DO
          SET x = x + 1;
          SELECT x;
        END WHILE
      `);
    });

    it("supports begin label", () => {
      testWc(`
        my_label: WHILE x < 10 DO
          SELECT 1;
        END WHILE
      `);
    });

    it("supports end label", () => {
      testWc(`
        my_label: WHILE x < 10 DO
          SELECT 1;
        END WHILE my_label
      `);
    });
  });

  dialect("sqlite", () => {
    it("does not support WHILE statement", () => {
      expect(() => parse("WHILE true DO SELECT 1; END WHILE")).toThrowError();
    });
  });

  dialect("postgresql", () => {
    it.skip("TODO:postgres", () => {
      expect(true).toBe(true);
    });
  });
});
