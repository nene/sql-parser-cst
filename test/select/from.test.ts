import { dialect, test } from "../test_utils";

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

    it.skip("supports PIVOT & UNPIVOT as implicit table aliases", () => {
      test("SELECT pivot.col FROM my_db.my_long_table_name pivot");
      test("SELECT unpivot.col FROM my_db.my_long_table_name unpivot");
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

      it("supports UNNEST with alias", () => {
        test("SELECT * FROM UNNEST(tbl.foo) AS blah");
      });

      it("supports UNNEST comma-joined with other tables", () => {
        test("SELECT * FROM tbl1, UNNEST(tbl.foo), tbl2");
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
  });
});
