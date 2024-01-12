import { dialect, test, withComments } from "../test_utils";

describe("constraints", () => {
  describe("column constraints", () => {
    it("parses multiple constraints after column data type", () => {
      test(`CREATE TABLE foo (
        id INT  NOT NULL  DEFAULT 5
      )`);
    });

    function testColConstWc(constraint: string) {
      test(`CREATE TABLE t (id INT ${withComments(constraint)})`);
    }

    describe("null / not null", () => {
      dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
        it("NULL", () => {
          testColConstWc("NULL");
        });
      });

      it("NOT NULL", () => {
        testColConstWc("NOT NULL");
      });
    });

    describe("default", () => {
      it("DEFAULT", () => {
        testColConstWc("DEFAULT 10");
        testColConstWc("DEFAULT (5 + 6 > 0 AND true)");
      });

      dialect("postgresql", () => {
        it("support DEFAULT expr, without needing parenthesis", () => {
          testColConstWc("DEFAULT 5 + 8");
        });
      });
    });

    describe("primary key", () => {
      dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
        it("PRIMARY KEY", () => {
          testColConstWc("PRIMARY KEY");
        });
      });

      dialect("sqlite", () => {
        it("AUTOINCREMENT on PRIMARY KEY column", () => {
          testColConstWc("PRIMARY KEY AUTOINCREMENT");
        });

        it("ASC / DESC on PRIMARY KEY column", () => {
          testColConstWc("PRIMARY KEY ASC");
        });
      });

      dialect(["mysql", "mariadb"], () => {
        it("supports KEY as shorthand for PRIMARY KEY", () => {
          testColConstWc("KEY");
        });
      });
    });

    dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
      it("UNIQUE", () => {
        testColConstWc("UNIQUE");
        testColConstWc("UNIQUE KEY");
      });
    });

    dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
      it("CHECK", () => {
        testColConstWc("CHECK (col > 10)");
      });
    });

    describe("foreign key", () => {
      dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
        it("REFERENCES", () => {
          // full syntax is tested under table constraints tests
          testColConstWc("REFERENCES tbl2 (col1)");
        });
      });
      dialect("sqlite", () => {
        it("supports deferrability in references clause", () => {
          testColConstWc("REFERENCES tbl2 (id) DEFERRABLE");
        });
      });
    });

    describe("collate", () => {
      dialect(["mysql", "mariadb", "sqlite"], () => {
        it("COLLATE", () => {
          testColConstWc("COLLATE utf8mb4_bin");
        });
      });
      dialect("bigquery", () => {
        it("COLLATE", () => {
          testColConstWc("COLLATE 'und:ci'");
        });
      });
      dialect("postgresql", () => {
        it("COLLATE", () => {
          testColConstWc(`COLLATE "C"`);
        });
      });
    });

    describe("generated", () => {
      dialect(["mysql", "mariadb", "sqlite"], () => {
        it("GENERATED ALWAYS", () => {
          testColConstWc("GENERATED ALWAYS AS (col1 + col2)");
          testColConstWc("AS (col1 + col2)");
          testColConstWc("GENERATED ALWAYS AS ( true ) VIRTUAL");
        });
      });
      dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
        it("GENERATED ALWAYS AS (expr) STORED", () => {
          testColConstWc("GENERATED ALWAYS AS (true) STORED");
        });
      });
    });

    dialect(["mysql", "mariadb"], () => {
      it("AUTO_INCREMENT", () => {
        testColConstWc("AUTO_INCREMENT");
        testColConstWc("AUTO_increment");
      });
    });

    dialect(["mysql", "mariadb"], () => {
      it("COMMENT", () => {
        testColConstWc("COMMENT 'Hello, world!'");
      });
    });

    dialect(["mysql", "mariadb"], () => {
      it("VISIBLE / INVISIBLE", () => {
        testColConstWc("VISIBLE");
        testColConstWc("INVISIBLE");
      });
    });

    dialect(["mysql", "mariadb"], () => {
      it("COLUMN_FORMAT", () => {
        testColConstWc("COLUMN_FORMAT FIXED");
        testColConstWc("COLUMN_FORMAT DYNAMIC");
        testColConstWc("COLUMN_FORMAT DEFAULT");
      });
    });

    describe("storage", () => {
      dialect(["mysql", "mariadb"], () => {
        it("STORAGE", () => {
          testColConstWc("STORAGE DISK");
          testColConstWc("STORAGE MEMORY");
        });
      });
      dialect("postgresql", () => {
        it("STORAGE", () => {
          testColConstWc("STORAGE PLAIN");
          testColConstWc("STORAGE EXTERNAL");
          testColConstWc("STORAGE EXTENDED");
          testColConstWc("STORAGE MAIN");
          testColConstWc("STORAGE DEFAULT");
        });
      });
    });

    dialect(["mysql", "mariadb"], () => {
      it("engine attributes", () => {
        testColConstWc("ENGINE_ATTRIBUTE = 'blah'");
        testColConstWc("ENGINE_ATTRIBUTE 'blah'");
        testColConstWc("SECONDARY_ENGINE_ATTRIBUTE = 'blah'");
        testColConstWc("SECONDARY_ENGINE_ATTRIBUTE 'blah'");
      });
    });

    dialect("postgresql", () => {
      it("COMPRESSION", () => {
        testColConstWc("COMPRESSION pglz");
        testColConstWc("COMPRESSION lz4");
        testColConstWc("COMPRESSION default");
      });
    });

    dialect("sqlite", () => {
      it("supports ON CONFLICT clause", () => {
        testColConstWc("UNIQUE ON CONFLICT ROLLBACK");
        testColConstWc("UNIQUE ON CONFLICT ABORT");
        testColConstWc("UNIQUE ON CONFLICT FAIL");
        testColConstWc("UNIQUE ON CONFLICT IGNORE");
        testColConstWc("UNIQUE ON CONFLICT REPLACE");

        testColConstWc("PRIMARY KEY ON CONFLICT ABORT");
        testColConstWc("NOT NULL ON CONFLICT ABORT");
        testColConstWc("CHECK (x > 0) ON CONFLICT ABORT");
      });
    });

    dialect("bigquery", () => {
      it("supports OPTIONS(..)", () => {
        testColConstWc("OPTIONS(description='this is a great column')");
      });
    });

    dialect(["mysql", "mariadb", "sqlite"], () => {
      it("supports CONSTRAINT keyword for keys and check()", () => {
        testColConstWc("CONSTRAINT PRIMARY KEY");
        testColConstWc("CONSTRAINT UNIQUE");
        testColConstWc("CONSTRAINT CHECK (true)");
      });
    });

    dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
      it("supports named column constraints for keys and check()", () => {
        testColConstWc("CONSTRAINT cname PRIMARY KEY");
        testColConstWc("CONSTRAINT cname UNIQUE");
        testColConstWc("CONSTRAINT cname CHECK (true)");
      });
    });

    dialect(["sqlite"], () => {
      it("supports CONSTRAINT keyword for column constraints", () => {
        testColConstWc("CONSTRAINT NULL");
        testColConstWc("CONSTRAINT NOT NULL");
        testColConstWc("CONSTRAINT DEFAULT 10");
        testColConstWc("CONSTRAINT COLLATE utf8");
        testColConstWc("CONSTRAINT GENERATED ALWAYS AS (x + y)");
        testColConstWc("CONSTRAINT REFERENCES tbl2 (col)");
      });
    });

    dialect(["sqlite", "postgresql"], () => {
      it("supports named column constraints", () => {
        testColConstWc("CONSTRAINT cname NULL");
        testColConstWc("CONSTRAINT cname NOT NULL");
        testColConstWc("CONSTRAINT cname DEFAULT 10");
        testColConstWc("CONSTRAINT cname COLLATE utf8");
        testColConstWc("CONSTRAINT cname GENERATED ALWAYS AS (x + y) STORED");
        testColConstWc("CONSTRAINT cname REFERENCES tbl2 (col)");
      });
    });
  });

  dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
    describe("table constraints", () => {
      it("supports multiple table constraints inside CREATE TABLE", () => {
        test(`CREATE TABLE tbl (
          id INT,
          PRIMARY KEY (id),
          UNIQUE (id)
        )`);
      });

      function testTblConstWc(constraint: string) {
        test(`CREATE TABLE t (${withComments(constraint)})`);
      }

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

      it("UNIQUE", () => {
        testTblConstWc("UNIQUE (id)");
        testTblConstWc("UNIQUE KEY (id, name)");
        testTblConstWc("UNIQUE INDEX (id)");
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

        it("supports ON DELETE/UPDATE actions", () => {
          testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) ON UPDATE RESTRICT");
          testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) ON DELETE CASCADE");
          testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) ON UPDATE SET NULL");
          testTblConstWc(
            "FOREIGN KEY (id) REFERENCES tbl2 (id) ON DELETE SET DEFAULT ON UPDATE NO ACTION"
          );
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

      dialect("sqlite", () => {
        it("supports deferrability of foreign keys", () => {
          testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) DEFERRABLE");
          testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) NOT DEFERRABLE");
          testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) DEFERRABLE INITIALLY DEFERRED");
          testTblConstWc("FOREIGN KEY (id) REFERENCES tbl2 (id) DEFERRABLE INITIALLY IMMEDIATE");
        });
      });

      dialect(["mysql", "mariadb"], () => {
        it("INDEX / KEY", () => {
          testTblConstWc("KEY (id)");
          testTblConstWc("INDEX (id)");
          testTblConstWc("KEY (id, name)");
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
  });
});
