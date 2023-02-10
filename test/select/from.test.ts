import { dialect, test, testWc } from "../test_utils";

describe("select FROM", () => {
  it("supports basic syntax", () => {
    test("SELECT col FROM tbl");
    test("SELECT col from tbl");
    test("SELECT /*c1*/ col /*c2*/ FROM /*c3*/ tbl");
  });

  it("supports table alias", () => {
    test("SELECT t.col FROM my_db.my_long_table_name AS t");
    test("SELECT t.col FROM my_db.my_long_table_name t");
    test("SELECT t.col FROM db.tbl /*c1*/ AS /*c2*/ t");
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
  dialect(["mysql", "sqlite"], () => {
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
    test("SELECT t.col FROM (/*c1*/ db.tbl /*c2*/) /*c3*/ AS /*c4*/ t");
  });

  it("supports aliased table name in parenthesis", () => {
    test("SELECT t.col FROM (db.tbl AS t)");
    test("SELECT t.col FROM (db.tbl t)");
  });

  it("supports multi-nested table name in parenthesis", () => {
    test("SELECT t.col FROM (((tbl) AS t) AS t1) AS t2");
  });

  it("supports subselect in parenthesis", () => {
    test("SELECT t.col FROM (SELECT x FROM tbl) AS t");
    test("SELECT t.col FROM (/*c1*/ SELECT x FROM tbl /*c2*/) /*c3*/ AS /*c4*/ t");
  });

  it("supports comma-joined tables in parenthesis", () => {
    test("SELECT t.col FROM (tbl1, tbl2) AS t");
  });

  it("supports joined tables in parenthesis", () => {
    test("SELECT t.col FROM (tbl1 JOIN tbl2) AS t");
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
      test("SELECT * FROM my_table INDEXED BY my_idx");
      test("SELECT * FROM schm.my_table AS t1 INDEXED BY my_idx");
      test("SELECT * FROM my_table /*c1*/ INDEXED /*c2*/ BY /*c3*/ my_idx");
    });

    it("supports NOT INDEXED modifier on referenced tables", () => {
      test("SELECT * FROM my_table NOT INDEXED");
      test("SELECT * FROM schm.my_table AS t1 NOT INDEXED");
      test("SELECT * FROM my_table /*c1*/ NOT /*c2*/ INDEXED");
    });
  });

  dialect("bigquery", () => {
    describe("UNNEST operator", () => {
      it("supports UNNEST of array literal", () => {
        test("SELECT * FROM UNNEST([1,2,3])");
        test("SELECT * FROM UNNEST(ARRAY[1,2,3])");
        test("SELECT * FROM UNNEST /*c1*/ (/*c2*/ [1] /*c3*/)");
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
        test("SELECT * FROM UNNEST([1,2,3]) WITH OFFSET AS my_numbers");
        test("SELECT * FROM UNNEST([1,2,3]) WITH OFFSET my_numbers");
        test(`
          SELECT * FROM
            UNNEST([1,2,3]) /*c1*/ AS /*c2*/ my_nums /*c3*/
            WITH /*c4*/ OFFSET /*c5*/ AS /*c6*/ my_numbers
        `);
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
        test("SELECT * FROM my_table PIVOT(sum(sales) FOR quarter IN ('Q1', 'Q2'))");
        test(`
          SELECT * FROM my_table /*c0*/
          PIVOT /*c1*/ (/*c2*/
            sum(sales) /*c3*/
            FOR /*c4*/ quarter /*c5*/
            IN /*c6*/
            (/*c7*/ 'Q1', 'Q2' /*c8*/)
          /*c9*/)
        `);
      });

      it("supports aliases in pivot columns list", () => {
        test("SELECT * FROM my_table PIVOT(count(*) FOR quarter IN ('Q1' AS q1, 'Q2' q2))");
        test(`
          SELECT * FROM my_table
          PIVOT(
            count(*) FOR quarter IN
            ('Q1' /*c1*/ AS /*c2*/ q1, 'Q2' /*c3*/ q2)
          )
        `);
      });

      it("supports multiple aggregations", () => {
        test("SELECT * FROM my_table PIVOT(sum(sales), count(*) FOR quarter IN ('Q1'))");
      });

      it("supports aggregations with aliases", () => {
        test(
          "SELECT * FROM my_table PIVOT(sum(sales) AS total_sales, count(*) total_cnt FOR quarter IN ('Q1'))"
        );
        test(`
          SELECT * FROM my_table
          PIVOT(
            sum(sales) /*c1*/ AS /*c2*/ total_sales /*c3*/,
            /*c4*/ count(*) /*c5*/ total_cnt /*c6*/
            FOR quarter IN ('Q1')
          )
        `);
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
        test("SELECT * FROM my_table UNPIVOT(sales FOR quarter IN (Q1, Q2))");
        test(`
          SELECT * FROM my_table /*c0*/
          UNPIVOT /*c1*/ (/*c2*/
            sales /*c3*/
            FOR /*c4*/ quarter /*c5*/
            IN /*c6*/
            (/*c7*/ Q1, Q2 /*c8*/)
          /*c9*/)
        `);
      });

      it("supports aliases in single-column unpivot columns list", () => {
        test("SELECT * FROM my_table UNPIVOT(sales FOR quarter IN (Qrtr1 AS q1, Qrtr2 q2))");
        test(`
          SELECT * FROM my_table
          UNPIVOT(
            sales FOR quarter IN
            (Qrtr1 /*c1*/ AS /*c2*/ q1, Qrtr2 /*c3*/ q2)
          )
        `);
      });

      it("supports multi-column UNPIVOT aggregations", () => {
        test(
          "SELECT * FROM my_table UNPIVOT((first_half, second_half) FOR quarter IN ((Q1, Q2), (Q3, Q4)))"
        );
      });

      it("supports multi-column unpivot with aliases", () => {
        test(
          "SELECT * FROM my_table UNPIVOT((first_half, second_half) FOR quarter IN ((Q1, Q2) as sem1, (Q3, Q4) sem2))"
        );
        test(`
          SELECT * FROM my_table
          UNPIVOT(
            (/*c1*/ first_half /*c2*/,/*c3*/ second_half /*c4*/) /*c5*/
            FOR quarter IN /*c6*/ (
              /*c7*/ (/*cc*/ Q1, Q2 /*dd*/) /*c8*/ AS /*c9*/ sem1 /*c10*/,
              /*c11*/ ( Q3 /*cc*/,/*dd*/ Q4 ) /*c12*/ sem2 /*c13*/
            )/*c14*/
          )
        `);
      });

      it("supports unpivot with null handling modifiers", () => {
        test("SELECT * FROM my_table UNPIVOT INCLUDE NULLS (sales FOR quarter IN (Q1, Q2))");
        test(
          "SELECT * FROM my_table UNPIVOT /*c1*/ EXCLUDE /*c2*/ NULLS /*c3*/ (sales FOR quarter IN (Q1, Q2))"
        );
      });

      it("supports UNPIVOT between joins", () => {
        test("SELECT * FROM foo JOIN bar UNPIVOT(sales FOR col1 IN (Q1)) JOIN zap");
      });
    });

    describe("TABLESAMPLE operator", () => {
      it("supports TABLESAMPLE", () => {
        test("SELECT * FROM my_table TABLESAMPLE SYSTEM (10 PERCENT)");
        test(
          "SELECT * FROM my_table TABLESAMPLE /*c0*/ SYSTEM /*c1*/ (/*c*/ 25 /*c*/ PERCENT /*c*/)"
        );
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
