import { dialect, notDialect, testWc } from "../test_utils";

describe("BigQuery export data", () => {
  dialect("bigquery", () => {
    describe("EXPORT DATA", () => {
      it("supports basic EXPORT DATA", () => {
        testWc(`
          EXPORT DATA
          OPTIONS(format='CSV', uri='gs://bucket/*.csv')
          AS SELECT a, b FROM mydataset.tbl
        `);
      });

      it("supports WITH CONNECTION", () => {
        testWc(`
          EXPORT DATA
          WITH CONNECTION myproject.us.myconnection
          OPTIONS(format='CSV', uri='gs://bucket/*.csv') AS SELECT 1
        `);
      });
    });
  });

  notDialect("bigquery", () => {
    it("does not support EXPORT DATA", () => {
      expect(() => testWc("EXPORT DATA OPTIONS(format='CSV') AS SELECT 1")).toThrowError();
    });
  });
});
