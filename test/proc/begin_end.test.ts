import { dialect, parse, test, testWc } from "../test_utils";

describe("BEGIN..END", () => {
  dialect(["mysql", "mariadb", "bigquery", "plpgsql"], () => {
    it("supports BEGIN..END block", () => {
      testWc(`
        BEGIN
          SELECT 1;
          SELECT 2;
        END
      `);
    });

    it("supports nested BEGIN..END block", () => {
      testWc(`
        BEGIN
          SELECT 1;
          BEGIN
            SELECT 2;
          END;
        END
      `);
    });
  });

  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("supports transactions inside BEGIN..END", () => {
      testWc(`
        BEGIN
          BEGIN;
          SELECT 1;
          COMMIT;
        END
      `);
    });
  });

  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("supports begin label: (with colon)", () => {
      test(`
        my_label: BEGIN
          SELECT 1;
        END
      `);
      testWc(`
        my_label : BEGIN
          SELECT 1;
        END
      `);
    });

    it("supports end label", () => {
      testWc(`
        my_label: BEGIN
          SELECT 1;
        END my_label
      `);
    });
  });

  dialect(["plpgsql"], () => {
    it("supports begin <<label>> (with chevrons)", () => {
      test(`
        <<my_label>> BEGIN
          SELECT 1;
        END
      `);
      testWc(`
        << my_label >> BEGIN
          SELECT 1;
        END
      `);
    });

    it("supports end label", () => {
      testWc(`
        <<my_label>> BEGIN
          SELECT 1;
        END my_label
      `);
    });
  });

  dialect(["bigquery", "plpgsql"], () => {
    it("supports empty BEGIN..END", () => {
      testWc(`BEGIN END;`);
    });
  });

  dialect(["bigquery", "plpgsql"], () => {
    it("supports BEGIN..EXCEPTION..END", () => {
      testWc(`
        BEGIN
          SELECT 1;
          SELECT 2;
        EXCEPTION WHEN ERROR THEN
          SELECT 'err1';
          SELECT 'err2';
        END
      `);
    });

    it("supports empty EXCEPTION block", () => {
      testWc(`BEGIN SELECT 1; EXCEPTION WHEN ERROR THEN END;`);
    });

    it("supports empty EXCEPTION within empty BEGIN..END", () => {
      testWc(`BEGIN EXCEPTION WHEN ERROR THEN END;`);
    });
  });

  dialect("plpgsql", () => {
    it("supports error condition names", () => {
      testWc(`
        BEGIN
        EXCEPTION
          WHEN division_by_zero THEN
            SELECT 'err1';
          WHEN "my_custom_error" THEN
            SELECT 'err2';
          WHEN others THEN
            SELECT 'err3';
        END
      `);
    });

    it("supports SQLSTATE error codes", () => {
      testWc(`
        BEGIN
        EXCEPTION
          WHEN SQLSTATE '22012' THEN
            SELECT 'err1';
          WHEN SQLSTATE 'P0001' THEN
            SELECT 'err2';
        END
      `);
    });

    it("supports multiple error conditions", () => {
      testWc(`
        BEGIN
        EXCEPTION WHEN SQLSTATE '22012' OR division_by_zero OR my_custom_error THEN
          SELECT 'err1';
        END
      `);
    });
  });

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

  dialect(["sqlite", "postgresql"], () => {
    it("does not support BEGIN..END block", () => {
      expect(() => parse("BEGIN SELECT 1; END")).toThrow();
    });
  });
});
