import { dialect, test } from "./test_utils";

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

    dialect("sqlite", () => {
      it("TEMPORARY view", () => {
        test("CREATE TEMP VIEW my_view AS SELECT 1");
        test("CREATE TEMPORARY VIEW my_view AS SELECT 1");
        test("CREATE /*c1*/ TEMP /*c2*/ VIEW my_view AS SELECT 1");
      });

      it("supports IF NOT EXISTS", () => {
        test("CREATE VIEW IF NOT EXISTS my_view AS SELECT 1");
        test("CREATE VIEW /*c1*/ IF /*c2*/ NOT /*c3*/ EXISTS /*c4*/ my_view AS SELECT 1");
      });
    });
  });
});
