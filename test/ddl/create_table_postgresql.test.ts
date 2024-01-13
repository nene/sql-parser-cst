import { dialect, notDialect, parseStmt, test, testWc, withComments } from "../test_utils";

describe("create table (PostgreSQL)", () => {
  function testClauseWc(clause: string) {
    test(`CREATE TABLE t (id INT) ${withComments(clause)}`);
  }

  dialect("postgresql", () => {
    it("supports CREATE TABLE .. INHERITS", () => {
      testClauseWc("INHERITS (parent)");
      testClauseWc("INHERITS (parent1, parent2)");
    });

    describe("partitioning", () => {
      describe("creating partitioned table", () => {
        it("supports PARTITION BY strategy (...)", () => {
          testClauseWc("PARTITION BY RANGE (id)");
          testClauseWc("PARTITION BY LIST (id, name)");
          testClauseWc("PARTITION BY HASH (id, (a + b))");
        });

        it("supports PARTITION BY with COLLATE", () => {
          testClauseWc(`PARTITION BY RANGE (id COLLATE "en_US")`);
          testClauseWc(`PARTITION BY RANGE ((a || b) COLLATE "C")`);
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

    it("supports CREATE TABLE .. OF type", () => {
      testWc("CREATE TABLE client OF client_type");
      testWc("CREATE TABLE foo OF schm.my_type");
    });

    it("supports ON COMMIT clause", () => {
      testClauseWc(`ON COMMIT PRESERVE ROWS`);
      testClauseWc(`ON COMMIT DELETE ROWS`);
      testClauseWc(`ON COMMIT DROP`);
    });

    it("supports TABLESPACE clause", () => {
      testClauseWc(`TABLESPACE ts_1`);
    });

    it("supports USING clause", () => {
      testClauseWc(`USING "SP-GiST"`);
    });

    describe("storage parameters", () => {
      it("supports WITH clause", () => {
        testClauseWc(`WITH ( OIDS = FALSE, fillfactor = 50, toast.autovacuum_enabled = FALSE )`);
      });

      it("supports value-less parameters", () => {
        testClauseWc(`WITH ( autovacuum_enabled, vacuum_truncate )`);
      });

      it("supports ON/OFF/AUTO values for the vacuum_index_cleanup parameter", () => {
        testClauseWc(`WITH (vacuum_index_cleanup = ON)`);
        testClauseWc(`WITH (vacuum_index_cleanup = OFF)`);
        testClauseWc(`WITH (toast.vacuum_index_cleanup = AUTO)`);
      });

      it("supports WITHOUT OIDS clause", () => {
        testClauseWc(`WITHOUT OIDS`);
      });
    });
  });

  notDialect("postgresql", () => {
    it("does not support CREATE TABLE INHERITS", () => {
      expect(() => testClauseWc("INHERITS (parent)")).toThrowError();
    });

    it("does not support CREATE TABLE .. PARTITION BY", () => {
      expect(() => testClauseWc("PARTITION BY RANGE (id)")).toThrowError();
    });
  });
});
