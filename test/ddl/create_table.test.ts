import { dialect, testWc } from "../test_utils";

describe("create table", () => {
  it("supports simple CREATE TABLE statement", () => {
    testWc("CREATE TABLE foo (id INT)");
  });

  it("supports CREATE TABLE with multiple column definitions", () => {
    testWc("CREATE TABLE foo ( id INT , age SMALLINT )");
  });

  dialect("sqlite", () => {
    it("supports columns without type", () => {
      testWc("CREATE TEMP TABLE foo (id, name)");
      testWc("CREATE TEMP TABLE foo (id NOT NULL)");
    });
  });

  it("supports CREATE TEMPORARY TABLE", () => {
    testWc("CREATE TEMPORARY TABLE foo (id INT)");
  });

  dialect(["sqlite", "bigquery", "postgresql"], () => {
    it("supports CREATE TEMP TABLE", () => {
      testWc("CREATE TEMP TABLE foo (id INT)");
    });
  });

  dialect("postgresql", () => {
    // This syntax is deprecated and has no effect
    it("supports [GLOBAL | LOCAL] TEMPORARY TABLE", () => {
      testWc("CREATE GLOBAL TEMP TABLE foo (id INT)");
      testWc("CREATE LOCAL TEMPORARY TABLE foo (id INT)");
    });
  });

  dialect("postgresql", () => {
    it("supports UNLOGGED TABLE", () => {
      testWc("CREATE UNLOGGED TABLE foo (id INT)");
    });
  });

  it("supports IF NOT EXISTS", () => {
    testWc("CREATE TABLE IF NOT EXISTS foo (id INT)");
  });

  dialect("bigquery", () => {
    it("supports OR REPLACE", () => {
      testWc("CREATE OR REPLACE TABLE foo (id INT)");
      testWc("CREATE OR REPLACE TEMPORARY TABLE foo (id INT)");
    });
  });

  describe("CREATE TABLE AS", () => {
    it("supports CREATE TABLE ... AS select", () => {
      testWc("CREATE TABLE foo AS SELECT 1");
    });

    it("supports CREATE TABLE ... AS (select)", () => {
      testWc("CREATE TABLE foo AS (SELECT 1)");
    });

    it("supports CREATE TABLE ... AS SELECT UNION SELECT", () => {
      testWc("CREATE TABLE foo AS SELECT 1 AS x UNION SELECT 2 AS x");
    });

    dialect(["mysql", "mariadb", "bigquery"], () => {
      it("supports CREATE TABLE ...(defs) AS select", () => {
        testWc("CREATE TABLE foo (id INT) AS SELECT 1");
      });
    });

    dialect("postgresql", () => {
      it("supports CREATE TABLE ...(columns) AS select", () => {
        testWc("CREATE TABLE foo (id, name) AS SELECT 1, 'John'");
      });

      it("supports WITH [NO] DATA", () => {
        testWc("CREATE TABLE foo AS SELECT 1 WITH DATA");
        testWc("CREATE TABLE foo AS SELECT 1 WITH NO DATA");
      });
    });
  });

  describe("CREATE TABLE LIKE", () => {
    dialect(["mysql", "mariadb", "bigquery"], () => {
      it("supports basic CREATE TABLE ... LIKE", () => {
        testWc("CREATE TABLE foo LIKE bar");
      });
    });

    dialect("bigquery", () => {
      it("supports CREATE TABLE ... LIKE ... AS", () => {
        testWc(`
          CREATE TABLE mydataset.newtable
          LIKE mydataset.sourcetable
          AS SELECT * FROM mydataset.myothertable
        `);
      });
    });

    dialect(["postgresql", "mysql", "mariadb"], () => {
      it("supports (LIKE ...)", () => {
        testWc("CREATE TABLE foo (LIKE bar)");
      });
    });

    dialect("postgresql", () => {
      it("supports LIKE combined with columns and constraints", () => {
        testWc(`
          CREATE TABLE foo (
            id INT,
            PRIMARY KEY (id),
            LIKE bar,
            CONSTRAINT foo_id CHECK (id > 0)
          )
        `);
      });

      it("supports LIKE with options", () => {
        testWc(`CREATE TABLE foo ( LIKE bar INCLUDING COMMENTS )`);
        testWc(`CREATE TABLE foo ( LIKE bar INCLUDING COMPRESSION )`);
        testWc(`CREATE TABLE foo ( LIKE bar INCLUDING CONSTRAINTS )`);
        testWc(`CREATE TABLE foo ( LIKE bar INCLUDING DEFAULTS )`);
        testWc(`CREATE TABLE foo ( LIKE bar INCLUDING GENERATED )`);
        testWc(`CREATE TABLE foo ( LIKE bar INCLUDING IDENTITY )`);
        testWc(`CREATE TABLE foo ( LIKE bar INCLUDING INDEXES )`);
        testWc(`CREATE TABLE foo ( LIKE bar INCLUDING STATISTICS )`);
        testWc(`CREATE TABLE foo ( LIKE bar INCLUDING STORAGE )`);
        testWc(`CREATE TABLE foo ( LIKE bar INCLUDING ALL )`);

        testWc(`CREATE TABLE foo ( LIKE bar INCLUDING ALL EXCLUDING STORAGE INCLUDING COMMENTS )`);
      });
    });
  });
});
