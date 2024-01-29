import { dialect, test, testWc } from "../test_utils";

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
    });
  });

  dialect("sqlite", () => {
    it("does not support CREATE/DROP SCHEMA", () => {
      expect(() => test("CREATE SCHEMA my_schema")).toThrowError();
      expect(() => test("DROP SCHEMA my_schema")).toThrowError();
    });
  });
});
