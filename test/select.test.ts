import { parse, show } from "../src/parser";

describe("select", () => {
  function test(sql: string) {
    expect(show(parse(sql))).toBe(sql);
  }

  it("parses simple SELECT", () => {
    test("SELECT 'hello'");
    test("SELECT 1, 2, 3");
    test("select 123");
    test("SELECT 1 /*c1*/, /*c2*/ 2");
  });

  it("parses column aliases", () => {
    test("SELECT 'hello' AS foo");
    test("SELECT 1 as bar, 2 baz");
    test("SELECT 1 /*c1*/ as /*c2*/ bar");
    test("SELECT 1 /*c*/ bar");
  });

  describe("FROM", () => {
    it("parses basic syntax", () => {
      test("SELECT col FROM tbl");
      test("SELECT col from tbl");
      test("SELECT col FROM /*com*/ tbl");
    });

    it("parses qualified table names", () => {
      test("SELECT col FROM db.tbl");
      test("SELECT col FROM `db`.`tbl`");
      test("SELECT col FROM db /*c1*/./*c2*/ tbl");
    });

    it("parses multiple comma-separated tables", () => {
      test("SELECT col FROM tbl1, tbl2, tbl3");
      test("SELECT col FROM tbl1/*c1*/ , /*c2*/ tbl2");
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

    it("parses joins", () => {
      test("SELECT c FROM t1 JOIN t2");
      test("SELECT c FROM t1 LEFT JOIN t2");
      test("SELECT c FROM t1 LEFT OUTER JOIN t2");
      test("SELECT c FROM t1 RIGHT JOIN t2");
      test("SELECT c FROM t1 RIGHT OUTER JOIN t2");
      test("SELECT c FROM t1 FULL JOIN t2");
      test("SELECT c FROM t1 FULL OUTER JOIN t2");
      test("SELECT c FROM t1 INNER JOIN t2");

      test("SELECT c FROM t1 /*c0*/ FULL /*c1*/ JOIN /*c2*/ t2");
      test("SELECT c FROM t1 /*c0*/ LEFT /*c1*/ OUTER /*c2*/ JOIN /*c3*/ t2");
    });

    it("parses join with USING specification", () => {
      test("SELECT c FROM t1 JOIN t2 USING (id)");
      test("SELECT c FROM t1 JOIN t2 USING (col1, col2)");
      test("SELECT c FROM t1 JOIN t2 using (ext_id)");
      test(
        "SELECT c FROM t1 JOIN t2 /*c1*/ USING /*c2*/ (/*c3*/ col1 /*c4*/, /*c5*/ col2 /*c6*/)"
      );
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
      test("SELECT name FROM pupils WHERE /*c*/ name = 'Mary'");
    });
  });

  describe("GROUP BY", () => {
    it("parses group by with single expression", () => {
      test("SELECT c FROM t GROUP BY t.id");
      test("SELECT c FROM t Group /*c1*/ By /*c2*/ t.id");
    });

    it("parses group by with multiple expressions", () => {
      test("SELECT id, name, age FROM t GROUP BY id, name, age");
      test("SELECT id, name FROM t GROUP BY /*c1*/ id /*c2*/, /*c3*/ name");
    });
  });

  describe("syntax tree", () => {
    it("parses SELECT with multiple columns", () => {
      expect(parse("SELECT 1, 2, 3 FROM db.tbl")).toMatchInlineSnapshot(`
        {
          "from": {
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
          "select": {
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
            "selectKw": {
              "text": "SELECT",
              "type": "keyword",
            },
            "type": "select_clause",
          },
          "type": "select_statement",
        }
      `);
    });

    it("parses alias definition", () => {
      expect(parse("SELECT 1 AS foo")).toMatchInlineSnapshot(`
        {
          "select": {
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
            "selectKw": {
              "text": "SELECT",
              "type": "keyword",
            },
            "type": "select_clause",
          },
          "type": "select_statement",
        }
      `);
    });
  });
});
