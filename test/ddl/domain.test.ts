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
