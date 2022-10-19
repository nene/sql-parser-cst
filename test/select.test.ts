import { dialect, parse, test } from "./test_utils";

describe("select", () => {
  it("parses simple SELECT", () => {
    test("SELECT 'hello'");
    test("SELECT 1, 2, 3");
    test("select 123");
    test("SELECT /*c0*/ 1 /*c1*/, /*c2*/ 2");
  });

  it("parses SELECT with set quantifier", () => {
    test("SELECT ALL foo");
    test("SELECT DISTINCT foo");
  });

  dialect("mysql", () => {
    it("parses SELECT with MySQL-specific options", () => {
      test("SELECT DISTINCTROW foo AS x");
      test("SELECT HIGH_PRIORITY foo AS x");
      test("SELECT STRAIGHT_JOIN foo AS x");
      test("SELECT SQL_SMALL_RESULT foo AS x");
      test("SELECT SQL_BIG_RESULT foo AS x");
      test("SELECT SQL_BUFFER_RESULT foo AS x");
      test("SELECT SQL_NO_CACHE foo AS x");
      test("SELECT SQL_CALC_FOUND_ROWS foo AS x");
    });

    it("parses SELECT with multiple options", () => {
      test("SELECT DISTINCT STRAIGHT_JOIN SQL_NO_CACHE foo");
    });
  });

  it("parses column aliases", () => {
    test("SELECT 'hello' AS foo");
    test("SELECT 1 as bar, 2 baz");
    test("SELECT 1 /*c1*/ as /*c2*/ bar");
    test("SELECT 1 /*c*/ bar");
  });

  it("supports string as column alias", () => {
    test(`SELECT col AS 'foo'`);
    test(`SELECT col AS "foo"`);
    test(`SELECT col 'foo'`);
    test(`SELECT col "foo"`);
  });

  it("supports SELECT *", () => {
    test("SELECT *");
    test("SELECT *, foo, bar");
    test("SELECT foo, *, bar");
    test("SELECT /*c*/ *");
  });

  it("supports qualified SELECT tbl.*", () => {
    test("SELECT tbl.*");
    test("SELECT tbl1.*, tbl2.*");
    test("SELECT foo, tbl.*, bar");
    test("SELECT tbl /*c1*/./*c2*/ *");
  });

  describe("WITH", () => {
    it("parses basic syntax", () => {
      test("WITH child AS (SELECT * FROM person WHERE age < 15) SELECT child.name");
      test("WITH /*c1*/ child /*c2*/ AS /*c3*/ (/*c4*/ SELECT 1 /*c5*/) /*c6*/ SELECT child.name");
    });

    it("parses recursive syntax", () => {
      test("WITH RECURSIVE child AS (SELECT 1) SELECT child.name");
      test("WITH /*c1*/ RECURSIVE /*c2*/ child AS (SELECT 1) SELECT child.name");
    });

    it("parses column names list", () => {
      test("WITH child (age, name) AS (SELECT * FROM person WHERE age < 15) SELECT child.name");
      test(
        "WITH child /*c1*/ (/*c2*/ age /*c3*/, /*c4*/ name /*c5*/) /*c6*/ AS (SELECT 1) SELECT child.name"
      );
    });

    it("parses multiple cte-s", () => {
      test("WITH t1 AS (SELECT 1), t2 AS (SELECT 2) SELECT t1.name");
      test("WITH t1 AS (SELECT 1) /*c1*/, /*c2*/ t2 AS (SELECT 2) SELECT t1.name");
    });

    it("supports MATERIALIZED & NOT MATERIALIZED options", () => {
      test("WITH t1 AS MATERIALIZED (SELECT 1) SELECT t1.name");
      test("WITH t1 AS NOT MATERIALIZED (SELECT 1) SELECT t1.name");
      test("WITH t1 AS /*c1*/ NOT /*c2*/ MATERIALIZED /*c3*/ (SELECT 1) SELECT t1.name");
    });
  });

  describe("FROM", () => {
    it("parses basic syntax", () => {
      test("SELECT col FROM tbl");
      test("SELECT col from tbl");
      test("SELECT /*c1*/ col /*c2*/ FROM /*c3*/ tbl");
    });

    it("parses qualified table names", () => {
      test("SELECT col FROM db.tbl");
      test("SELECT col FROM db /*c1*/./*c2*/ tbl");
    });

    dialect(["mysql", "sqlite"], () => {
      it("parses backtick-quoted qualified table name", () => {
        test("SELECT col FROM `my db`.`my tbl`");
      });
    });

    dialect("sqlite", () => {
      it("parses double-quoted qualified table name", () => {
        test(`SELECT col FROM "my db"."my tbl"`);
      });
      it("parses bracket-quoted qualified table name", () => {
        test("SELECT col FROM [my db].[my tbl]");
      });
    });

    it("parses table alias", () => {
      test("SELECT t.col FROM my_db.my_long_table_name AS t");
      test("SELECT t.col FROM my_db.my_long_table_name t");
      test("SELECT t.col FROM db.tbl /*c1*/ AS /*c2*/ t");
    });

    it("parses table name in parenthesis", () => {
      test("SELECT col FROM (tbl)");
      test("SELECT t.col FROM (db.tbl) AS t");
      test("SELECT t.col FROM (db.tbl) t");
      test("SELECT t.col FROM (/*c1*/ db.tbl /*c2*/) /*c3*/ AS /*c4*/ t");
    });

    it("parses subselect in parenthesis", () => {
      test("SELECT t.col FROM (SELECT x FROM tbl) AS t");
      // TODO: support comment before closing paren ")"
      test("SELECT t.col FROM (/*c1*/ SELECT x FROM tbl) /*c3*/ AS /*c4*/ t");
    });

    it("parses comma-joins", () => {
      test("SELECT col FROM tbl1, tbl2, tbl3");
      test("SELECT col FROM tbl1 /*c1*/ , /*c2*/ tbl2");
    });

    it("parses plain JOIN", () => {
      test("SELECT c FROM t1 JOIN t2");
      test("SELECT c FROM t1 /*c1*/ JOIN /*c2*/ t2");
    });

    it("parses NATURAL JOIN", () => {
      test("SELECT c FROM t1 NATURAL JOIN t2");
      test("SELECT c FROM t1 /*c1*/ NATURAL /*c2*/ JOIN /*c3*/ t2");
    });

    it("parses LEFT [OUTER] JOIN", () => {
      test("SELECT c FROM t1 LEFT JOIN t2");
      test("SELECT c FROM t1 LEFT OUTER JOIN t2");
      test("SELECT c FROM t1 /*c1*/ LEFT /*c2*/ JOIN /*c3*/ t2");
      test("SELECT c FROM t1 /*c1*/ LEFT /*c2*/ OUTER /*c3*/ JOIN /*c4*/ t2");
    });

    it("parses NATURAL LEFT [OUTER] JOIN", () => {
      test("SELECT c FROM t1 NATURAL LEFT JOIN t2");
      test("SELECT c FROM t1 NATURAL LEFT OUTER JOIN t2");
      test("SELECT c FROM t1 /*c1*/ NATURAL /*c2*/ LEFT /*c3*/ JOIN /*c4*/ t2");
    });

    it("parses RIGHT [OUTER] JOIN", () => {
      test("SELECT c FROM t1 RIGHT JOIN t2");
      test("SELECT c FROM t1 RIGHT OUTER JOIN t2");
      test("SELECT c FROM t1 /*c1*/ RIGHT /*c2*/ JOIN /*c3*/ t2");
      test("SELECT c FROM t1 /*c1*/ RIGHT /*c2*/ OUTER /*c3*/ JOIN /*c4*/ t2");
    });

    it("parses NATURAL RIGHT [OUTER] JOIN", () => {
      test("SELECT c FROM t1 NATURAL RIGHT JOIN t2");
      test("SELECT c FROM t1 NATURAL RIGHT OUTER JOIN t2");
      test("SELECT c FROM t1 /*c1*/ NATURAL /*c2*/ RIGHT /*c3*/ JOIN /*c4*/ t2");
    });

    it("parses INNER JOIN", () => {
      test("SELECT c FROM t1 INNER JOIN t2");
      test("SELECT c FROM t1 /*c1*/ INNER /*c2*/ JOIN /*c3*/ t2");
    });

    it("parses NATURAL INNER JOIN", () => {
      test("SELECT c FROM t1 NATURAL INNER JOIN t2");
      test("SELECT c FROM t1 /*c1*/ NATURAL /*c2*/ INNER /*c3*/ JOIN /*c4*/ t2");
    });

    it("parses CROSS JOIN", () => {
      test("SELECT c FROM t1 CROSS JOIN t2");
      test("SELECT c FROM t1 /*c1*/ CROSS /*c2*/ JOIN /*c3*/ t2");
    });

    dialect("sqlite", () => {
      it("parses FULL [OUTER] JOIN", () => {
        test("SELECT c FROM t1 FULL JOIN t2");
        test("SELECT c FROM t1 FULL OUTER JOIN t2");
        test("SELECT c FROM t1 /*c1*/ FULL /*c2*/ JOIN /*c3*/ t2");
        test("SELECT c FROM t1 /*c1*/ FULL /*c2*/ OUTER /*c3*/ JOIN /*c4*/ t2");
      });

      it("parses NATURAL FULL [OUTER] JOIN", () => {
        test("SELECT c FROM t1 NATURAL FULL JOIN t2");
        test("SELECT c FROM t1 NATURAL FULL OUTER JOIN t2");
        test("SELECT c FROM t1 /*c1*/ NATURAL /*c2*/ FULL /*c3*/ JOIN /*c4*/ t2");
      });
    });

    it("parses join with USING specification", () => {
      test("SELECT c FROM t1 JOIN t2 USING (id)");
      test("SELECT c FROM t1 JOIN t2 USING (col1, col2)");
      test("SELECT c FROM t1 JOIN t2 using (ext_id)");
      test("SELECT c FROM t1 JOIN t2 /*c1*/ USING /*c2*/ (/*c3*/ col1 /*c4*/, /*c5*/ col2 /*c6*/)");
    });

    it("parses join with ON specification", () => {
      test("SELECT c FROM t1 JOIN t2 ON t1.id = t2.id");
      test("SELECT c FROM t1 JOIN t2 ON t1.id = t2.id AND t2.type = 5");
      test("SELECT c FROM t1 JOIN t2 ON (t1.id = t2.id)");
      test("SELECT c FROM t1 JOIN t2 on t1.id = t2.id");
      test("SELECT c FROM t1 JOIN t2 /*c1*/ ON /*c2*/ true");
    });
  });

  describe("WHERE", () => {
    it("parses where clause", () => {
      test("SELECT name FROM pupils WHERE age > 10");
      test("SELECT name FROM pupils where true");
      test("SELECT name FROM pupils /*c1*/ WHERE /*c2*/ name = 'Mary'");
    });
  });

  describe("GROUP BY", () => {
    it("parses group by with single expression", () => {
      test("SELECT c FROM t GROUP BY t.id");
      test("SELECT c FROM t /*c0*/ Group /*c1*/ By /*c2*/ t.id");
    });

    it("parses group by with multiple expressions", () => {
      test("SELECT id, name, age FROM t GROUP BY id, name, age");
      test("SELECT id, name FROM t GROUP BY /*c1*/ id /*c2*/, /*c3*/ name");
    });
  });

  describe("HAVING", () => {
    it("parses having clause", () => {
      test("SELECT c FROM t WHERE true GROUP BY col HAVING x > 3");
      test("SELECT c FROM t /*c1*/ Having /*c2*/ x = 81");
    });
  });

  describe("ORDER BY", () => {
    it("parses order by clause", () => {
      test("SELECT c FROM t ORDER BY name");
      test("SELECT c FROM t ORDER BY salary - tax");
      test("SELECT c FROM t ORDER BY name ASC");
      test("SELECT c FROM t ORDER BY age DESC");
      test("SELECT c FROM t ORDER BY name DESC, age ASC, salary");
      test("SELECT c FROM t /*c0*/ Order /*c1*/ By /*c2*/ age /*c3*/ ASC /*c4*/, /*c5*/ name");
    });
  });

  describe("syntax tree", () => {
    it("parses SELECT with multiple columns", () => {
      expect(parse("SELECT 1, 2, 3 FROM db.tbl")).toMatchInlineSnapshot(`
        [
          {
            "clauses": [
              {
                "columns": [
                  {
                    "text": "1",
                    "type": "number",
                  },
                  {
                    "text": "2",
                    "type": "number",
                  },
                  {
                    "text": "3",
                    "type": "number",
                  },
                ],
                "options": [],
                "selectKw": {
                  "text": "SELECT",
                  "type": "keyword",
                },
                "type": "select_clause",
              },
              {
                "fromKw": {
                  "text": "FROM",
                  "type": "keyword",
                },
                "tables": [
                  {
                    "db": {
                      "text": "db",
                      "type": "identifier",
                    },
                    "table": {
                      "text": "tbl",
                      "type": "identifier",
                    },
                    "type": "table_ref",
                  },
                ],
                "type": "from_clause",
              },
            ],
            "type": "select_statement",
          },
        ]
      `);
    });

    it("parses alias definition", () => {
      expect(parse("SELECT 1 AS foo")).toMatchInlineSnapshot(`
        [
          {
            "clauses": [
              {
                "columns": [
                  {
                    "alias": {
                      "text": "foo",
                      "type": "identifier",
                    },
                    "asKw": {
                      "text": "AS",
                      "type": "keyword",
                    },
                    "expr": {
                      "text": "1",
                      "type": "number",
                    },
                    "type": "alias",
                  },
                ],
                "options": [],
                "selectKw": {
                  "text": "SELECT",
                  "type": "keyword",
                },
                "type": "select_clause",
              },
            ],
            "type": "select_statement",
          },
        ]
      `);
    });

    it("parses string alias as identifier", () => {
      expect(parse(`SELECT col 'foo'`)).toMatchInlineSnapshot(`
        [
          {
            "clauses": [
              {
                "columns": [
                  {
                    "alias": {
                      "text": "'foo'",
                      "type": "identifier",
                    },
                    "expr": {
                      "column": {
                        "text": "col",
                        "type": "identifier",
                      },
                      "type": "column_ref",
                    },
                    "type": "alias",
                  },
                ],
                "options": [],
                "selectKw": {
                  "text": "SELECT",
                  "type": "keyword",
                },
                "type": "select_clause",
              },
            ],
            "type": "select_statement",
          },
        ]
      `);
    });
  });
});
