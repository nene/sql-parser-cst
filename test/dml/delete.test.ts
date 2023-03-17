import { dialect, testWc } from "../test_utils";

describe("delete from", () => {
  it("supports DELETE FROM without WHERE", () => {
    testWc("DELETE FROM tbl");
    testWc("DELETE FROM db.tbl");
  });

  it("supports DELETE FROM .. WHERE", () => {
    testWc("DELETE FROM tbl WHERE x > 0");
  });

  dialect("bigquery", () => {
    it("supports DELETE without FROM", () => {
      testWc("DELETE tbl WHERE x > 0");
    });
  });

  it("supports aliased table name", () => {
    testWc("DELETE FROM tbl AS t");
    testWc("DELETE FROM tbl t");
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports hints", () => {
      testWc("DELETE LOW_PRIORITY FROM tbl");
      testWc("DELETE QUICK IGNORE FROM tbl");
    });
  });

  dialect("sqlite", () => {
    it("supports INDEXED BY & NOT INDEXED modifiers on table name", () => {
      testWc("DELETE FROM my_table INDEXED BY my_idx");
      testWc("DELETE FROM my_table NOT INDEXED");
    });
  });

  dialect("sqlite", () => {
    it("supports WITH ... DELETE FROM ..", () => {
      testWc("WITH subsel AS (SELECT 1) DELETE FROM tbl");
    });
  });

  dialect("sqlite", () => {
    it("supports DELETE ... RETURNING ...", () => {
      testWc("DELETE FROM tbl WHERE x > 0 RETURNING col1, col2");
      testWc("DELETE FROM tbl WHERE x > 0 RETURNING *");
    });

    it("supports DELETE ... LIMIT ...", () => {
      testWc("DELETE FROM tbl LIMIT 10");
    });

    it("supports DELETE ... ORDER BY ... LIMIT ...", () => {
      testWc("DELETE FROM tbl ORDER BY name LIMIT 10, 100");
    });
  });
});
