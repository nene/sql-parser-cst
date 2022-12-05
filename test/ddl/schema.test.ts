import { dialect, test } from "../test_utils";

describe("schema", () => {
  dialect(["bigquery", "mysql"], () => {
    describe("CREATE SCHEMA", () => {
      it("supports CREATE SCHEMA statement", () => {
        test("CREATE SCHEMA my_schema");
        test("CREATE SCHEMA my_project.my_schema");
        test("CREATE /*c1*/ SCHEMA /*c2*/ my_schema");
      });

      it("supports IF NOT EXISTS", () => {
        test("CREATE SCHEMA IF NOT EXISTS my_schema");
        test("CREATE SCHEMA /*c1*/ IF /*c2*/ NOT /*c3*/ EXISTS /*c4*/ my_schema");
      });

      dialect("mysql", () => {
        it("supports CREATE DATABASE as alias to CREATE SCHEMA", () => {
          test("CREATE DATABASE my_schema");
        });
      });

      dialect("bigquery", () => {
        it("supports DEFAULT COLLATE", () => {
          test("CREATE SCHEMA my_schema DEFAULT COLLATE 'udn:ci'");
          test("CREATE SCHEMA my_schema /*c1*/ DEFAULT /*c2*/ COLLATE /*c3*/ 'udn:ci'");
        });

        it("supports OPTIONS()", () => {
          test("CREATE SCHEMA my_schema OPTIONS(description='Hello')");
          test("CREATE SCHEMA my_schema /*c1*/ OPTIONS /*c2*/ (/*c1*/ description='Hello' /*c3*/)");
        });

        it("supports both OPTIONS() and DEFAULT COLLATE", () => {
          test("CREATE SCHEMA my_schema OPTIONS(description='Hello') DEFAULT COLLATE 'udn:ci'");
        });
      });
    });

    describe("DROP SCHEMA", () => {
      it("supports DROP SCHEMA statement", () => {
        test("DROP SCHEMA my_schm");
        test("DROP SCHEMA proj.my_schm");
        test("DROP /*c1*/ SCHEMA /*c2*/ my_schm");
      });

      it("supports IF EXISTS", () => {
        test("DROP SCHEMA IF EXISTS my_schema");
        test("DROP SCHEMA /*c1*/ IF /*c2*/ EXISTS /*c3*/ my_schema");
      });

      dialect("mysql", () => {
        it("supports DROP DATABASE as alias to DROP SCHEMA", () => {
          test("DROP DATABASE my_schema");
        });
      });

      dialect("bigquery", () => {
        it("supports CASCADE / RESTRICT", () => {
          test("DROP SCHEMA my_schema CASCADE");
          test("DROP SCHEMA my_schema /*c1*/ RESTRICT");
        });
      });
    });

    describe("ALTER SCHEMA", () => {
      dialect("bigquery", () => {
        it("supports IF EXISTS", () => {
          test("ALTER SCHEMA IF EXISTS my_schema SET OPTIONS(foo='bar')");
          test(`
            ALTER /*c0*/ SCHEMA /*c1*/ IF /*c2*/ EXISTS /*c3*/ my_schema /*c4*/
            SET /*c5*/ OPTIONS /*c6*/ (foo='bar')
          `);
        });

        it("supports SET OPTIONS(...)", () => {
          test("ALTER SCHEMA my_schm SET OPTIONS(description='foo')");
        });

        it("supports SET DEFAULT COLLATE", () => {
          test("ALTER SCHEMA my_schm SET DEFAULT COLLATE 'mycollation'");
          test(`
            ALTER SCHEMA my_schm /*c1*/
            SET /*c2*/ DEFAULT /*c3*/ COLLATE /*c4*/ 'mycollation'
          `);
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
