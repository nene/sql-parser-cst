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

  dialect(["mysql", "mariadb", "postgresql"], () => {
    it("supports table column aliases", () => {
      test("SELECT t.col1 FROM tbl AS t (col1, col2)");
      test("SELECT t.col2 FROM tbl t (col1, col2)");
    });
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

    it("supports partitioned table", () => {
      testWc(`SELECT * FROM tbl PARTITION (p0, p1)`);
      testWc(`SELECT * FROM tbl PARTITION (p0, p1) AS t`);
    });
  });

  describe("LATERAL expressions", () => {
    dialect(["mysql", "mariadb", "postgresql"], () => {
      it("supports LATERAL subquery", () => {
        testWc(`SELECT 8 FROM tbl JOIN LATERAL (SELECT * FROM foo WHERE id=tbl.id) AS t`);
      });
    });

    dialect(["postgresql"], () => {
      it("supports LATERAL table function", () => {
        testWc(`SELECT * FROM LATERAL table_func(1, 2, 3) AS t`);
      });
    });
  });

  dialect("postgresql", () => {
    it("supports ROWS FROM", () => {
      testWc(`SELECT * FROM ROWS FROM (fn1(), fn2(1, 2), fn3())`);
    });

    it("parses ROWS FROM as rows_from_expr", () => {
      expect(parseFrom("ROWS FROM(fn1(), fn2())").type).toBe("rows_from_expr");
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
});
