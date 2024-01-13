import { dialect, notDialect, testWc } from "../test_utils";

describe("create table (PostgreSQL)", () => {
  dialect("postgresql", () => {
    it("supports CREATE TABLE .. INHERITS", () => {
      testWc("CREATE TABLE tbl (id INT) INHERITS (parent)");
      testWc("CREATE TABLE tbl (id INT) INHERITS (parent1, parent2)");
    });
  });

  notDialect("postgresql", () => {
    it("does not support CREATE TABLE INHERITS", () => {
      expect(() => testWc("CREATE TABLE tbl (id INT) INHERITS (parent)")).toThrowError();
    });
  });
});
