import { dialect, parseStmt, test } from "../test_utils";

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

  describe("syntax tree", () => {
    it("parses SELECT with multiple columns", () => {
      expect(parseStmt("SELECT 1, 2, 3 FROM db.tbl")).toMatchInlineSnapshot(`
        {
          "clauses": [
            {
              "columns": {
                "items": [
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
                "type": "list_expr",
              },
              "options": [],
              "selectKw": {
                "name": "SELECT",
                "text": "SELECT",
                "type": "keyword",
              },
              "type": "select_clause",
            },
            {
              "expr": {
                "schema": {
                  "text": "db",
                  "type": "identifier",
                },
                "table": {
                  "text": "tbl",
                  "type": "identifier",
                },
                "type": "table_ref",
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
              "columns": {
                "items": [
                  {
                    "alias": {
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
                      "type": "number",
                    },
                    "type": "alias",
                  },
                ],
                "type": "list_expr",
              },
              "options": [],
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
              "columns": {
                "items": [
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
                "type": "list_expr",
              },
              "options": [],
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
