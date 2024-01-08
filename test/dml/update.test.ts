import { dialect, parseStmt, testWc } from "../test_utils";

describe("update", () => {
  it("supports UPDATE .. SET without where", () => {
    testWc("UPDATE tbl SET col1 = 15, col2 = 'hello'");
    testWc("UPDATE db.tbl SET x=2");
  });

  it("supports UPDATE .. SET .. WHERE", () => {
    testWc("UPDATE tbl SET x=1, y=2, z=3 WHERE id = 8");
  });

  it("supports assignment of subselect", () => {
    testWc("UPDATE tbl SET x = (SELECT 1) WHERE id = 3");
  });

  // This is seemingly ambiguous syntax,
  // which was explicitly not supported in the original parser code.
  // But there's actually no ambiguity and its supported by actual databases.
  it("supports comparison inside assignment expression", () => {
    testWc("UPDATE tbl SET flag = col=1 OR col=2");
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports updating multiple tables", () => {
      testWc("UPDATE items, month SET items.price = month.price");
    });
  });

  it("supports aliased table names", () => {
    testWc("UPDATE items AS i SET price = 0");
    testWc("UPDATE items i SET price = 0");
  });

  dialect("sqlite", () => {
    it("supports INDEXED BY & NOT INDEXED modifiers on table name", () => {
      testWc("UPDATE my_table INDEXED BY my_idx SET x=1");
      testWc("UPDATE my_table NOT INDEXED SET x=1");
    });
  });

  dialect("postgresql", () => {
    it("supports ONLY inheritance modifier on table name", () => {
      testWc("UPDATE ONLY tbl SET x=1");
      testWc("UPDATE ONLY tbl AS t SET x=1");
    });
    it("supports * inheritance modifier on table name", () => {
      testWc("UPDATE tbl * SET x=1");
      testWc("UPDATE tbl * AS t SET x=1");
    });
  });

  dialect(["mysql", "mariadb", "postgresql"], () => {
    it("supports setting explicit default values", () => {
      testWc("UPDATE person SET age = DEFAULT");
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports hints", () => {
      testWc("UPDATE LOW_PRIORITY tbl SET x=1");
      testWc("UPDATE IGNORE tbl SET x=1");
    });
  });

  dialect("sqlite", () => {
    it("supports UPDATE OR ... options", () => {
      testWc("UPDATE OR ABORT tbl SET x=1");
      testWc("UPDATE OR FAIL tbl SET x=1");
      testWc("UPDATE OR IGNORE tbl SET x=1");
      testWc("UPDATE OR REPLACE tbl SET x=1");
      testWc("UPDATE OR ROLLBACK tbl SET x=1");
    });
  });

  dialect(["sqlite", "postgresql"], () => {
    it("supports assigning list of values to list of columns", () => {
      testWc("UPDATE tbl SET (id, name) = (1, 'John')");
    });
  });
  dialect("postgresql", () => {
    it("supports assigning ROW constructor to list of values", () => {
      testWc("UPDATE tbl SET (id, name) = ROW (1, 'John')");
      testWc("UPDATE tbl SET (id, name) = ROW (1, DEFAULT)");
    });

    it("correctly parses assigning of ROW constructor", () => {
      const stmt = parseStmt("UPDATE tbl SET (a, b) = ROW (1, 2)");
      if (stmt.type !== "update_stmt") {
        throw new Error("Expected update_stmt");
      }
      const set = stmt.clauses[1];
      if (set.type !== "set_clause") {
        throw new Error("Expected set_clause");
      }
      const row = set.assignments.items[0].expr;
      expect(row.type).toBe("row_constructor");
    });
  });

  dialect(["sqlite", "postgresql"], () => {
    it("supports WITH ... UPDATE ...", () => {
      testWc("WITH subsel AS (SELECT 1) UPDATE tbl SET col1 = 2");
      testWc("WITH subsel AS (SELECT 1) /*c*/ UPDATE tbl SET col1 = 2");
    });
  });

  dialect(["sqlite", "bigquery", "postgresql"], () => {
    it("supports UPDATE ... FROM ...", () => {
      testWc("UPDATE tbl SET col1 = 2 FROM foo JOIN bar USING (id) WHERE foo.age > 0");
    });
  });

  dialect(["sqlite", "postgresql"], () => {
    it("supports UPDATE ... RETURNING ...", () => {
      testWc("UPDATE tbl SET col1 = 2 RETURNING *");
      testWc("UPDATE tbl SET col1 = 2 RETURNING col1, col2");
      testWc("UPDATE tbl SET col1 = 2 RETURNING col1 AS a, col2 b");
    });
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("supports UPDATE ... ORDER BY ...", () => {
      testWc("UPDATE tbl SET col1 = 2 ORDER BY col1");
    });
    it("supports UPDATE ... LIMIT ...", () => {
      testWc("UPDATE tbl SET col1 = 2 LIMIT 20");
    });
  });

  dialect("postgresql", () => {
    it("supports WHERE CURRENT OF", () => {
      testWc("UPDATE tbl SET col1 = 2 WHERE CURRENT OF cursor_name");
    });
  });
});
