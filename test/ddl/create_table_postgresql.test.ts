import { dialect, notDialect, parseStmt, testWc } from "../test_utils";

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
        it("supports FROM .. TO .. with MINVALUE and MAXVALUE", () => {
          testWc(`
            CREATE TABLE sales_2020 PARTITION OF sales
            FOR VALUES FROM (2020, MINVALUE) TO (2021, MAXVALUE)
          `);
        });
        it("parses MINVALUE and MAXVALUE as special node types", () => {
          const stmt = parseStmt(
            `CREATE TABLE x PARTITION OF y FOR VALUES FROM (MINVALUE) TO (MAXVALUE)`
          );
          if (stmt.type !== "create_table_stmt") {
            throw new Error("Expected create_table_stmt");
          }
          const bound = stmt.clauses[0];
          if (bound.type !== "create_table_partition_bound_clause") {
            throw new Error("Expected create_table_partition_bound_clause");
          }
          if (bound.bound.type !== "partition_bound_from_to") {
            throw new Error("Expected partition_bound_from_to");
          }
          expect(bound.bound.from.expr.items[0]).toMatchInlineSnapshot(`
            {
              "minvalueKw": {
                "name": "MINVALUE",
                "text": "MINVALUE",
                "type": "keyword",
              },
              "type": "partition_bound_minvalue",
            }
          `);
          expect(bound.bound.to.expr.items[0]).toMatchInlineSnapshot(`
            {
              "maxvalueKw": {
                "name": "MAXVALUE",
                "text": "MAXVALUE",
                "type": "keyword",
              },
              "type": "partition_bound_maxvalue",
            }
          `);
        });

        it("supports FOR VALUES IN (.., ..)", () => {
          testWc(`
            CREATE TABLE sales_2020 PARTITION OF sales
            FOR VALUES IN ('2020-01-01', '2020-02-01')
          `);
        });

        it("supports FOR VALUES WITH (.., ..)", () => {
          testWc(`
            CREATE TABLE sales_2020 PARTITION OF sales
            FOR VALUES WITH ( MODULUS 5, REMAINDER 4 )
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
