import { dialect, parseStmt, test, testWc } from "../test_utils";

describe("select", () => {
  it("parses simple SELECT", () => {
    test("SELECT 'hello'");
    test("SELECT 1, 2, 3");
    test("select 123");
    testWc("SELECT 1 , 2");
  });

  it("parses SELECT with set quantifier", () => {
    test("SELECT ALL foo");
    test("SELECT DISTINCT foo");
  });

  dialect(["mysql", "mariadb"], () => {
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

  dialect("mariadb", () => {
    it("parses SELECT with MariaDB-specific options", () => {
      test("SELECT SQL_CACHE foo AS x");
    });
  });

  dialect("mysql", () => {
    it("does not support MariaDB-specific SQL_CACHE option", () => {
      expect(() => test("SELECT SQL_CACHE foo AS x")).toThrowError();
    });
  });

  it("parses column aliases", () => {
    testWc("SELECT 'hello' AS foo");
    testWc("SELECT 1 as bar, 2 baz");
  });

  it("supports string as column alias", () => {
    test(`SELECT col AS 'foo'`);
    test(`SELECT col AS "foo"`);
    test(`SELECT col 'foo'`);
    test(`SELECT col "foo"`);
  });

  it("supports SELECT *", () => {
    testWc("SELECT *");
    testWc("SELECT *, foo, bar");
    testWc("SELECT foo, *, bar");
  });

  it("supports qualified SELECT tbl.*", () => {
    testWc("SELECT tbl.*");
    testWc("SELECT tbl1.*, tbl2.*");
    testWc("SELECT foo, tbl.*, bar");
  });

  it("supports parenthesized sub-select between WITH and ORDER BY", () => {
    test(`
      WITH
        tbl AS (SELECT 1 AS col)
      (SELECT * FROM tbl)
      ORDER BY col
      LIMIT 1
    `);

    test(`(SELECT * FROM tbl) LIMIT 1`);
  });

  dialect("bigquery", () => {
    it("supports trailing commas in SELECT clause", () => {
      testWc("SELECT foo, bar, FROM tbl");
    });

    it("supports SELECT AS STRUCT", () => {
      testWc("SELECT AS STRUCT 1 a, 2 b");
    });

    it("supports SELECT AS VALUE", () => {
      testWc("SELECT AS VALUE STRUCT(1 AS a, 2 AS b)");
    });

    it("supports SELECT {ALL | DISTINCT} AS {STRUCT | VALUE}", () => {
      test("SELECT ALL AS STRUCT 1 a, 2 b");
      test("SELECT DISTINCT AS VALUE STRUCT(1 AS a, 2 AS b)");
    });

    describe("EXCEPT()", () => {
      it("supports SELECT * EXCEPT()", () => {
        testWc("SELECT * EXCEPT ( col1, col2 )");
      });

      it("supports SELECT tbl.* EXCEPT()", () => {
        test("SELECT tbl.* EXCEPT (col1, col2)");
      });

      it("supports SELECT tbl.* EXCEPT() with multiple tables", () => {
        test("SELECT tbl1.* EXCEPT (col1), tbl2.* EXCEPT (col2)");
      });
    });

    describe("REPLACE()", () => {
      it("supports SELECT * REPLACE()", () => {
        testWc("SELECT * REPLACE ( 'hello' AS col1, 10+5 col2 )");
      });

      it("supports SELECT tbl.* REPLACE()", () => {
        test("SELECT tbl.* REPLACE (15 AS col1)");
      });

      it("supports SELECT tbl.* REPLACE() with multiple tables", () => {
        test("SELECT tbl1.* REPLACE (8 AS col1), tbl2.* REPLACE (7 AS col2)");
      });
    });
  });

  describe("syntax tree", () => {
    it("parses SELECT with multiple columns", () => {
      expect(parseStmt("SELECT 1, 2, 3 FROM db.tbl")).toMatchInlineSnapshot(`
        {
          "clauses": [
            {
              "asStructOrValueKw": undefined,
              "columns": {
                "items": [
                  {
                    "text": "1",
                    "type": "number_literal",
                    "value": 1,
                  },
                  {
                    "text": "2",
                    "type": "number_literal",
                    "value": 2,
                  },
                  {
                    "text": "3",
                    "type": "number_literal",
                    "value": 3,
                  },
                ],
                "type": "list_expr",
              },
              "distinctKw": undefined,
              "hints": [],
              "selectKw": {
                "name": "SELECT",
                "text": "SELECT",
                "type": "keyword",
              },
              "type": "select_clause",
            },
            {
              "expr": {
                "object": {
                  "name": "db",
                  "text": "db",
                  "type": "identifier",
                },
                "property": {
                  "name": "tbl",
                  "text": "tbl",
                  "type": "identifier",
                },
                "type": "member_expr",
              },
              "fromKw": {
                "name": "FROM",
                "text": "FROM",
                "type": "keyword",
              },
              "type": "from_clause",
            },
          ],
          "type": "select_stmt",
        }
      `);
    });

    it("parses alias definition", () => {
      expect(parseStmt("SELECT 1 AS foo")).toMatchInlineSnapshot(`
        {
          "clauses": [
            {
              "asStructOrValueKw": undefined,
              "columns": {
                "items": [
                  {
                    "alias": {
                      "name": "foo",
                      "text": "foo",
                      "type": "identifier",
                    },
                    "asKw": {
                      "name": "AS",
                      "text": "AS",
                      "type": "keyword",
                    },
                    "expr": {
                      "text": "1",
                      "type": "number_literal",
                      "value": 1,
                    },
                    "type": "alias",
                  },
                ],
                "type": "list_expr",
              },
              "distinctKw": undefined,
              "hints": [],
              "selectKw": {
                "name": "SELECT",
                "text": "SELECT",
                "type": "keyword",
              },
              "type": "select_clause",
            },
          ],
          "type": "select_stmt",
        }
      `);
    });

    it("parses string alias as identifier", () => {
      expect(parseStmt(`SELECT col 'foo'`)).toMatchInlineSnapshot(`
        {
          "clauses": [
            {
              "asStructOrValueKw": undefined,
              "columns": {
                "items": [
                  {
                    "alias": {
                      "name": "foo",
                      "text": "'foo'",
                      "type": "identifier",
                    },
                    "expr": {
                      "name": "col",
                      "text": "col",
                      "type": "identifier",
                    },
                    "type": "alias",
                  },
                ],
                "type": "list_expr",
              },
              "distinctKw": undefined,
              "hints": [],
              "selectKw": {
                "name": "SELECT",
                "text": "SELECT",
                "type": "keyword",
              },
              "type": "select_clause",
            },
          ],
          "type": "select_stmt",
        }
      `);
    });
  });
});
