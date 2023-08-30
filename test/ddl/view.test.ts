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

    dialect(["mysql", "mariadb", "bigquery"], () => {
      it("supports OR REPLACE", () => {
        testWc("CREATE OR REPLACE VIEW my_view AS SELECT 1");
      });
    });

    dialect("sqlite", () => {
      it("TEMPORARY view", () => {
        testWc("CREATE TEMP VIEW my_view AS SELECT 1");
        testWc("CREATE TEMPORARY VIEW my_view AS SELECT 1");
      });
    });

    dialect(["sqlite", "bigquery", "mariadb"], () => {
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

    dialect("bigquery", () => {
      describe("materialized view", () => {
        it("supports CREATE MATERIALIZED VIEW", () => {
          testWc("CREATE MATERIALIZED VIEW my_view AS SELECT 1");
        });

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

    dialect("bigquery", () => {
      it("supports DROP MATERIALIZED VIEW", () => {
        testWc("DROP MATERIALIZED VIEW my_view");
      });
    });

    dialect(["mysql", "mariadb"], () => {
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
  });
});
