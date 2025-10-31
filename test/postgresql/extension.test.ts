import { dialect, notDialect, parse, testWc } from "../test_utils";

describe("EXTENSION", () => {
  dialect("postgresql", () => {
    describe("CREATE EXTENSION", () => {
      it("supports CREATE EXTENSION", () => {
        testWc(`CREATE EXTENSION foo`);
      });

      it("supports IF NOT EXISTS", () => {
        testWc(`CREATE EXTENSION IF NOT EXISTS foo`);
      });

      it("supports SCHEMA", () => {
        testWc(`CREATE EXTENSION foo SCHEMA my_schema`);
      });

      it("supports VERSION", () => {
        testWc(`CREATE EXTENSION foo VERSION ver1`);
        testWc(`CREATE EXTENSION foo VERSION 'version-1'`);
      });

      it("supports CASCADE", () => {
        testWc(`CREATE EXTENSION foo CASCADE`);
      });

      it("supports all the options togeteher", () => {
        testWc(`CREATE EXTENSION ex1 SCHEMA foo VERSION bar CASCADE`);
      });

      it("supports optional WITH keyword", () => {
        testWc(`CREATE EXTENSION ex1 WITH SCHEMA foo VERSION bar CASCADE`);
        testWc(`CREATE EXTENSION ex1 WITH SCHEMA foo`);
        testWc(`CREATE EXTENSION ex1 WITH VERSION bar`);
        testWc(`CREATE EXTENSION ex1 WITH CASCADE`);
      });
    });

    describe("DROP EXTENSION", () => {
      it("supports DROP EXTENSION", () => {
        testWc(`DROP EXTENSION foo`);
      });

      it("supports multiple extensions", () => {
        testWc(`DROP EXTENSION foo, bar, baz`);
      });

      it("supports IF EXISTS", () => {
        testWc(`DROP EXTENSION IF EXISTS foo`);
      });

      it("supports CASCADE and RESTRICT", () => {
        testWc(`DROP EXTENSION foo CASCADE`);
        testWc(`DROP EXTENSION foo RESTRICT`);
      });
    });
  });

  notDialect("postgresql", () => {
    it("does not support CREATE EXTENSION", () => {
      expect(() => parse("CREATE EXTENSION foo")).toThrowError();
    });
  });
});
