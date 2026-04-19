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

    it("supports begin & end label", () => {
      testWc(`
        my_label: FOR x IN (SELECT 1) DO
          SELECT 1;
        END FOR my_label
      `);
    });
  });

  dialect(["plpgsql"], () => {
    describe("FOR IN query LOOP", () => {
      it("supports basic FOR..IN query", () => {
        testWc(`
          FOR x IN SELECT col FROM tbl LOOP
            SELECT x;
          END LOOP
        `);
      });

      it("supports begin & end label", () => {
        testWc(`
          <<my_label>> FOR x IN SELECT 1 LOOP
            SELECT x;
          END LOOP my_label
        `);
      });
    });

    describe("FOR IN range LOOP", () => {
      it("supports basic range", () => {
        testWc(`
          FOR x IN 1 .. 10 LOOP
            SELECT x;
          END LOOP
        `);
      });

      it("supports complex expressions", () => {
        testWc(`
          FOR x IN 1 + 5 .. 60 / 2 - sqrt(3) LOOP
            SELECT x;
          END LOOP
        `);
      });

      it("supports REVERSE", () => {
        testWc(`
          FOR x IN REVERSE 6 .. 3 LOOP
            SELECT x;
          END LOOP
        `);
      });

      it("supports begin & end label", () => {
        testWc(`
          <<my_label>> FOR x IN 1..10 LOOP
            SELECT x;
          END LOOP my_label
        `);
      });
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
