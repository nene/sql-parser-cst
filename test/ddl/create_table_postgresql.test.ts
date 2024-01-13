import { dialect, notDialect, testWc } from "../test_utils";

describe("create table (PostgreSQL)", () => {
  dialect("postgresql", () => {
    it("supports CREATE TABLE .. INHERITS", () => {
      testWc("CREATE TABLE tbl (id INT) INHERITS (parent)");
      testWc("CREATE TABLE tbl (id INT) INHERITS (parent1, parent2)");
    });

    describe("partitioning", () => {
      it("supports PARTITION BY strategy (...)", () => {
        testWc("CREATE TABLE tbl (id INT) PARTITION BY RANGE (id)");
        testWc("CREATE TABLE tbl (id INT) PARTITION BY LIST (id, name)");
        testWc("CREATE TABLE tbl (id INT) PARTITION BY HASH (id, (a + b))");
      });

      it("supports PARTITION BY with COLLATE", () => {
        testWc(`CREATE TABLE tbl (id INT) PARTITION BY RANGE (id COLLATE "en_US")`);
        testWc(`CREATE TABLE tbl (id INT) PARTITION BY RANGE ((a || b) COLLATE "C")`);
      });
    });
  });

  notDialect("postgresql", () => {
    it("does not support CREATE TABLE INHERITS", () => {
      expect(() => testWc("CREATE TABLE tbl (id INT) INHERITS (parent)")).toThrowError();
    });

    it("does not support CREATE TABLE .. PARTITION BY", () => {
      expect(() => testWc("CREATE TABLE tbl (id INT) PARTITION BY RANGE (id)")).toThrowError();
    });
  });
});
