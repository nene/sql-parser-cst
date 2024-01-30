import { dialect, testWc } from "../test_utils";

describe("view", () => {
  describe("CREATE VIEW", () => {
    it("simple CREATE VIEW statement", () => {
      testWc("CREATE VIEW my_view AS SELECT * FROM tbl");
      testWc("CREATE VIEW schemata.my_view AS (SELECT * FROM tbl)");
    });

    it("supports columns list", () => {
      testWc("CREATE VIEW my_view (col1, col2) AS SELECT 1, 2");
    });

    dialect(["mysql", "mariadb", "bigquery", "postgresql"], () => {
      it("supports OR REPLACE", () => {
        testWc("CREATE OR REPLACE VIEW my_view AS SELECT 1");
      });
    });

    dialect(["sqlite", "postgresql"], () => {
      it("TEMPORARY view", () => {
        testWc("CREATE TEMP VIEW my_view AS SELECT 1");
        testWc("CREATE TEMPORARY VIEW my_view AS SELECT 1");
      });
    });
    dialect("postgresql", () => {
      it("RECURSIVE view", () => {
        testWc("CREATE RECURSIVE VIEW my_view AS SELECT * FROM my_view");
        testWc("CREATE TEMPORARY RECURSIVE VIEW my_view AS SELECT * FROM my_view");
      });
    });

    dialect(["sqlite", "bigquery", "mariadb", "postgresql"], () => {
      it("supports IF NOT EXISTS", () => {
        testWc("CREATE VIEW IF NOT EXISTS my_view AS SELECT 1");
      });
    });

    dialect("bigquery", () => {
      it("supports OPTIONS(...)", () => {
        testWc("CREATE VIEW my_view OPTIONS(description = 'blah') AS SELECT 1");
        testWc("CREATE VIEW my_view (col1, col2) OPTIONS(description = 'blah') AS SELECT 1");
      });
    });

    dialect("postgresql", () => {
      it("supports WITH ( ..options.. )", () => {
        testWc(`
          CREATE VIEW my_view WITH (
            check_option = LOCAL,
            security_barrier = true,
            check_option = CASCADED,
            security_invoker = false
          ) AS SELECT 1
        `);
      });

      it("supports WITH [CASCADED|LOCAL] CHECK OPTION", () => {
        testWc(`CREATE VIEW my_view AS SELECT 1 WITH CHECK OPTION`);
        testWc(`CREATE VIEW my_view AS SELECT 1 WITH CASCADED CHECK OPTION`);
        testWc(`CREATE VIEW my_view AS SELECT 1 WITH LOCAL CHECK OPTION`);
      });
    });

    dialect(["bigquery", "postgresql"], () => {
      describe("materialized view", () => {
        it("supports CREATE MATERIALIZED VIEW", () => {
          testWc("CREATE MATERIALIZED VIEW my_view AS SELECT 1");
        });

        dialect("bigquery", () => {
          it("supports PARTITION BY option", () => {
            testWc("CREATE MATERIALIZED VIEW my_view PARTITION BY timestamp_col AS SELECT 1");
          });

          it("supports CLUSTER BY option", () => {
            testWc("CREATE MATERIALIZED VIEW my_view CLUSTER BY col1, col2 AS SELECT 1");
          });

          it("supports OPTIONS(...)", () => {
            testWc("CREATE MATERIALIZED VIEW my_view OPTIONS(description='Hi') AS SELECT 1");
          });

          it("supports combination of multiple view options", () => {
            testWc(`
              CREATE MATERIALIZED VIEW my_view
              PARTITION BY timestamp_col
              CLUSTER BY col1, col2
              OPTIONS(description='Hi')
              AS SELECT 1
            `);
          });
        });

        dialect("postgresql", () => {
          it("supports USING clause", () => {
            testWc(`CREATE MATERIALIZED VIEW my_view USING "SP-GiST" AS SELECT 1`);
          });

          it("supports TABLESPACE clause", () => {
            testWc(`CREATE MATERIALIZED VIEW my_view TABLESPACE ts_2 AS SELECT 1`);
          });

          it("supports WITH [NO] DATA clause", () => {
            testWc(`CREATE MATERIALIZED VIEW my_view AS SELECT 1 WITH DATA`);
            testWc(`CREATE MATERIALIZED VIEW my_view AS SELECT 1 WITH NO DATA`);
          });
        });
      });
    });
  });

  describe("DROP VIEW", () => {
    it("simple DROP VIEW statement", () => {
      testWc("DROP VIEW my_view");
      testWc("DROP VIEW schemata.my_view");
    });

    it("supports IF EXISTS", () => {
      testWc("DROP VIEW IF EXISTS my_view");
    });

    it("supports multiple views", () => {
      testWc("DROP VIEW view1, view2, view3");
    });

    dialect(["bigquery", "postgresql"], () => {
      it("supports DROP MATERIALIZED VIEW", () => {
        testWc("DROP MATERIALIZED VIEW my_view");
      });
    });

    dialect(["mysql", "mariadb", "postgresql"], () => {
      it("with CASCADE/RESTRICT behavior", () => {
        testWc("DROP VIEW v1 CASCADE");
        testWc("DROP VIEW v1 RESTRICT");
      });
    });
  });

  describe("ALTER VIEW", () => {
    dialect("bigquery", () => {
      it("supports ALTER VIEW [IF EXISTS] .. SET OPTIONS()", () => {
        testWc("ALTER VIEW my_view SET OPTIONS(description='blah')");
        testWc("ALTER VIEW IF EXISTS my_view SET OPTIONS(description='blah')");
      });

      it("supports ALTER MATERIALIZED VIEW [IF EXISTS] .. SET OPTIONS()", () => {
        testWc("ALTER MATERIALIZED VIEW my_view SET OPTIONS(description='blah')");
        testWc("ALTER MATERIALIZED VIEW IF EXISTS my_view SET OPTIONS(description='blah')");
      });
    });

    dialect(["mysql", "mariadb"], () => {
      it("basic ALTER VIEW with new AS SELECT", () => {
        testWc("ALTER VIEW my_view AS SELECT 1");
      });

      it("supports columns list", () => {
        testWc("ALTER VIEW my_view (col1, col2) AS SELECT 2");
      });
    });

    dialect("postgresql", () => {
      it("supports IF EXISTS", () => {
        testWc("ALTER VIEW IF EXISTS my_view RENAME TO new_view");
      });

      function testAlterWc(action: string) {
        testWc(`ALTER VIEW my_view ${action}`);
      }

      it("supports RENAME TO", () => {
        testAlterWc("RENAME TO new_view");
      });

      it("supports OWNER TO", () => {
        testAlterWc("OWNER TO some_user");
        testAlterWc("OWNER TO CURRENT_USER");
        testAlterWc("OWNER TO SESSION_USER");
        testAlterWc("OWNER TO CURRENT_ROLE");
      });

      it("supports RENAME [COLUMN] .. TO ..", () => {
        testAlterWc("RENAME old_name TO new_name");
        testAlterWc("RENAME COLUMN old_name TO new_name");
      });

      it("supports ALTER [COLUMN] .. SET DEFAULT ..", () => {
        testAlterWc("ALTER COLUMN col1 SET DEFAULT 1");
        testAlterWc("ALTER col1 SET DEFAULT 15 + 8");
      });

      it("supports ALTER [COLUMN] .. DROP DEFAULT", () => {
        testAlterWc("ALTER COLUMN col1 DROP DEFAULT");
        testAlterWc("ALTER col1 DROP DEFAULT");
      });

      it("supports SET SCHEMA", () => {
        testAlterWc("SET SCHEMA foo");
      });
    });
  });

  describe("ALTER MATERIALIZED VIEW", () => {
    dialect("postgresql", () => {
      function testAlterMatWc(action: string) {
        testWc(`ALTER MATERIALIZED VIEW my_view ${action}`);
      }

      it("supports SET TABLESPACE", () => {
        testAlterMatWc("SET TABLESPACE foo");
        testAlterMatWc("SET TABLESPACE foo NOWAIT");
      });

      it("supports SET ACCESS METHOD", () => {
        testAlterMatWc(`SET ACCESS METHOD "SP-GiST"`);
      });
    });
  });
});
