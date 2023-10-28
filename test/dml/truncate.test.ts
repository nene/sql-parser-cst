import { dialect, parse, testWc } from "../test_utils";

describe("truncate table", () => {
  dialect(["bigquery", "mysql", "mariadb"], () => {
    it("supports TRUNCATE TABLE statement", () => {
      testWc("TRUNCATE TABLE tbl");
      testWc("TRUNCATE TABLE db.tbl");
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports TRUNCATE statement without TABLE", () => {
      testWc("TRUNCATE my_table");
    });
  });

  dialect(["sqlite"], () => {
    it("does not support TRUNCATE TABLE", () => {
      expect(() => parse("TRUNCATE TABLE foo")).toThrowError();
    });
  });

  dialect("postgresql", () => {
    it.skip("TODO:postgres", () => {
      expect(true).toBe(true);
    });
  });
});
