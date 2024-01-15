import { dialect, withComments, test, parseStmt } from "../test_utils";

describe("table constraints", () => {
  function testTblConstWc(constraint: string) {
    test(`CREATE TABLE t (${withComments(constraint)})`);
  }

  function parseTblConstraint(constraint: string) {
    const stmt = parseStmt(`CREATE TABLE t (${constraint})`);
    if (stmt.type !== "create_table_stmt") {
      throw new Error("Expected create_table_stmt");
    }
    if (!stmt.columns) {
      throw new Error("Expected columns");
    }
    return stmt.columns.expr.items[0];
  }

  function testWithIndexParameters(constraint: string) {
    testTblConstWc(`${constraint} INCLUDE (col1, col2)`);
    testTblConstWc(`${constraint} WITH (fillfactor = 70, autovacuum_enabled)`);
    testTblConstWc(`${constraint} USING INDEX TABLESPACE my_tablespace`);
  }

  dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
    it("supports multiple table constraints inside CREATE TABLE", () => {
      test(`CREATE TABLE tbl (
        id INT,
        PRIMARY KEY (id),
        UNIQUE (id)
      )`);
    });

    describe("primary key", () => {
      it("PRIMARY KEY", () => {
        testTblConstWc("PRIMARY KEY (id)");
        testTblConstWc("PRIMARY KEY ( id, name )");
      });

      dialect("sqlite", () => {
        it("supports ASC/DESC in primary key columns", () => {
          testTblConstWc("PRIMARY KEY (id ASC, name DESC)");
        });
        it("supports COLLATE in primary key columns", () => {
          testTblConstWc("PRIMARY KEY (name COLLATE utf8)");
        });
      });

      dialect("postgresql", () => {
        it("supports index parameters", () => {
          testWithIndexParameters("PRIMARY KEY (id)");
        });
      });
    });

    describe("unique", () => {
      it("UNIQUE", () => {
        testTblConstWc("UNIQUE (id)");
      });
      dialect(["mysql", "mariadb"], () => {
        it("UNIQUE KEY/INDEX", () => {
          testTblConstWc("UNIQUE KEY (id, name)");
          testTblConstWc("UNIQUE INDEX (id)");
        });
      });
      dialect(["postgresql"], () => {
        it("NULLS [NOT] DISTINCT", () => {
          testTblConstWc("UNIQUE NULLS DISTINCT (id)");
          testTblConstWc("UNIQUE NULLS NOT DISTINCT (id, name)");
        });

        it("supports index parameters", () => {
          testWithIndexParameters("UNIQUE (id)");
        });
      });
    });

    it("CHECK", () => {
      testTblConstWc("CHECK (col > 10)");
    });

    describe("FOREIGN KEY", () => {
      it("basic FOREIGN KEY", () => {
        testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id)");
        testTblConstWc("FOREIGN KEY (id, name) REFERENCES tbl2 (id, name)");
      });

      dialect(["sqlite", "postgresql"], () => {
        it("column names are optional in REFERENCES-clause", () => {
          testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2");
        });
      });
      dialect(["mysql", "mariadb"], () => {
        it("supports index name", () => {
          testTblConstWc("FOREIGN KEY my_fk (id) REFERENCES tbl2 (id)");
        });
      });

      it("supports ON DELETE/UPDATE actions", () => {
        testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) ON UPDATE RESTRICT");
        testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) ON DELETE CASCADE");
        testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) ON UPDATE SET NULL");
        testTblConstWc(
          "FOREIGN KEY (id) REFERENCES tbl2 (id) ON DELETE SET DEFAULT ON UPDATE NO ACTION"
        );
      });
      dialect("postgresql", () => {
        it("supports columns list with SET NULL and SET DEFAULT", () => {
          testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) ON DELETE SET NULL (id)");
          testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) ON DELETE SET DEFAULT (id, name)");
        });
      });

      it("supports MATCH types", () => {
        testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) MATCH FULL");
        testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) MATCH PARTIAL");
        testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) MATCH SIMPLE");
      });

      it("supports combining MATCH type and ON UPDATE/DELETE", () => {
        testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) MATCH FULL ON UPDATE CASCADE");
        testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) ON DELETE SET NULL MATCH SIMPLE");
      });
    });

    describe("exclusion constraint", () => {
      dialect("postgresql", () => {
        it("supports EXCLUDE constraint", () => {
          testTblConstWc("EXCLUDE (room_id WITH =, tsrange(booking_start, booking_end) WITH &&)");
          testTblConstWc("EXCLUDE (room_id WITH OPERATOR(=))");
        });

        it("supports USING clause", () => {
          testTblConstWc("EXCLUDE USING gist ( col WITH = )");
        });

        it("supports WHERE clause", () => {
          testTblConstWc("EXCLUDE (col WITH =) WHERE (true)");
        });

        it("supports index parameters", () => {
          testWithIndexParameters("EXCLUDE (col WITH =)");
        });
        it("supports index parameters before WHERE clause", () => {
          testTblConstWc("EXCLUDE (col WITH =) INCLUDE (col2) WHERE (true)");
        });
        it("supports full index specification syntax: opclass, dir, nulls", () => {
          testTblConstWc("EXCLUDE (col ASC NULLS FIRST WITH =, col2 my.opclass DESC WITH >)");
        });
      });
    });

    describe("constraint modifiers", () => {
      dialect(["sqlite", "postgresql"], () => {
        it("supports deferrability of foreign keys", () => {
          testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) DEFERRABLE");
          testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) NOT DEFERRABLE");
          testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) DEFERRABLE INITIALLY DEFERRED");
          testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) DEFERRABLE INITIALLY IMMEDIATE");
        });
      });

      dialect(["postgresql"], () => {
        it("supports deferrability of all constraints", () => {
          testTblConstWc("CHECK (x > 10) NOT DEFERRABLE");
          testTblConstWc("UNIQUE (col) INITIALLY DEFERRED");
          testTblConstWc("PRIMARY KEY (id, name) INITIALLY IMMEDIATE");
        });

        it("supports NO INHERIT modifier on CHECK() constraint", () => {
          testTblConstWc("CHECK (x > 10) NO INHERIT");
        });
      });
    });

    dialect(["mysql", "mariadb"], () => {
      it("INDEX / KEY", () => {
        testTblConstWc("KEY (id)");
        testTblConstWc("INDEX (id)");
        testTblConstWc("KEY (id, name)");
      });

      it("parses KEY and INDEX as constraint_index", () => {
        expect(parseTblConstraint("KEY (id)").type).toBe("constraint_index");
        expect(parseTblConstraint("INDEX (id)").type).toBe("constraint_index");
      });

      it("FULLTEXT INDEX", () => {
        testTblConstWc("FULLTEXT (name)");
        testTblConstWc("SPATIAL (name)");
        testTblConstWc("FULLTEXT INDEX (name)");
        testTblConstWc("SPATIAL INDEX (name, name2)");
        testTblConstWc("FULLTEXT KEY (name, name2)");
        testTblConstWc("SPATIAL KEY (name)");
      });
    });

    dialect("sqlite", () => {
      it("supports ON CONFLICT clause", () => {
        testTblConstWc("PRIMARY KEY (id) ON CONFLICT ROLLBACK");
        testTblConstWc("PRIMARY KEY (id) ON CONFLICT ABORT");
        testTblConstWc("PRIMARY KEY (id) ON CONFLICT FAIL");
        testTblConstWc("PRIMARY KEY (id) ON CONFLICT IGNORE");
        testTblConstWc("PRIMARY KEY (id) ON CONFLICT REPLACE");

        testTblConstWc("UNIQUE (id) ON CONFLICT FAIL");
        testTblConstWc("CHECK (id > 0) ON CONFLICT ROLLBACK");
      });
    });

    dialect(["mysql", "mariadb", "sqlite"], () => {
      it("supports CONSTRAINT keyword for table constraints", () => {
        testTblConstWc("CONSTRAINT PRIMARY KEY (id)");
        testTblConstWc("CONSTRAINT UNIQUE KEY (id)");
        testTblConstWc("CONSTRAINT CHECK (false)");
        testTblConstWc("CONSTRAINT FOREIGN KEY (id) REFERENCES tbl2 (id)");
      });
    });

    dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
      it("supports named table constraints", () => {
        testTblConstWc("CONSTRAINT cname PRIMARY KEY (id)");
        testTblConstWc("CONSTRAINT cname UNIQUE KEY (id)");
        testTblConstWc("CONSTRAINT cname CHECK (false)");
        testTblConstWc("CONSTRAINT cname FOREIGN KEY (id) REFERENCES tbl2 (id)");
      });
    });
  });

  dialect("bigquery", () => {
    it("does not support table constraints", () => {
      expect(() => testTblConstWc("PRIMARY KEY (id)")).toThrowError();
    });
  });
});
