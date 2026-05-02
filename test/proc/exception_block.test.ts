import { dialect, testWc } from "../test_utils";

describe("BEGIN..EXCEPTION..END", () => {
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

  dialect(["sqlite", "postgresql", "mysql", "mariadb"], () => {
    it("does not support exception blocks", () => {
      expect(() => test(`BEGIN SELECT 1; EXCEPTION WHEN ERROR THEN END`)).toThrow();
    });
  });
});
