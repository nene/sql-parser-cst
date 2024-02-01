import { dialect, notDialect, test, testWc } from "../test_utils";

describe("sequence", () => {
  dialect("postgresql", () => {
    describe("CREATE SEQUENCE", () => {
      it("supports basic CREATE SEQUENCE statement", () => {
        testWc("CREATE SEQUENCE my_seq");
        testWc("CREATE SEQUENCE my_schema.seq");
      });

      it("supports IF NOT EXISTS", () => {
        testWc("CREATE SEQUENCE IF NOT EXISTS my_seq");
      });

      it("supports TEMPORARY", () => {
        testWc("CREATE TEMPORARY SEQUENCE seq1");
        testWc("CREATE TEMP SEQUENCE seq1");
      });

      it("supports UNLOGGED", () => {
        testWc("CREATE UNLOGGED SEQUENCE seq1");
      });
    });

    describe("DROP SEQUENCE", () => {
      it("supports basic DROP SEQUENCE statement", () => {
        testWc("DROP SEQUENCE my_seq");
        testWc("DROP SEQUENCE my_schema.seq");
      });

      it("supports IF EXISTS", () => {
        testWc("DROP SEQUENCE IF EXISTS my_seq");
      });

      it("supports multiple sequences", () => {
        testWc("DROP SEQUENCE seq1, seq2");
      });

      it("supports CASCADE/RESTRICT", () => {
        testWc("DROP SEQUENCE seq1 CASCADE");
        testWc("DROP SEQUENCE seq1 RESTRICT");
      });
    });
  });

  notDialect("postgresql", () => {
    it("does not support CREATE/DROP SEQUENCE", () => {
      expect(() => test("CREATE SEQUENCE my_schema")).toThrowError();
      expect(() => test("DROP SEQUENCE my_schema")).toThrowError();
    });
  });
});
