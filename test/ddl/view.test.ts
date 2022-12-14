import { dialect, test } from "../test_utils";

describe("view", () => {
  describe("CREATE VIEW", () => {
    it("simple CREATE VIEW statement", () => {
      test("CREATE VIEW my_view AS SELECT * FROM tbl");
      test("CREATE VIEW schemata.my_view AS (SELECT * FROM tbl)");
      test("CREATE /*c1*/ VIEW /*c2*/ my_view /*c3*/ AS /*c4*/ SELECT * FROM tbl");
    });

    it("supports columns list", () => {
      test("CREATE VIEW my_view (col1, col2) AS SELECT 1, 2");
      test(
        "CREATE VIEW my_view /*c1*/(/*c2*/ col1 /*c3*/,/*c4*/ col2 /*c5*/)/*c6*/ AS SELECT 1, 2"
      );
    });

    dialect(["mysql", "bigquery"], () => {
      it("supports OR REPLACE", () => {
        test("CREATE OR REPLACE VIEW my_view AS SELECT 1");
        test("CREATE /*c1*/ OR /*c2*/ REPLACE /*c3*/ VIEW my_view AS SELECT 1");
      });
    });

    dialect("sqlite", () => {
      it("TEMPORARY view", () => {
        test("CREATE TEMP VIEW my_view AS SELECT 1");
        test("CREATE TEMPORARY VIEW my_view AS SELECT 1");
        test("CREATE /*c1*/ TEMP /*c2*/ VIEW my_view AS SELECT 1");
      });
    });

    dialect(["sqlite", "bigquery"], () => {
      it("supports IF NOT EXISTS", () => {
        test("CREATE VIEW IF NOT EXISTS my_view AS SELECT 1");
        test("CREATE VIEW /*c1*/ IF /*c2*/ NOT /*c3*/ EXISTS /*c4*/ my_view AS SELECT 1");
      });
    });

    dialect("bigquery", () => {
      it("supports OPTIONS(...)", () => {
        test("CREATE VIEW my_view OPTIONS(description = 'blah') AS SELECT 1");
        test("CREATE VIEW my_view (col1, col2) OPTIONS(description = 'blah') AS SELECT 1");
        test("CREATE VIEW my_view /*c1*/ OPTIONS(description = 'blah') /*c2*/ AS SELECT 1");
      });
    });

    dialect("bigquery", () => {
      describe("materialized view", () => {
        it("supports CREATE MATERIALIZED VIEW", () => {
          test("CREATE MATERIALIZED VIEW my_view AS SELECT 1");
          test("CREATE /*c1*/ MATERIALIZED /*c2*/ VIEW my_view AS SELECT 1");
        });

        it("supports PARTITION BY option", () => {
          test("CREATE MATERIALIZED VIEW my_view PARTITION BY timestamp_col AS SELECT 1");
        });

        it("supports CLUSTER BY option", () => {
          test("CREATE MATERIALIZED VIEW my_view CLUSTER BY col1, col2 AS SELECT 1");
        });

        it("supports OPTIONS(...)", () => {
          test("CREATE MATERIALIZED VIEW my_view OPTIONS(description='Hi') AS SELECT 1");
        });

        it("supports combination of multiple view options", () => {
          test(`
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
      test("DROP VIEW my_view");
      test("DROP VIEW schemata.my_view");
      test("DROP /*c1*/ VIEW /*c2*/ my_view");
    });

    it("supports IF EXISTS", () => {
      test("DROP VIEW IF EXISTS my_view");
      test("DROP VIEW /*c1*/ IF /*c2*/ EXISTS /*c4*/ my_view");
    });

    it("supports multiple views", () => {
      test("DROP VIEW view1, view2, view3");
      test("DROP VIEW view1 /*c1*/,/*c2*/ view2");
    });

    dialect("bigquery", () => {
      it("supports DROP MATERIALIZED VIEW", () => {
        test("DROP MATERIALIZED VIEW my_view");
        test("DROP /*c1*/ MATERIALIZED /*c2*/ VIEW my_view");
      });
    });

    dialect("mysql", () => {
      it("with CASCADE/RESTRICT behavior", () => {
        test("DROP VIEW v1 CASCADE");
        test("DROP VIEW v1 RESTRICT");
        test("DROP VIEW v1 /*c1*/ RESTRICT");
      });
    });
  });

  describe("ALTER VIEW", () => {
    dialect("bigquery", () => {
      it("supports ALTER VIEW [IF EXISTS] .. SET OPTIONS()", () => {
        test("ALTER VIEW my_view SET OPTIONS(description='blah')");
        test("ALTER VIEW IF EXISTS my_view SET OPTIONS(description='blah')");
      });

      it("supports ALTER MATERIALIZED VIEW [IF EXISTS] .. SET OPTIONS()", () => {
        test("ALTER MATERIALIZED VIEW my_view SET OPTIONS(description='blah')");
        test("ALTER MATERIALIZED VIEW IF EXISTS my_view SET OPTIONS(description='blah')");
        test(`
          ALTER /*c1*/ MATERIALIZED /*c2*/ VIEW /*c3*/ IF /*c4*/ EXISTS /*c5*/ my_view /*c6*/
          SET /*c7*/ OPTIONS /*c8*/ (description='blah')
        `);
      });
    });
  });
});
