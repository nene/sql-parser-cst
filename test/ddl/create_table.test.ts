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

  dialect(["sqlite", "bigquery"], () => {
    it("supports CREATE TEMP TABLE", () => {
      testWc("CREATE TEMP TABLE foo (id INT)");
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

    dialect("mysql", () => {
      it("supports CREATE TABLE ...(defs) AS select", () => {
        testWc("CREATE TABLE foo (id INT) AS SELECT 1");
      });
    });
  });

  describe("CREATE TABLE LIKE", () => {
    dialect(["bigquery", "mysql"], () => {
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
  });

  dialect("bigquery", () => {
    describe("CREATE TABLE COPY", () => {
      it("supports basic CREATE TABLE ... COPY", () => {
        testWc("CREATE TABLE foo COPY bar");
      });

      it("supports CREATE TABLE ... COPY with options", () => {
        testWc(`
          CREATE TABLE mydataset.newtable
          COPY mydataset.sourcetable
          OPTIONS(description='blah')
        `);
      });
    });
  });

  dialect("bigquery", () => {
    describe("CREATE TABLE CLONE", () => {
      it("supports basic CREATE TABLE ... CLONE", () => {
        testWc("CREATE TABLE foo CLONE bar");
      });

      it("supports FOR SYSTEM_TIME AS OF", () => {
        testWc(`
          CREATE TABLE mydataset.newtable
          CLONE mydataset.sourcetable
          FOR SYSTEM_TIME AS OF TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
        `);
      });

      it("supports OPTIONS(..)", () => {
        testWc(`
          CREATE TABLE mydataset.newtable
          CLONE mydataset.sourcetable
          FOR SYSTEM_TIME AS OF '2017-01-01 10:00:00-07:00'
          OPTIONS(friendly_name="my_table_snapshot")
        `);
      });

      it("supports CREATE SNAPSHOT TABLE ... CLONE", () => {
        testWc("CREATE SNAPSHOT TABLE foo CLONE bar");
      });
    });
  });

  dialect("bigquery", () => {
    describe("CREATE EXTERNAL TABLE", () => {
      it("supports CREATE EXTERNAL TABLE with OPTIONS(..)", () => {
        testWc(`
          CREATE EXTERNAL TABLE foo OPTIONS (
            format = 'CSV',
            uris = ['gs://bucket/path2.csv']
          )
        `);
      });

      it("supports CREATE EXTERNAL TABLE with column list", () => {
        testWc("CREATE EXTERNAL TABLE foo (x INT64, y STRING)");
      });

      it("supports WITH CONNECTION", () => {
        testWc(`
          CREATE EXTERNAL TABLE foo
          WITH CONNECTION \`my_connection_id\`
        `);
      });

      it("supports WITH PARTITION COLUMNS", () => {
        testWc(`
          CREATE EXTERNAL TABLE foo
          WITH PARTITION COLUMNS
          OPTIONS(uris=['gs://bucket/path/*'], format='PARQUET')
        `);
      });

      it("supports WITH PARTITION COLUMNS (col1, col2, ...)", () => {
        testWc(`
          CREATE EXTERNAL TABLE foo
          WITH PARTITION COLUMNS (
            field_1 STRING ,
            field_2 INT64
          )
          OPTIONS(uris=['gs://bucket/path/*'], format='PARQUET')
        `);
      });
    });
  });
});
