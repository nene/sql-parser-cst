import { dialect, notDialect, testWc } from "../test_utils";

describe("BigQuery load data", () => {
  dialect("bigquery", () => {
    describe("LOAD DATA", () => {
      it("supports basic LOAD DATA", () => {
        testWc(`
          LOAD DATA INTO mydataset.tbl
          FROM FILES ( format = 'CSV' , uris = ['gs://file1.csv'] )
        `);
      });

      it("supports LOAD DATA OVERWRITE", () => {
        testWc(`
          LOAD DATA OVERWRITE my_tbl
          FROM FILES(uris=['gs://file1.csv'])
        `);
      });

      it("supports columns", () => {
        testWc(`
          LOAD DATA INTO my_tbl ( x INT , y STRING )
          FROM FILES(uris=['gs://file1.csv'])
        `);
      });

      it("supports columns", () => {
        testWc(`
          LOAD DATA INTO my_tbl ( x INT , y STRING )
          FROM FILES(uris=['gs://file1.csv'])
        `);
      });

      it("supports partitioning and clustering", () => {
        testWc(`
          LOAD DATA INTO my_tbl
          PARTITION BY transaction_date
          CLUSTER BY customer_id
          FROM FILES(uris=['gs://file1.csv'])
        `);
      });

      it("supports WITH PARTITION COLUMNS", () => {
        testWc(`
          LOAD DATA INTO my_tbl
          FROM FILES(uris=['gs://file1.csv'])
          WITH PARTITION COLUMNS
        `);
      });

      it("supports WITH PARTITION COLUMNS (..)", () => {
        testWc(`
          LOAD DATA INTO my_tbl
          FROM FILES(uris=['gs://file1.csv'])
          WITH PARTITION COLUMNS (
            field_1 STRING,
            field_2 INT64
          )
        `);
      });

      it("supports WITH CONNECTION", () => {
        testWc(`
          LOAD DATA INTO my_tbl
          FROM FILES(uris=['gs://file1.csv'])
          WITH CONNECTION \`my-project-id.us.my-connection\`
        `);
      });
    });
  });

  notDialect("bigquery", () => {
    it("does not support LOAD DATA", () => {
      expect(() => testWc("LOAD DATA INTO my_tbl FROM FILES(uris=[])")).toThrowError();
    });
  });
});
