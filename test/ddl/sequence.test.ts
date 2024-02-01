import { dialect, notDialect, test, testWc } from "../test_utils";

describe("sequence", () => {
  dialect("postgresql", () => {
    const sequenceOptions = {
      "AS type": ["AS int", "AS varchar(100)"],
      "INCREMENT BY": ["INCREMENT BY 1", "INCREMENT +10", "INCREMENT -1"],
      START: ["START WITH 10", "START 1", "START -5"],
      RESTART: ["RESTART WITH 1", "RESTART 1", "RESTART -5"],
    };

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

      Object.entries(sequenceOptions).forEach(([option, examples]) => {
        it(`supports ${option}`, () => {
          examples.forEach((example) => {
            testWc(`CREATE SEQUENCE seq1 ${example}`);
          });
        });
      });

      it("supports multiple sequence options", () => {
        testWc("CREATE SEQUENCE seq1 START WITH 1 INCREMENT BY 1");
      });
    });

    describe("ALTER SEQUENCE", () => {
      it("supports basic ALTER SEQUENCE statement", () => {
        testWc("ALTER SEQUENCE my_seq RESTART");
        testWc("ALTER SEQUENCE my_schema.seq RESTART");
      });

      it("supports IF EXISTS", () => {
        testWc("ALTER SEQUENCE IF EXISTS my_seq RESTART");
      });

      Object.entries(sequenceOptions).forEach(([option, examples]) => {
        it(`supports ${option}`, () => {
          examples.forEach((example) => {
            testWc(`ALTER SEQUENCE seq1 ${example}`);
          });
        });
      });

      it("supports multiple sequence options", () => {
        testWc("ALTER SEQUENCE seq1 INCREMENT BY 2 RESTART");
      });

      it("supports SET {LOGGED|UNLOGGED}", () => {
        testWc("ALTER SEQUENCE seq1 SET LOGGED");
        testWc("ALTER SEQUENCE seq1 SET UNLOGGED");
      });

      it("supports OWNER TO", () => {
        testWc("ALTER SEQUENCE seq1 OWNER TO my_role");
        testWc("ALTER SEQUENCE seq1 OWNER TO CURRENT_USER");
        testWc("ALTER SEQUENCE seq1 OWNER TO SESSION_USER");
        testWc("ALTER SEQUENCE seq1 OWNER TO CURRENT_ROLE");
      });

      it("supports RENAME TO", () => {
        testWc("ALTER SEQUENCE seq1 RENAME TO seq2");
      });

      it("supports SET SCHEMA", () => {
        testWc("ALTER SEQUENCE seq1 SET SCHEMA my_schema");
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
