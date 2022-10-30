import { dialect, test } from "./test_utils";

describe("trigger", () => {
  describe("CREATE TRIGGER", () => {
    it("supports basic CREATE TRIGGER statement", () => {
      test(
        `CREATE TRIGGER my_trig DELETE ON my_tbl BEGIN
            INSERT INTO change_log VALUES ('deleted', 1);
            UPDATE summary SET total = NULL;
          END`
      );

      test(
        `CREATE /*c1*/ TRIGGER /*c2*/ my_trig /*c3*/ DELETE /*c4*/ ON /*c5*/ my_tbl /*c6*/ BEGIN
          /*c7*/ SELECT 1 /*c8*/;
          /*c9*/ SELECT 1 /*c10*/;
        /*c11*/ END`
      );
    });

    dialect("sqlite", () => {
      it("supports TEMPORARY trigger", () => {
        test("CREATE TEMPORARY TRIGGER my_trig DELETE ON my_tbl BEGIN SELECT 1; END");
        test("CREATE /*c1*/ TEMP /*c2*/ TRIGGER my_trig DELETE ON my_tbl BEGIN SELECT 1; END");
      });
    });

    it("supports IF NOT EXISTS", () => {
      test("CREATE TRIGGER IF NOT EXISTS my_trig DELETE ON my_tbl BEGIN SELECT 1; END");
      test(
        "CREATE TRIGGER /*c1*/ IF NOT EXISTS /*c2*/ my_trig DELETE ON my_tbl BEGIN SELECT 1; END"
      );
    });

    it("supports BEFORE / AFTER timing", () => {
      test("CREATE TRIGGER my_trig BEFORE DELETE ON my_tbl BEGIN SELECT 1; END");
      test("CREATE TRIGGER my_trig AFTER DELETE ON my_tbl BEGIN SELECT 1; END");
      test("CREATE TRIGGER my_trig /*c1*/ AFTER /*c2*/ DELETE ON my_tbl BEGIN SELECT 1; END");
    });

    dialect("sqlite", () => {
      it("supports INSTEAD OF timing", () => {
        test("CREATE TRIGGER my_trig INSTEAD OF DELETE ON my_tbl BEGIN SELECT 1; END");
        test(
          "CREATE TRIGGER my_trig /*c1*/ INSTEAD /*c2*/ OF /*c3*/ DELETE ON my_tbl BEGIN SELECT 1; END"
        );
      });
    });

    it("supports triggers for DELETE / INSERT / UPDATE", () => {
      test("CREATE TRIGGER my_trig DELETE ON my_tbl BEGIN SELECT 1; END");
      test("CREATE TRIGGER my_trig INSERT ON my_tbl BEGIN SELECT 1; END");
      test("CREATE TRIGGER my_trig UPDATE ON my_tbl BEGIN SELECT 1; END");
    });

    dialect("sqlite", () => {
      it("supports triggers for UPDATE OF specific columns", () => {
        test("CREATE TRIGGER my_trig UPDATE OF col1, col2 ON my_tbl BEGIN SELECT 1; END");
        test(
          `CREATE TRIGGER my_trig /*c1*/ UPDATE /*c2*/ OF /*c3*/ col1 /*c4*/,/*c5*/ col2 /*c6*/
          ON my_tbl BEGIN SELECT 1; END`
        );
      });
    });

    it("supports executing trigger FOR EACH ROW", () => {
      test("CREATE TRIGGER my_trig INSERT ON my_tbl FOR EACH ROW BEGIN SELECT 1; END");
      test(
        "CREATE TRIGGER my_trig INSERT ON my_tbl /*c1*/ FOR /*c2*/ EACH /*c3*/ ROW /*c4*/ BEGIN SELECT 1; END"
      );
    });

    dialect("sqlite", () => {
      it("supports executing trigger conditionally with WHEN", () => {
        test("CREATE TRIGGER my_trig INSERT ON tbl WHEN x > 10 BEGIN SELECT 1; END");
        test(
          "CREATE TRIGGER my_trig INSERT ON tbl /*c1*/ WHEN /*c2*/ x > 10 /*c3*/ BEGIN SELECT 1; END"
        );
      });

      it("supports combining FOR EACH ROW & WHEN", () => {
        test("CREATE TRIGGER my_trig INSERT ON tbl FOR EACH ROW WHEN x > 10 BEGIN SELECT 1; END");
      });
    });
  });

  describe("DROP TRIGGER", () => {
    it("simple DROP TRIGGER statement", () => {
      test("DROP TRIGGER my_trg");
      test("DROP TRIGGER schemata.my_trg");
      test("DROP /*c1*/ TRIGGER /*c2*/ my_trg");
    });

    it("supports IF EXISTS", () => {
      test("DROP TRIGGER IF EXISTS my_trg");
      test("DROP TRIGGER /*c1*/ IF /*c2*/ EXISTS /*c4*/ my_trg");
    });
  });
});
