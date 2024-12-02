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
          testWc("CREATE TEMP TRIGGER my_trig DELETE ON my_tbl BEGIN SELECT 1; END");
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
  });

  dialect("postgresql", () => {
    describe("CREATE TRIGGER", () => {
      it("supports CREATE TRIGGER .. EXECUTE function", () => {
        testWc(`
          CREATE TRIGGER my_trig AFTER INSERT ON my_tbl
          EXECUTE FUNCTION my_function()
        `);
      });

      it("supports CREATE TRIGGER .. EXECUTE procedure", () => {
        testWc(`
          CREATE TRIGGER my_trig BEFORE DELETE ON my_tbl
          EXECUTE PROCEDURE my_proc (1, 2, 3, 'Hello')
        `);
      });

      const body = `EXECUTE FUNCTION fn()`;

      it("supports OR REPLACE", () => {
        testWc(`CREATE OR REPLACE TRIGGER my_trig INSTEAD OF UPDATE ON my_tbl ${body}`);
      });

      it("supports UPDATE OF", () => {
        testWc(`CREATE TRIGGER my_trig AFTER UPDATE OF col1, col2 ON my_tbl ${body}`);
      });

      it("supports TRUNCATE", () => {
        testWc(`CREATE TRIGGER my_trig AFTER TRUNCATE ON my_tbl ${body}`);
      });

      it("supports CONSTRAINT TRIGGER", () => {
        testWc(`CREATE CONSTRAINT TRIGGER my_trig AFTER INSERT ON my_tbl ${body}`);
      });

      it("supports multiple events", () => {
        testWc(`
          CREATE TRIGGER my_trig AFTER INSERT OR UPDATE OF col1, col2 OR DELETE
          ON my_tbl
          ${body}
        `);
      });

      it("supports WHEN clause", () => {
        testWc(`CREATE TRIGGER my_trig AFTER INSERT ON my_tbl WHEN (x > 10) ${body}`);
      });

      it("supports FOR EACH clause", () => {
        testWc(`CREATE TRIGGER my_trig AFTER INSERT ON my_tbl FOR EACH ROW ${body}`);
        testWc(`CREATE TRIGGER my_trig AFTER INSERT ON my_tbl FOR EACH STATEMENT ${body}`);
        testWc(`CREATE TRIGGER my_trig AFTER INSERT ON my_tbl FOR ROW ${body}`);
        testWc(`CREATE TRIGGER my_trig AFTER INSERT ON my_tbl FOR STATEMENT ${body}`);
      });

      it("supports FROM clause", () => {
        testWc(`CREATE CONSTRAINT TRIGGER my_trig AFTER INSERT ON my_tbl FROM schm.tbl ${body}`);
      });

      it("supports timing clauses", () => {
        testWc(`CREATE TRIGGER my_trig AFTER INSERT ON my_tbl DEFERRABLE ${body}`);
        testWc(`CREATE TRIGGER my_trig AFTER INSERT ON my_tbl NOT DEFERRABLE ${body}`);
        testWc(`CREATE TRIGGER my_trig AFTER INSERT ON my_tbl INITIALLY DEFERRED ${body}`);
        testWc(`CREATE TRIGGER my_trig AFTER INSERT ON my_tbl INITIALLY IMMEDIATE ${body}`);
        testWc(
          `CREATE TRIGGER my_trig AFTER INSERT ON my_tbl DEFERRABLE INITIALLY DEFERRED ${body}`
        );
        testWc(
          `CREATE TRIGGER my_trig AFTER INSERT ON my_tbl DEFERRABLE INITIALLY IMMEDIATE ${body}`
        );
      });

      it("supports REFERENCING clause", () => {
        testWc(`
          CREATE CONSTRAINT TRIGGER my_trig AFTER INSERT ON my_tbl
          REFERENCING OLD TABLE AS ref_tbl_old ${body}
        `);
        testWc(`
          CREATE CONSTRAINT TRIGGER my_trig AFTER INSERT ON my_tbl
          REFERENCING NEW TABLE AS ref_tbl_new ${body}
        `);
        testWc(`
          CREATE CONSTRAINT TRIGGER my_trig AFTER INSERT ON my_tbl
          REFERENCING NEW TABLE ref_tbl_new, OLD TABLE ref_tbl_old
          ${body}
        `);
      });

      // Not documented in PostgreSQL docs, but supported by actual PostgreSQL parser
      it("supports REFERENCING clause with undocumented ROW", () => {
        testWc(`
          CREATE CONSTRAINT TRIGGER my_trig AFTER INSERT ON my_tbl
          REFERENCING OLD ROW AS ref_tbl_old, NEW ROW AS ref_tbl_new
          ${body}
        `);
      });
    });
  });

  dialect("postgresql", () => {
    describe("ALTER TRIGGER", () => {
      it("supports RENAME TO", () => {
        testWc("ALTER TRIGGER my_trg ON my_table RENAME TO my_trg_new");
        testWc("ALTER TRIGGER my_trg ON schm.my_table RENAME TO my_trg_new");
      });

      it("supports [NO] DEPENDS ON EXTENSION", () => {
        testWc("ALTER TRIGGER my_trg ON my_table DEPENDS ON EXTENSION my_ext");
        testWc("ALTER TRIGGER my_trg ON my_table NO DEPENDS ON EXTENSION my_ext");
      });
    });
  });

  describe("DROP TRIGGER", () => {
    dialect(["mysql", "mariadb", "sqlite"], () => {
      it("simple DROP TRIGGER statement", () => {
        testWc("DROP TRIGGER my_trg");
        testWc("DROP TRIGGER schemata.my_trg");
      });

      it("supports IF EXISTS", () => {
        testWc("DROP TRIGGER IF EXISTS my_trg");
      });
    });

    dialect(["postgresql"], () => {
      it("supports DROP TRIGGER .. ON ..", () => {
        testWc("DROP TRIGGER my_trg ON my_tbl");
        testWc("DROP TRIGGER my_trg ON schemata.my_tbl");
      });

      it("supports IF EXISTS", () => {
        testWc("DROP TRIGGER IF EXISTS my_trg ON my_tbl");
      });

      it("supports CASCADE/RESTRICT", () => {
        testWc("DROP TRIGGER my_trg ON my_tbl CASCADE");
        testWc("DROP TRIGGER my_trg ON my_tbl RESTRICT");
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
});
