import { dialect, notDialect, parse, testWc } from "../test_utils";

describe("SUBSCRIPTION", () => {
  dialect("postgresql", () => {
    describe("DROP SUBSCRIPTION", () => {
      it("supports DROP SUBSCRIPTION", () => {
        testWc(`DROP SUBSCRIPTION foo`);
      });

      it("supports IF EXISTS", () => {
        testWc(`DROP SUBSCRIPTION IF EXISTS foo`);
      });

      it("supports CASCADE and RESTRICT", () => {
        testWc(`DROP SUBSCRIPTION foo CASCADE`);
        testWc(`DROP SUBSCRIPTION foo RESTRICT`);
      });
    });
  });

  notDialect("postgresql", () => {
    it("does not support DROP SUBSCRIPTION", () => {
      expect(() => parse("DROP SUBSCRIPTION foo")).toThrowError();
    });
  });
});
