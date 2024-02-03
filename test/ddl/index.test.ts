import { dialect, testWc } from "../test_utils";

describe("index", () => {
  describe("CREATE INDEX", () => {
    dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
      it("simple CREATE INDEX statement", () => {
        testWc("CREATE INDEX my_idx ON tbl ( col1 , col2 )");
        testWc("CREATE INDEX schm.my_idx ON schm.tbl (col)");
      });

      it("supports UNIQUE index", () => {
        testWc("CREATE UNIQUE INDEX my_idx ON tbl (col)");
      });

      dialect("postgresql", () => {
        it("supports CONCURRENTLY", () => {
          testWc("CREATE INDEX CONCURRENTLY idx ON tbl (col)");
        });
      });

      dialect(["sqlite", "postgresql"], () => {
        it("supports IF NOT EXISTS", () => {
          testWc("CREATE INDEX IF NOT EXISTS idx ON tbl (col)");
        });
      });

      dialect("postgresql", () => {
        it("supports optional index name", () => {
          testWc("CREATE INDEX ON tbl (col)");
        });

        it("supports ON ONLY table_name", () => {
          testWc("CREATE INDEX foo ON ONLY tbl_with_inheritance (col)");
        });

        it("supports USING clause", () => {
          testWc(`CREATE INDEX foo ON tbl USING btree (col)`);
        });
      });

      dialect(["sqlite", "postgresql"], () => {
        it("supports WHERE clause", () => {
          testWc("CREATE INDEX idx ON tbl (col) WHERE x > 10");
        });
      });

      describe("columns list", () => {
        dialect(["sqlite", "postgresql"], () => {
          it("supports ASC/DESC in columns list", () => {
            testWc("CREATE INDEX my_idx ON tbl (id ASC, name DESC)");
          });
          it("supports COLLATE in columns list", () => {
            testWc("CREATE INDEX my_idx ON tbl (name COLLATE utf8)");
          });
        });

        dialect("postgresql", () => {
          it("supports arbitrary expressions in columns list", () => {
            testWc("CREATE INDEX idx ON tbl ((col1 + col2), foo())");
          });

          it("supports NULLS in columns list", () => {
            testWc("CREATE INDEX idx ON tbl (col ASC NULLS FIRST)");
          });

          it("supports opclass in columns list", () => {
            testWc("CREATE INDEX idx ON tbl (col my.opclass DESC NULLS LAST)");
          });
          it("supports opclass (arguments)", () => {
            testWc(`
              CREATE INDEX idx ON tbl ( col opcls (foo, foo.bar, zip = 1, zip.zap = 2) )
            `);
          });
          it("supports opclass with various argument values", () => {
            testWc(`CREATE INDEX idx ON tbl ( col opcls (foo = NONE) )`);
            testWc(`CREATE INDEX idx ON tbl ( col opcls (foo = 'hello') )`);
            testWc(`CREATE INDEX idx ON tbl ( col opcls (foo = SELECT) )`);
            testWc(`CREATE INDEX idx ON tbl ( col opcls (foo = TRUE) )`);
          });
        });
      });
    });

    dialect("bigquery", () => {
      it("supports SEARCH INDEX", () => {
        testWc("CREATE SEARCH INDEX my_idx ON tbl (col)");
      });

      it("supports IF NOT EXISTS", () => {
        testWc("CREATE SEARCH INDEX IF NOT EXISTS idx ON tbl (col)");
      });

      it("supports ALL COLUMNS", () => {
        testWc("CREATE SEARCH INDEX idx ON tbl ( ALL COLUMNS )");
      });

      it("supports OPTIONS(..)", () => {
        testWc("CREATE SEARCH INDEX idx ON tbl (col) OPTIONS(analyzer='LOG_ANALYZER')");
      });
    });

    dialect(["mysql", "mariadb"], () => {
      it("supports FULLTEXT & SPATIAL index", () => {
        testWc("CREATE FULLTEXT INDEX my_idx ON tbl (col)");
        testWc("CREATE SPATIAL INDEX my_idx ON tbl (col)");
      });
    });
  });

  describe("DROP INDEX", () => {
    dialect(["sqlite", "postgresql"], () => {
      it("supports DROP INDEX name", () => {
        testWc("DROP INDEX my_idx");
        testWc("DROP INDEX schm.my_idx");
      });

      it("supports IF EXISTS", () => {
        testWc("DROP INDEX IF EXISTS my_idx");
      });

      dialect("postgresql", () => {
        it("supports CONCURRENTLY", () => {
          testWc("DROP INDEX CONCURRENTLY my_idx");
        });

        it("supports multiple indexes", () => {
          testWc("DROP INDEX my_idx, schm.idx");
        });

        it("supports CASCADE/RESTRICT", () => {
          testWc("DROP INDEX my_idx CASCADE");
          testWc("DROP INDEX my_idx RESTRICT");
        });
      });
    });

    dialect(["mysql", "mariadb"], () => {
      it("supports DROP INDEX name ON table", () => {
        testWc("DROP INDEX my_idx ON tbl");
        testWc("DROP INDEX idx ON schm.tbl");
      });
    });

    dialect("bigquery", () => {
      it("supports DROP SEARCH INDEX name ON table", () => {
        testWc("DROP SEARCH INDEX my_idx ON tbl");
        testWc("DROP SEARCH INDEX idx ON proj.schm.tbl");
      });

      it("supports IF EXISTS", () => {
        testWc("DROP SEARCH INDEX IF EXISTS my_idx ON tbl");
      });
    });
  });
});
