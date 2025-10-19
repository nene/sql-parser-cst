import { dialect, parse, testWc } from "../test_utils";

describe("DO", () => {
  dialect(["postgresql"], () => {
    it("supports DO statement", () => {
      testWc(`DO $$
        BEGIN
          EXECUTE 'GRANT ALL ON my_table TO webuser';
        END
      $$`);
    });

    it("supports DO with LANGUAGE clause", () => {
      testWc(`DO LANGUAGE plpgsql $$
        BEGIN
          EXECUTE 'GRANT ALL ON my_table TO webuser';
        END
      $$`);
    });
  });

  dialect(["bigquery", "mariadb", "mysql", "sqlite"], () => {
    it("does not support DO statement", () => {
      expect(() => parse("DO 'SELECT 1;'")).toThrowError();
    });
  });
});
