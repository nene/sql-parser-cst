import { dialect, parse, testWc } from "../test_utils";

describe("REPEAT", () => {
  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("supports REPEAT statement", () => {
      testWc(`
        REPEAT
          SET x = x + 1;
        UNTIL x > 10 END REPEAT
      `);
    });

    it("supports begin label", () => {
      testWc(`
        my_label: REPEAT
          SELECT 1;
          UNTIL x > 10
        END REPEAT
      `);
    });

    it("supports end label", () => {
      testWc(`
        my_label: REPEAT
          SELECT 1;
          UNTIL x > 10
        END REPEAT my_label
      `);
    });
  });

  dialect("sqlite", () => {
    it("does not support REPEAT statement", () => {
      expect(() => parse("REPEAT SELECT 1; UNTIL true END REPEAT")).toThrowError();
    });
  });

  dialect("postgresql", () => {
    it("TODO:postgres", () => {
      expect(true).toBe(true);
    });
  });
});
