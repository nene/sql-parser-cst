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
