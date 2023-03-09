import { JoinExpr } from "../../src/main";
import { dialect, parseFrom, test, testWc } from "../test_utils";

describe("select FROM", () => {
  it("supports basic syntax", () => {
    testWc("SELECT col FROM tbl");
    testWc("SELECT col from tbl");
  });

  it("supports table alias", () => {
    testWc("SELECT t.col FROM my_db.my_long_table_name AS t");
    testWc("SELECT t.col FROM my_db.my_long_table_name t");
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports FROM DUAL", () => {
      testWc("SELECT 1 FROM DUAL");
    });

    it("parses FROM DUAL", () => {
      expect(parseFrom("DUAL")).toMatchInlineSnapshot(`
        {
          "dualKw": {
            "name": "DUAL",
            "text": "DUAL",
            "type": "keyword",
          },
          "type": "dual_table",
        }
      `);
    });
  });

  dialect("bigquery", () => {
    it("supports PIVOT & UNPIVOT as explicit table aliases", () => {
      test("SELECT pivot.col FROM my_db.my_long_table_name AS pivot");
      test("SELECT unpivot.col FROM my_db.my_long_table_name AS unpivot");
    });

    it("supports PIVOT & UNPIVOT as implicit table aliases", () => {
      test("SELECT pivot.col FROM my_db.my_long_table_name pivot");
      test("SELECT unpivot.col FROM my_db.my_long_table_name unpivot");
    });

    it("supports PIVOT & UNPIVOT as implicit table alias followed by UNPIVOT/PIVOT expression", () => {
      test("SELECT * FROM tbl pivot PIVOT(sum(sales) FOR quarter IN ('Q1', 'Q2'))");
      test("SELECT * FROM tbl unpivot UNPIVOT(sales FOR quarter IN (q1, q2))");
    });
  });
  // To ensure the BigQuery PIVOT/UNPIVOT handling doesn't interfere with other dialects
  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("supports PIVOT & UNPIVOT as aliases", () => {
      test("SELECT * FROM foo.col AS pivot");
      test("SELECT * FROM foo.col AS unpivot");
      test("SELECT * FROM foo.col pivot");
      test("SELECT * FROM foo.col unpivot");
    });
  });

  it("supports table name in parenthesis", () => {
    test("SELECT col FROM (tbl)");
    test("SELECT t.col FROM (db.tbl) AS t");
    test("SELECT t.col FROM (db.tbl) t");
    testWc("SELECT t.col FROM ( db.tbl ) AS t");
  });

  it("supports aliased table name in parenthesis", () => {
    test("SELECT t.col FROM (db.tbl AS t)");
    test("SELECT t.col FROM (db.tbl t)");
  });

  it("supports multi-nested table name in parenthesis", () => {
    test("SELECT t.col FROM (((tbl) AS t) AS t1) AS t2");
  });

  it("supports subselect in parenthesis", () => {
    testWc("SELECT t.col FROM ( SELECT x FROM tbl ) AS t");
  });

  it("supports comma-joined tables in parenthesis", () => {
    test("SELECT t.col FROM (tbl1, tbl2) AS t");
  });

  it("supports joined tables in parenthesis", () => {
    test("SELECT t.col FROM (tbl1 JOIN tbl2) AS t");
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports list of table names in parenthesis", () => {
      test("SELECT * FROM tbl1 JOIN (tbl2, tbl3, tbl4)");
    });

    it("parses list of table names as comma-joined tables", () => {
      const join = parseFrom("tbl1 JOIN (tbl2, tbl3)") as JoinExpr;
      expect(join.right.type).toBe("paren_expr");
      if (join.right.type === "paren_expr") {
        expect(join.right.expr).toMatchInlineSnapshot(`
          {
            "left": {
              "name": "tbl2",
              "text": "tbl2",
              "type": "identifier",
            },
            "operator": ",",
            "right": {
              "name": "tbl3",
              "text": "tbl3",
              "type": "identifier",
            },
            "specification": undefined,
            "type": "join_expr",
          }
        `);
      }
    });

    it("supports LATERAL subquery", () => {
      testWc(`SELECT 8 FROM tbl JOIN LATERAL (SELECT * FROM foo WHERE id=tbl.id) AS t`);
    });

    it("supports partitioned table", () => {
      testWc(`SELECT * FROM tbl PARTITION (p0, p1)`);
      testWc(`SELECT * FROM tbl PARTITION (p0, p1) AS t`);
    });
  });

  describe("table functions", () => {
    it("supports table-valued functions", () => {
      test("SELECT * FROM generate_series(5, 10)");
    });
    it("supports schema-scoped table-valued functions", () => {
      test("SELECT * FROM my_schema.my_func(5, 10)");
    });
    it("supports combining table-functions with joins", () => {
      test("SELECT * FROM func1(5, 10) JOIN func2(8)");
    });
  });

  dialect("sqlite", () => {
    it("supports INDEXED BY modifier on referenced tables", () => {
      testWc("SELECT * FROM my_table INDEXED BY my_idx");
      testWc("SELECT * FROM schm.my_table AS t1 INDEXED BY my_idx");
    });

    it("supports NOT INDEXED modifier on referenced tables", () => {
      testWc("SELECT * FROM my_table NOT INDEXED");
      testWc("SELECT * FROM schm.my_table AS t1 NOT INDEXED");
    });
  });

  dialect("bigquery", () => {
    describe("UNNEST operator", () => {
      it("supports UNNEST of array literal", () => {
        test("SELECT * FROM UNNEST([1,2,3])");
        test("SELECT * FROM UNNEST(ARRAY[1,2,3])");
        testWc("SELECT * FROM UNNEST ( [1] )");
      });

      it("supports UNNEST of array path", () => {
        test("SELECT * FROM UNNEST(my_tbl.array_col)");
      });

      it("supports UNNEST of long array path", () => {
        test("SELECT * FROM UNNEST(my_tbl.some.long.path.to.array)");
      });

      it("supports UNNEST with alias", () => {
        test("SELECT * FROM UNNEST(tbl.foo) AS blah");
      });

      it("supports UNNEST .. WITH OFFSET", () => {
        test("SELECT * FROM UNNEST([1,2,3]) WITH OFFSET");
      });

      it("supports UNNEST+alias .. WITH OFFSET", () => {
        test("SELECT * FROM UNNEST([1,2,3]) AS my_numbers WITH OFFSET");
        test("SELECT * FROM UNNEST([1,2,3]) my_numbers WITH OFFSET");
      });

      it("supports UNNEST .. WITH OFFSET+alias", () => {
        testWc("SELECT * FROM UNNEST([1,2,3]) WITH OFFSET AS my_numbers");
        testWc("SELECT * FROM UNNEST([1,2,3]) WITH OFFSET my_numbers");
      });

      it("supports UNNEST comma-joined with other tables", () => {
        test("SELECT * FROM tbl1, UNNEST(tbl.foo), tbl2");
      });

      it("supports implicit unnest", () => {
        test("SELECT * FROM kind_of.really.long.expression.here.that.evaluates.to.table");
      });

      it("supports implicit unnest WITH OFFSET", () => {
        test("SELECT * FROM foo.bar.baz WITH OFFSET");
        test("SELECT * FROM foo.bar.baz AS b WITH OFFSET");
        test("SELECT * FROM foo.bar.baz AS b WITH OFFSET AS x");
      });
    });

    describe("PIVOT operator", () => {
      it("supports simple PIVOT", () => {
        testWc("SELECT * FROM my_table PIVOT ( sum(sales) FOR quarter IN ( 'Q1', 'Q2' ) )");
      });

      it("supports aliases in pivot columns list", () => {
        testWc("SELECT * FROM my_table PIVOT(count(*) FOR quarter IN ('Q1' AS q1, 'Q2' q2))");
      });

      it("supports multiple aggregations", () => {
        test("SELECT * FROM my_table PIVOT(sum(sales), count(*) FOR quarter IN ('Q1'))");
      });

      it("supports aggregations with aliases", () => {
        testWc(
          "SELECT * FROM my_table PIVOT(sum(sales) AS total_sales, count(*) total_cnt FOR quarter IN ('Q1'))"
        );
      });

      it("supports PIVOT over subquery", () => {
        test("SELECT * FROM (SELECT * FROM foo) PIVOT(count(*) FOR col1 IN ('Q1'))");
      });

      it("supports PIVOT between joins", () => {
        test("SELECT * FROM foo JOIN bar PIVOT(count(*) FOR col1 IN ('Q1')) JOIN zap");
      });
    });

    describe("UNPIVOT operator", () => {
      it("supports single-column UNPIVOT", () => {
        testWc("SELECT * FROM my_table UNPIVOT ( sales FOR quarter IN ( Q1 , Q2 ) )");
      });

      it("supports aliases in single-column unpivot columns list", () => {
        testWc("SELECT * FROM my_table UNPIVOT(sales FOR quarter IN (Qrtr1 AS q1, Qrtr2 q2))");
      });

      it("supports multi-column UNPIVOT aggregations", () => {
        test(
          "SELECT * FROM my_table UNPIVOT((first_half, second_half) FOR quarter IN ((Q1, Q2), (Q3, Q4)))"
        );
      });

      it("supports multi-column unpivot with aliases", () => {
        testWc(
          "SELECT * FROM my_table UNPIVOT( ( first_half, second_half ) FOR quarter IN ( ( Q1 , Q2 ) as sem1 , ( Q3 , Q4 ) sem2) )"
        );
      });

      it("supports unpivot with null handling modifiers", () => {
        testWc("SELECT * FROM my_table UNPIVOT INCLUDE NULLS (sales FOR quarter IN (Q1, Q2))");
      });

      it("supports UNPIVOT between joins", () => {
        test("SELECT * FROM foo JOIN bar UNPIVOT(sales FOR col1 IN (Q1)) JOIN zap");
      });
    });

    describe("TABLESAMPLE operator", () => {
      it("supports TABLESAMPLE", () => {
        testWc("SELECT * FROM my_table TABLESAMPLE SYSTEM ( 10 PERCENT )");
      });

      it("supports TABLESAMPLE inside JOIN", () => {
        test("SELECT * FROM tbl1 TABLESAMPLE SYSTEM (1 percent) JOIN tbl2");
      });
    });

    describe("FOR SYSTEM_TIME AS OF operator", () => {
      it("supports FOR SYSTEM_TIME AS OF", () => {
        testWc("SELECT * FROM my_table FOR SYSTEM_TIME AS OF my_timestamp");
      });

      it("supports FOR SYSTEM_TIME AS OF inside JOIN", () => {
        test("SELECT * FROM tbl1 FOR SYSTEM_TIME AS OF my_timestamp JOIN tbl2");
      });
    });
  });
});
