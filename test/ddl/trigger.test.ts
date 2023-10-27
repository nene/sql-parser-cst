import { dialect, test, testWc } from "../test_utils";

describe("trigger", () => {
  dialect(["mysql", "mariadb", "sqlite"], () => {
    describe("CREATE TRIGGER", () => {
      it("supports basic CREATE TRIGGER statement", () => {
        testWc(
          `CREATE TRIGGER my_trig DELETE ON my_tbl BEGIN
              INSERT INTO change_log VALUES ('deleted', 1);
              UPDATE summary SET total = NULL;
            END`
        );
      });

      // This is to make sure we don't detect END as a separate statement.
      // As in SQLite "END" can be a statement on its own.
      it("supports semicolon after END", () => {
        testWc(`CREATE TRIGGER my_trig DELETE ON my_tbl BEGIN SELECT 1; END;`);
      });

      dialect("sqlite", () => {
        it("supports TEMPORARY trigger", () => {
          testWc("CREATE TEMPORARY TRIGGER my_trig DELETE ON my_tbl BEGIN SELECT 1; END");
        });
      });

      it("supports IF NOT EXISTS", () => {
        testWc("CREATE TRIGGER IF NOT EXISTS my_trig DELETE ON my_tbl BEGIN SELECT 1; END");
      });

      it("supports BEFORE / AFTER timing", () => {
        testWc("CREATE TRIGGER my_trig BEFORE DELETE ON my_tbl BEGIN SELECT 1; END");
        testWc("CREATE TRIGGER my_trig AFTER DELETE ON my_tbl BEGIN SELECT 1; END");
      });

      dialect("sqlite", () => {
        it("supports INSTEAD OF timing", () => {
          testWc("CREATE TRIGGER my_trig INSTEAD OF DELETE ON my_tbl BEGIN SELECT 1; END");
        });
      });

      it("supports triggers for DELETE / INSERT / UPDATE", () => {
        testWc("CREATE TRIGGER my_trig DELETE ON my_tbl BEGIN SELECT 1; END");
        testWc("CREATE TRIGGER my_trig INSERT ON my_tbl BEGIN SELECT 1; END");
        testWc("CREATE TRIGGER my_trig UPDATE ON my_tbl BEGIN SELECT 1; END");
      });

      dialect("sqlite", () => {
        it("supports triggers for UPDATE OF specific columns", () => {
          testWc("CREATE TRIGGER my_trig UPDATE OF col1, col2 ON my_tbl BEGIN SELECT 1; END");
        });
      });

      it("supports executing trigger FOR EACH ROW", () => {
        testWc("CREATE TRIGGER my_trig INSERT ON my_tbl FOR EACH ROW BEGIN SELECT 1; END");
      });

      dialect("sqlite", () => {
        it("supports executing trigger conditionally with WHEN", () => {
          testWc("CREATE TRIGGER my_trig INSERT ON tbl WHEN x > 10 BEGIN SELECT 1; END");
        });

        it("supports combining FOR EACH ROW & WHEN", () => {
          testWc(
            "CREATE TRIGGER my_trig INSERT ON tbl FOR EACH ROW WHEN x > 10 BEGIN SELECT 1; END"
          );
        });
      });
    });

    describe("DROP TRIGGER", () => {
      it("simple DROP TRIGGER statement", () => {
        testWc("DROP TRIGGER my_trg");
        testWc("DROP TRIGGER schemata.my_trg");
      });

      it("supports IF EXISTS", () => {
        testWc("DROP TRIGGER IF EXISTS my_trg");
      });
    });
  });

  dialect("bigquery", () => {
    it("does not support CREATE TRIGGER", () => {
      expect(() =>
        test(`CREATE TRIGGER my_trig DELETE ON my_tbl BEGIN SELECT 1; END`)
      ).toThrowError();
    });

    it("does not support DROP TRIGGER", () => {
      expect(() => test("DROP TRIGGER my_trg")).toThrowError();
    });
  });

  dialect("postgresql", () => {
    it("TODO:postgres", () => {
      expect(true).toBe(true);
    });
  });
});
