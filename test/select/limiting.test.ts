import { dialect, testClauseWc } from "../test_utils";

describe("select limiting", () => {
  describe("LIMIT clause", () => {
    it("parses basic LIMIT clause", () => {
      testClauseWc("LIMIT 25");
    });

    dialect(["bigquery", "sqlite", "mysql", "mariadb"], () => {
      it("parses LIMIT offset,count clause", () => {
        testClauseWc("LIMIT 100, 25");
      });
    });

    it("parses LIMIT..OFFSET clause", () => {
      testClauseWc("LIMIT 25 OFFSET 100");
    });

    dialect("mariadb", () => {
      it("parses LIMIT ROWS EXAMINED", () => {
        testClauseWc("LIMIT 25 OFFSET 100 ROWS EXAMINED 1000");
        testClauseWc("LIMIT 100, 8 ROWS EXAMINED 1000");
        testClauseWc("LIMIT 25 ROWS EXAMINED 1000");
        testClauseWc("LIMIT ROWS EXAMINED 1000");
      });
    });
  });

  dialect(["mariadb", "postgresql"], () => {
    describe("OFFSET and FETCH clauses", () => {
      it("supports OFFSET", () => {
        testClauseWc(`OFFSET 10 ROWS`);
        testClauseWc(`OFFSET 1 ROW`);
        testClauseWc(`OFFSET 15`);
      });

      it("supports FETCH..ROWS", () => {
        testClauseWc(`FETCH FIRST 10 ROWS ONLY`);
        testClauseWc(`FETCH NEXT 1 ROW WITH TIES`);
        testClauseWc(`FETCH NEXT ROW ONLY`);
      });

      it("supports OFFSET & FETCH together", () => {
        testClauseWc(`OFFSET 25 ROWS FETCH FIRST 10 ROWS ONLY`);
        testClauseWc(`OFFSET 28 FETCH NEXT ROW ONLY`);
      });
    });
  });
});
