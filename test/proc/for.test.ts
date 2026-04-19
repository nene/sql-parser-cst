import { dialect, parse, testWc } from "../test_utils";

describe("FOR..IN", () => {
  dialect(["bigquery"], () => {
    it("supports FOR..IN statement with SELECT", () => {
      testWc(`
        FOR x IN (SELECT col FROM tbl) DO
          SELECT x;
        END FOR
      `);
    });

    it("supports FOR..IN statement with some other table expression", () => {
      testWc(`
        FOR x IN (my_schema.table_valued_func()) DO
          SELECT x;
        END FOR
      `);
    });

    it("supports begin label", () => {
      testWc(`
        my_label: FOR x IN (SELECT 1) DO
          SELECT 1;
        END FOR
      `);
    });

    it("supports end label", () => {
      testWc(`
        my_label: FOR x IN (SELECT 1) DO
          SELECT 1;
        END FOR my_label
      `);
    });
  });

  dialect(["plpgsql"], () => {
    it("supports FOR..IN..LOOP statement with SELECT", () => {
      testWc(`
        FOR x IN SELECT col FROM tbl LOOP
          SELECT x;
        END LOOP
      `);
    });
  });

  dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
    it("does not support FOR..IN statement", () => {
      expect(() => parse("FOR x IN (SELECT 1) DO SELECT x; END FOR")).toThrow();
    });
    it("does not support FOR..IN..LOOP statement", () => {
      expect(() => parse("FOR x IN SELECT 1 LOOP SELECT x; END LOOP")).toThrow();
    });
  });
});
