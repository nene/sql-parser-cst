import { dialect, parse, testWc } from "../test_utils";

describe("truncate table", () => {
  dialect(["bigquery", "mysql", "mariadb", "postgresql"], () => {
    it("supports TRUNCATE TABLE statement", () => {
      testWc("TRUNCATE TABLE tbl");
      testWc("TRUNCATE TABLE db.tbl");
    });
  });

  dialect(["mysql", "mariadb", "postgresql"], () => {
    it("supports TRUNCATE statement without TABLE", () => {
      testWc("TRUNCATE my_table");
    });
  });

  dialect("postgresql", () => {
    it("supports ONLY inheritance modifier on table name", () => {
      testWc("TRUNCATE TABLE ONLY tbl");
    });
    it("supports * inheritance modifier on table name", () => {
      testWc("TRUNCATE TABLE tbl *");
    });
  });

  dialect(["sqlite"], () => {
    it("does not support TRUNCATE TABLE", () => {
      expect(() => parse("TRUNCATE TABLE foo")).toThrowError();
    });
  });
});
