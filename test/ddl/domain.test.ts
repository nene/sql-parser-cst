import { dialect, notDialect, testWc } from "../test_utils";

describe("domain", () => {
  dialect("postgresql", () => {
    describe("CREATE DOMAIN", () => {
      it("supports CREATE DOMAIN", () => {
        testWc("CREATE DOMAIN address AS TEXT");
        testWc("CREATE DOMAIN my_schema.my_domain AS INT");
      });

      it("supports CREATE DOMAIN without AS", () => {
        testWc("CREATE DOMAIN my_domain TEXT");
      });

      it("supports COLLATE", () => {
        testWc(`CREATE DOMAIN my_domain AS TEXT COLLATE "de_DE"`);
      });

      it("supports DEFAULT", () => {
        testWc(`CREATE DOMAIN my_domain AS TEXT DEFAULT ''`);
      });

      it("supports constraints", () => {
        testWc(`CREATE DOMAIN foo AS INT NOT NULL`);
        testWc(`CREATE DOMAIN foo AS INT NULL`);
        testWc(`CREATE DOMAIN foo AS INT CHECK (foo > 0)`);
        testWc(`CREATE DOMAIN foo AS INT NOT NULL CHECK (foo < 100)`);
      });

      it("supports named constraints", () => {
        testWc(`CREATE DOMAIN foo AS INT CONSTRAINT exists NOT NULL`);
        testWc(`CREATE DOMAIN foo AS INT CONSTRAINT positive CHECK (foo > 0)`);
      });
    });

    describe("ALTER DOMAIN", () => {
      it("supports RENAME TO", () => {
        testWc("ALTER DOMAIN my_domain RENAME TO new_domain");
        testWc("ALTER DOMAIN my_schema.my_domain RENAME TO new_domain");
      });

      it("supports SET SCHEMA", () => {
        testWc("ALTER DOMAIN my_domain SET SCHEMA new_schema");
      });

      it("supports OWNER TO", () => {
        testWc("ALTER DOMAIN my_domain OWNER TO new_owner");
      });

      it("supports SET/DROP DEFAULT", () => {
        testWc("ALTER DOMAIN my_domain SET DEFAULT 0");
        testWc("ALTER DOMAIN my_domain DROP DEFAULT");
      });

      it("supports SET/DROP NOT NULL", () => {
        testWc("ALTER DOMAIN my_domain SET NOT NULL");
        testWc("ALTER DOMAIN my_domain DROP NOT NULL");
      });
    });

    describe("DROP DOMAIN", () => {
      it("supports DROP DOMAIN", () => {
        testWc("DROP DOMAIN my_domain");
        testWc("DROP DOMAIN my_schema.my_domain");
        testWc("DROP DOMAIN foo, bar, baz");
      });

      it("supports IF EXISTS", () => {
        testWc("DROP DOMAIN IF EXISTS my_domain");
      });

      it("supports CASCADE|RESTRICT", () => {
        testWc("DROP DOMAIN my_domain CASCADE");
        testWc("DROP DOMAIN my_domain RESTRICT");
      });
    });
  });

  notDialect("postgresql", () => {
    it("does not support CREATE DOMAIN", () => {
      expect(() => test("CREATE DOMAIN address AS TEXT")).toThrowError();
    });
    it("does not support DROP DOMAIN", () => {
      expect(() => test("DROP DOMAIN address")).toThrowError();
    });
  });
});
