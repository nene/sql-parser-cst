import { dialect, notDialect, test, testWc } from "../../test_utils";

describe("select FROM + PIVOT/UNPIVOT", () => {
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
  notDialect("bigquery", () => {
    it("supports PIVOT & UNPIVOT as aliases", () => {
      test("SELECT * FROM foo.col AS pivot");
      test("SELECT * FROM foo.col AS unpivot");
      test("SELECT * FROM foo.col pivot");
      test("SELECT * FROM foo.col unpivot");
    });
  });

  dialect("bigquery", () => {
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
  });
});
