import { dialect, testWc } from "../test_utils";

describe("DECLARE..BEGIN..END", () => {
  dialect("plpgsql", () => {
    it("supports DECLARE..BEGIN..END", () => {
      testWc(`
        DECLARE
          my_var INT;
        BEGIN
          SELECT 1;
        END
      `);
    });

    it("supports DECLARE with DEFAULT", () => {
      testWc(`
        DECLARE
          my_var1 INT DEFAULT 1;
          my_var2 TEXT := 'hello';
          my_var3 BOOLEAN = TRUE;
        BEGIN
          SELECT 1;
        END
      `);
    });

    it("supports CONSTANT", () => {
      testWc(`
        DECLARE
          my_var1 CONSTANT INT;
        BEGIN
          SELECT 1;
        END
      `);
    });

    it("supports NOT NULL", () => {
      testWc(`
        DECLARE
          my_var1 INT NOT NULL = 1;
        BEGIN
          SELECT 1;
        END
      `);
    });

    it("supports COLLATE", () => {
      testWc(`
        DECLARE
          my_var1 TEXT COLLATE "utf8_general_ci" = 'hello';
        BEGIN
          SELECT 1;
        END
      `);
    });
  });

  dialect(["sqlite", "bigquery", "postgresql", "mysql", "mariadb"], () => {
    it("does not support DECLARE blocks", () => {
      expect(() => test(`DECLARE x = 10; BEGIN SELECT 1; END`)).toThrow();
    });
  });
});
