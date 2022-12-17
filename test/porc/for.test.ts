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
  });

  dialect(["sqlite", "mysql"], () => {
    it("does not support FOR..IN statement", () => {
      expect(() => parse("FOR x IN (SELECT 1) DO SELECT x; END FOR")).toThrowError();
    });
  });
});