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
  });

  describe("syntax tree", () => {
    it("parses SELECT with multiple columns", () => {
      expect(parse("SELECT 1, 2, 3 FROM db.tbl")).toMatchInlineSnapshot(`
        {
          "from": {
            "kwFrom": {
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
                "expr": {
                  "text": "1",
                  "type": "number",
                },
                "kwAs": {
                  "text": "AS",
                  "type": "keyword",
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
