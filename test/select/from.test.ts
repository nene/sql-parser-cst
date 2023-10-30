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
