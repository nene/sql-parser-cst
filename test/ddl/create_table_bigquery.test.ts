import { dialect, notDialect, testWc } from "../test_utils";

describe("create table (BigQuery)", () => {
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

  notDialect("bigquery", () => {
    it("does not support CREATE TABLE ... COPY", () => {
      expect(() => testWc("CREATE TABLE foo COPY bar")).toThrowError();
    });
    it("does not support CREATE TABLE ... CLONE", () => {
      expect(() => testWc("CREATE TABLE foo CLONE bar")).toThrowError();
    });
    it("does not support CREATE EXTERNAL TABLE", () => {
      expect(() => testWc("CREATE EXTERNAL TABLE foo (id INT)")).toThrowError();
    });
  });
});
