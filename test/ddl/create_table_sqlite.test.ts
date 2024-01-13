import { dialect, notDialect, testWc } from "../test_utils";

describe("create table (SQLite)", () => {
  dialect("sqlite", () => {
    it("supports CREATE VIRTUAL TABLE statement", () => {
      testWc("CREATE VIRTUAL TABLE tbl USING my_module");
      testWc("CREATE VIRTUAL TABLE schm.tbl USING my_module");
      testWc("CREATE VIRTUAL TABLE IF NOT EXISTS tbl USING my_module");
      testWc("CREATE VIRTUAL TABLE tbl USING my_module(1, 2, 3)");
    });

    it("supports CREATE TABLE with STRICT & WITHOUT ROWID options", () => {
      testWc("CREATE TABLE foo (id INT) STRICT");
      testWc("CREATE TABLE foo (id INT) WITHOUT ROWID");
      testWc("CREATE TABLE foo (id INT) STRICT, WITHOUT ROWID");
    });
  });

  notDialect("sqlite", () => {
    it("does not support CREATE VIRTUAL TABLE", () => {
      expect(() => testWc("CREATE VIRTUAL TABLE foo USING my_module")).toThrowError();
    });
  });
});
