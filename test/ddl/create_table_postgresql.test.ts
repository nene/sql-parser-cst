import { dialect, notDialect, testWc } from "../test_utils";

describe("create table (PostgreSQL)", () => {
  dialect("postgresql", () => {
    it("supports CREATE TABLE .. INHERITS", () => {
      testWc("CREATE TABLE tbl (id INT) INHERITS (parent)");
      testWc("CREATE TABLE tbl (id INT) INHERITS (parent1, parent2)");
    });

    describe("partitioning", () => {
      describe("creating partitioned table", () => {
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

      describe("creating individual partitions with PARTITION OF", () => {
        it("supports creation of default partition", () => {
          testWc(`CREATE TABLE sales_2020 PARTITION OF sales DEFAULT`);
        });

        it("supports FOR VALUES FROM .. TO ..", () => {
          testWc(`
            CREATE TABLE sales_2020 PARTITION OF sales
            FOR VALUES FROM ('2020-01-01') TO ('2021-01-01')
          `);
        });

        it("supports FOR VALUES IN (.., ..)", () => {
          testWc(`
            CREATE TABLE sales_2020 PARTITION OF sales
            FOR VALUES IN ('2020-01-01', '2020-02-01')
          `);
        });
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
