import { dialect, parse, testWc } from "../test_utils";

describe("WHILE", () => {
  dialect(["mysql", "mariadb", "bigquery", "plpgsql"], () => {
    it("supports WHILE statement", () => {
      testWc(`
        WHILE x < 10 DO
          SELECT x + 1;
          SELECT x;
        END WHILE
      `);
    });
  });

  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("supports begin & end label", () => {
      testWc(`
        my_label: WHILE x < 10 DO
          SELECT 1;
        END WHILE my_label
      `);
    });
  });

  dialect(["plpgsql"], () => {
    it("supports begin & end label", () => {
      testWc(`
        <<my_label>> WHILE x < 10 DO
          SELECT 1;
        END WHILE my_label
      `);
    });
  });

  dialect(["sqlite", "postgresql"], () => {
    it("does not support WHILE statement", () => {
      expect(() => parse("WHILE true DO SELECT 1; END WHILE")).toThrow();
    });
  });
});
