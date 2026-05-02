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

  dialect(["sqlite", "postgresql"], () => {
    it("does not support BEGIN..END block", () => {
      expect(() => parse("BEGIN SELECT 1; END")).toThrow();
    });
  });
});
