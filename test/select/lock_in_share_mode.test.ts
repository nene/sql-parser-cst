import { dialect, notDialect, testClauseWc } from "../test_utils";

describe("select LOCK IN SHARE MODE", () => {
  dialect(["mysql", "mariadb"], () => {
    it("supports LOCK IN SHARE MODE clause", () => {
      testClauseWc("LOCK IN SHARE MODE");
    });
  });

  notDialect(["mysql", "mariadb"], () => {
    it("does not suppprt LOCK IN SHARE MODE", () => {
      expect(() => testClauseWc("LOCK IN SHARE MODE")).toThrowError();
    });
  });
});
