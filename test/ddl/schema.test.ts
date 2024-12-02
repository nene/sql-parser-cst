import { dialect, parseStmt, test, testWc } from "../test_utils";

describe("schema", () => {
  dialect(["mysql", "mariadb", "bigquery", "postgresql"], () => {
    describe("CREATE SCHEMA", () => {
      it("supports CREATE SCHEMA statement", () => {
        testWc("CREATE SCHEMA my_schema");
        testWc("CREATE SCHEMA my_project.my_schema");
      });

      it("supports IF NOT EXISTS", () => {
        testWc("CREATE SCHEMA IF NOT EXISTS my_schema");
      });

      dialect(["mysql", "mariadb"], () => {
        it("supports CREATE DATABASE as alias to CREATE SCHEMA", () => {
          testWc("CREATE DATABASE my_schema");
        });
      });

      dialect("bigquery", () => {
        it("supports DEFAULT COLLATE", () => {
          testWc("CREATE SCHEMA my_schema DEFAULT COLLATE 'udn:ci'");
        });

        it("supports OPTIONS()", () => {
          testWc("CREATE SCHEMA my_schema OPTIONS(description='Hello')");
        });

        it("supports both OPTIONS() and DEFAULT COLLATE", () => {
          testWc("CREATE SCHEMA my_schema OPTIONS(description='Hello') DEFAULT COLLATE 'udn:ci'");
        });
      });

      dialect("postgresql", () => {
        it("supports AUTHORIZATION clause", () => {
          testWc("CREATE SCHEMA my_schema AUTHORIZATION some_user");
          testWc("CREATE SCHEMA my_schema AUTHORIZATION CURRENT_USER");
          testWc("CREATE SCHEMA my_schema AUTHORIZATION SESSION_USER");
          testWc("CREATE SCHEMA my_schema AUTHORIZATION CURRENT_ROLE");
        });

        it("supports schema-scoped statements", () => {
          testWc(`
            CREATE SCHEMA my_schema
              CREATE TABLE my_table (id INT)
              CREATE VIEW my_view AS SELECT 1
              CREATE INDEX my_index ON my_table(id)
              CREATE SEQUENCE my_seq
              GRANT SELECT ON TABLE my_table TO some_user
              GRANT some_role TO some_user
              CREATE TRIGGER my_trigger AFTER INSERT ON my_table FOR EACH ROW EXECUTE PROCEDURE my_func()
          `);
        });

        it("supports optional schema name", () => {
          testWc("CREATE SCHEMA AUTHORIZATION some_user");
        });
      });
    });

    describe("DROP SCHEMA", () => {
      it("supports DROP SCHEMA statement", () => {
        testWc("DROP SCHEMA my_schm");
        testWc("DROP SCHEMA proj.my_schm");
      });

      it("supports IF EXISTS", () => {
        testWc("DROP SCHEMA IF EXISTS my_schema");
      });

      dialect(["mysql", "mariadb"], () => {
        it("supports DROP DATABASE as alias to DROP SCHEMA", () => {
          testWc("DROP DATABASE my_schema");
        });
      });

      dialect("postgresql", () => {
        it("supports dropping multiple schemas", () => {
          testWc("DROP SCHEMA schema1, schema2, my.schema3");
        });
      });

      dialect(["bigquery", "postgresql"], () => {
        it("supports CASCADE / RESTRICT", () => {
          testWc("DROP SCHEMA my_schema CASCADE");
          testWc("DROP SCHEMA my_schema RESTRICT");
        });
      });
    });

    describe("ALTER SCHEMA", () => {
      dialect("bigquery", () => {
        it("supports IF EXISTS", () => {
          testWc("ALTER SCHEMA IF EXISTS my_schema SET OPTIONS(foo='bar')");
        });

        it("supports SET OPTIONS(...)", () => {
          testWc("ALTER SCHEMA my_schm SET OPTIONS(description='foo')");
        });

        it("supports SET DEFAULT COLLATE", () => {
          testWc("ALTER SCHEMA my_schm SET DEFAULT COLLATE 'mycollation'");
        });
      });

      dialect("postgresql", () => {
        it("supports IF EXISTS", () => {
          testWc("ALTER SCHEMA IF EXISTS foo RENAME TO bar");
        });

        it("supports RENAME TO", () => {
          testWc("ALTER SCHEMA my_schm RENAME TO my_other_schema");
        });

        it("supports OWNER TO", () => {
          testWc("ALTER SCHEMA my_schm OWNER TO some_user");
          testWc("ALTER SCHEMA my_schm OWNER TO CURRENT_USER");
          testWc("ALTER SCHEMA my_schm OWNER TO SESSION_USER");
          testWc("ALTER SCHEMA my_schm OWNER TO CURRENT_ROLE");
        });

        it("parses CURRENT_USER in OWNER TO as function call", () => {
          const stmt = parseStmt("ALTER SCHEMA my_schm OWNER TO CURRENT_USER");
          if (stmt.type !== "alter_schema_stmt") {
            throw new Error("Expected alter_schema_stmt");
          }
          const action = stmt.actions[0];
          if (action.type !== "alter_action_owner_to") {
            throw new Error("Expected alter_action_owner_to");
          }
          expect(action.owner.type).toBe("func_call");
        });
      });
    });
  });

  dialect("sqlite", () => {
    it("does not support CREATE/DROP SCHEMA", () => {
      expect(() => test("CREATE SCHEMA my_schema")).toThrowError();
      expect(() => test("DROP SCHEMA my_schema")).toThrowError();
    });
  });
});
