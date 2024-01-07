import { dialect, parseStmt, testWc } from "../test_utils";

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

  dialect("postgresql", () => {
    it("supports ONLY inheritance modifier on table name", () => {
      testWc("DELETE FROM ONLY tbl");
      testWc("DELETE FROM ONLY tbl AS t");
    });
    it("supports * inheritance modifier on table name", () => {
      testWc("DELETE FROM tbl *");
      testWc("DELETE FROM tbl * AS t");
    });
  });

  dialect(["sqlite", "mysql", "postgresql"], () => {
    it("supports WITH ... DELETE FROM ..", () => {
      testWc("WITH subsel AS (SELECT 1) DELETE FROM tbl");
    });
  });

  dialect(["sqlite", "mysql", "mariadb"], () => {
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

  dialect(["mysql", "mariadb"], () => {
    it("supports deleting from PARTITION", () => {
      testWc("DELETE FROM tbl PARTITION (foo, bar) WHERE id = 2");
    });

    it("supports deleting from aliased table PARTITION", () => {
      testWc("DELETE FROM tbl AS my_table PARTITION (foo, bar) WHERE id = 2");
    });

    it("parses PARTITION as partitioned_table node", () => {
      const stmt = parseStmt("DELETE FROM tbl PARTITION (foo, bar) WHERE id = 2");
      if (stmt.type !== "delete_stmt") throw new Error("Expected delete_stmt");
      const deleteClause = stmt.clauses[0];
      if (deleteClause.type !== "delete_clause") throw new Error("Expected delete_clause");
      expect(deleteClause.tables.items[0].type).toBe("partitioned_table");
    });
  });

  dialect(["mysql", "mariadb"], () => {
    describe("multi table delete", () => {
      it("supports DELETE .. FROM ..", () => {
        testWc("DELETE tbl1, tbl2 FROM tbl1 JOIN tbl2 WHERE tbl1.id = tbl2.id");
      });

      it("supports DELETE FROM .. USING ..", () => {
        testWc("DELETE FROM tbl1, tbl2 USING tbl1 JOIN tbl2 WHERE tbl1.id = tbl2.id");
      });

      it("supports .* syntax for tables", () => {
        testWc("DELETE tbl1.*, tbl2.* FROM tbl1 JOIN tbl2");
        testWc("DELETE FROM tbl1.*, tbl2.* USING tbl1 JOIN tbl2");
      });
    });
  });
});
