import { dialect, notDialect, test, testWc } from "../../test_utils";

describe("select FROM + table inheritance modifiers", () => {
  dialect("postgresql", () => {
    it("supports explicitly including inherited tables: table *", () => {
      testWc("SELECT * FROM my_table *");
    });

    it("supports explicitly excluding inherited tables: ONLY table", () => {
      testWc("SELECT * FROM ONLY my_table");
    });

    it("supports combining inherited and uninherited tables in joins", () => {
      testWc("SELECT * FROM ONLY foo JOIN bar.rar * USING (id) JOIN ONLY zip.zap USING (id)");
    });
  });

  notDialect("postgresql", () => {
    it("does not support table inheritance modifiers", () => {
      expect(() => test("SELECT * FROM tbl*")).toThrowError();
    });
  });
});
