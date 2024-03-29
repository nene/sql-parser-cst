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

    describe("vector index", () => {
      dialect("bigquery", () => {
        it("supports VECTOR INDEX", () => {
          testWc("CREATE VECTOR INDEX my_idx ON tbl (col)");
        });

        it("supports OR REPLACE", () => {
          testWc("CREATE OR REPLACE VECTOR INDEX my_idx ON tbl (col)");
        });

        it("supports IF NOT EXISTS", () => {
          testWc("CREATE VECTOR INDEX IF NOT EXISTS my_idx ON tbl (col)");
        });

        it("supports OPTIONS(..)", () => {
          testWc("CREATE VECTOR INDEX idx ON tbl (col) OPTIONS(distance_type = 'COSINE')");
        });
      });
    });

    dialect(["mysql", "mariadb"], () => {
      it("supports FULLTEXT & SPATIAL index", () => {
        testWc("CREATE FULLTEXT INDEX my_idx ON tbl (col)");
        testWc("CREATE SPATIAL INDEX my_idx ON tbl (col)");
      });
    });

    dialect("postgresql", () => {
      it("supports INCLUDE (columns) clause", () => {
        testWc("CREATE INDEX my_idx ON tbl (col) INCLUDE (foo, bar, baz)");
      });

      it("supports NULLS [NOT] DISTINCT clause", () => {
        testWc("CREATE INDEX my_idx ON tbl (col) NULLS DISTINCT");
        testWc("CREATE INDEX my_idx ON tbl (col) NULLS NOT DISTINCT");
      });

      it("supports WITH (storage parameters) clause", () => {
        testWc("CREATE INDEX my_idx ON tbl (col) WITH (deduplicate_items = TRUE)");
      });

      it("supports TABLESPACE clause", () => {
        testWc("CREATE INDEX my_idx ON tbl (col) TABLESPACE my_space");
      });
    });

    dialect(["sqlite", "postgresql"], () => {
      it("supports WHERE clause", () => {
        testWc("CREATE INDEX idx ON tbl (col) WHERE x > 10");
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

  describe("alter index", () => {
    dialect("postgresql", () => {
      it("supports IF EXISTS", () => {
        testWc("ALTER INDEX IF EXISTS my_idx RENAME TO new_idx");
      });

      it("supports RENAME TO", () => {
        testWc("ALTER INDEX my_idx RENAME TO new_idx");
      });

      it("supports SET TABLESPACE", () => {
        testWc("ALTER INDEX my_idx SET TABLESPACE my_space");
      });

      it("supports ATTACH PARTITION", () => {
        testWc("ALTER INDEX my_idx ATTACH PARTITION my_part");
        testWc("ALTER INDEX my_idx ATTACH PARTITION tbl.part");
      });

      it("supports [NO] DEPENDS ON EXTENSION", () => {
        testWc("ALTER INDEX my_idx DEPENDS ON EXTENSION my_ext");
        testWc("ALTER INDEX my_idx NO DEPENDS ON EXTENSION my_ext");
      });

      it("supports SET (storage parameters)", () => {
        testWc("ALTER INDEX my_idx SET (fillfactor = 50, autovacuum_enabled)");
      });

      it("supports RESET (storage parameters)", () => {
        testWc("ALTER INDEX my_idx RESET (fillfactor, autovacuum_enabled)");
      });

      it("supports ALTER COLUMN .. SET STATISTICS", () => {
        testWc("ALTER INDEX my_idx ALTER COLUMN 3 SET STATISTICS 100");
      });

      it("supports ALTER INDEX ALL IN TABLESPACE", () => {
        testWc("ALTER INDEX ALL IN TABLESPACE my_space SET TABLESPACE new_space");
      });

      it("supports ALTER INDEX ALL IN TABLESPACE .. OWNED BY", () => {
        testWc(`
          ALTER INDEX ALL IN TABLESPACE my_space OWNED BY foo, bar
          SET TABLESPACE new_space NOWAIT
        `);
      });
    });
  });

  describe("reindex", () => {
    dialect("sqlite", () => {
      it("supports simple REINDEX", () => {
        testWc("REINDEX");
        testWc("REINDEX tbl");
        testWc("REINDEX my_schema.tbl");
      });
    });

    dialect("postgresql", () => {
      it("supports REINDEX INDEX", () => {
        testWc("REINDEX INDEX my_idx");
        testWc("REINDEX INDEX schm.my_idx");
      });

      it("supports REINDEX {TABLE | SCHEMA | DATABASE | SYSTEM}", () => {
        testWc("REINDEX TABLE my_tbl");
        testWc("REINDEX SCHEMA my_schm");
        testWc("REINDEX DATABASE my_db");
        testWc("REINDEX SYSTEM my_db");
      });

      it("supports REINDEX {DATABASE | SYSTEM} without name", () => {
        testWc("REINDEX DATABASE");
        testWc("REINDEX SYSTEM");
      });

      it("supports CONCURRENTLY", () => {
        testWc("REINDEX INDEX CONCURRENTLY my_idx");
        testWc("REINDEX TABLE CONCURRENTLY my_idx");
        testWc("REINDEX SYSTEM CONCURRENTLY");
      });

      describe("reindex options", () => {
        it("supports CONCURRENTLY", () => {
          testWc("REINDEX (CONCURRENTLY true) INDEX my_idx");
          testWc("REINDEX (CONCURRENTLY false) TABLE foo");
          testWc("REINDEX (CONCURRENTLY) TABLE foo");
        });

        it("supports TABLESPACE", () => {
          testWc("REINDEX (TABLESPACE my_space) INDEX my_idx");
        });

        it("supports VERBOSE", () => {
          testWc("REINDEX (VERBOSE) INDEX my_idx");
          testWc("REINDEX (VERBOSE true) TABLE foo");
          testWc("REINDEX (VERBOSE false) TABLE foo");
        });

        it("supports multiple options", () => {
          testWc("REINDEX ( VERBOSE true, CONCURRENTLY, TABLESPACE blah ) INDEX my_idx");
        });
      });
    });
  });
});
