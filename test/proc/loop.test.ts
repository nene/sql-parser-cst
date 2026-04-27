import { dialect, parse, testWc } from "../test_utils";

describe("LOOP", () => {
  dialect(["mysql", "mariadb", "bigquery", "plpgsql"], () => {
    it("supports basic infinite LOOP", () => {
      testWc(`
        LOOP
          SELECT 1;
        END LOOP
      `);
    });
  });

  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("supports begin & end label", () => {
      testWc(`
        my_label: LOOP
          SELECT 1;
        END LOOP my_label
      `);
    });
  });

  dialect(["plpgsql"], () => {
    it("supports begin & end label", () => {
      testWc(`
        <<my_label>> LOOP
          SELECT 1;
        END LOOP my_label
      `);
    });

    it("supports empty loop body", () => {
      testWc(`
        LOOP END LOOP
      `);
    });
  });

  dialect(["sqlite", "postgresql"], () => {
    it("does not support LOOP statement", () => {
      expect(() => parse("LOOP SELECT 1; END LOOP")).toThrow();
    });
  });
});
