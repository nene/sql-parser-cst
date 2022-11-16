import { dialect, parseExpr, testExpr, test, parseFrom } from "./test_utils";

describe("identifier", () => {
  describe("identifier", () => {
    it("supports simple identifiers", () => {
      testExpr("foo");
      testExpr("foo123");
      testExpr("_96");
    });

    it("allows identifier name to start with number", () => {
      expect(parseExpr("18foo")).toMatchInlineSnapshot(`
        {
          "column": {
            "name": "18foo",
            "text": "18foo",
            "type": "identifier",
          },
          "type": "column_ref",
        }
      `);
    });

    dialect("sqlite", () => {
      it("supports double-quoted identifiers", () => {
        testExpr(`"some special name"`);
      });

      it("parses double-quoted identifier", () => {
        expect(parseExpr(`"some special name"`)).toMatchInlineSnapshot(`
          {
            "column": {
              "name": "some special name",
              "text": ""some special name"",
              "type": "identifier",
            },
            "type": "column_ref",
          }
        `);
      });

      it("supports repeated-quote escaping in double-quoted identifier", () => {
        testExpr(`"some "" name"`);
      });
    });

    dialect(["mysql", "sqlite"], () => {
      it("supports backtick-quoted identifiers", () => {
        testExpr("`some special name`");
      });

      it("parses backtick-quoted identifier", () => {
        expect(parseExpr("`some special name`")).toMatchInlineSnapshot(`
          {
            "column": {
              "name": "some special name",
              "text": "\`some special name\`",
              "type": "identifier",
            },
            "type": "column_ref",
          }
        `);
      });

      it("supports escaped quotes in identifiers", () => {
        testExpr("`some `` name`");
      });
    });

    dialect("sqlite", () => {
      it("supports bracket-quoted identifiers", () => {
        testExpr("[some special name]");
      });

      it("parses bracket-quoted identifier", () => {
        expect(parseExpr("[some special name]")).toMatchInlineSnapshot(`
          {
            "column": {
              "name": "some special name",
              "text": "[some special name]",
              "type": "identifier",
            },
            "type": "column_ref",
          }
        `);
      });

      it("supports ]] escaping in bracket-quoted identifier", () => {
        testExpr(`[some ]] name]`);
      });
    });
  });

  describe("column name", () => {
    it("supports simple column name", () => {
      testExpr("foo");
    });

    it("supports qualified column name", () => {
      testExpr("foo.bar");
      testExpr("foo /*c1*/./*c2*/ bar");
    });

    it("allows for keywords as qualified column names", () => {
      testExpr("foo.insert");
    });

    dialect("sqlite", () => {
      it("supports -uoted qualified column name", () => {
        testExpr(`"my tbl"."my col"`);
        testExpr("`my foo`.`my bar`");
        testExpr(`[my tbl].[my col]`);
      });
    });

    dialect("mysql", () => {
      it("supports quoted qualified column name", () => {
        testExpr("`my foo`.`my bar`");
      });
    });

    it("does not recognize single-quoted string as table name", () => {
      expect(() => parseExpr(`'foo'.bar`)).toThrowError("Expected");
    });
    it("does not recognize single-quoted string as column name", () => {
      expect(() => parseExpr(`foo.'bar'`)).toThrowError("Expected");
    });

    dialect("mysql", () => {
      it("does not recognize double-quoted string as table name", () => {
        expect(() => parseExpr(`"foo".bar`)).toThrowError("Expected");
      });
      it("does not recognize double-quoted string as column name", () => {
        expect(() => parseExpr(`foo."bar"`)).toThrowError("Expected");
      });
    });

    it("parses column name as ColumnRef node", () => {
      expect(parseExpr("foo")).toMatchInlineSnapshot(`
        {
          "column": {
            "name": "foo",
            "text": "foo",
            "type": "identifier",
          },
          "type": "column_ref",
        }
      `);
    });

    it("parses qualified column name as ColumnRef node", () => {
      expect(parseExpr("foo.bar")).toMatchInlineSnapshot(`
        {
          "column": {
            "name": "bar",
            "text": "bar",
            "type": "identifier",
          },
          "table": {
            "name": "foo",
            "text": "foo",
            "type": "identifier",
          },
          "type": "column_ref",
        }
      `);
    });
  });

  describe("table name", () => {
    it("supports simple table names", () => {
      test("SELECT col FROM my_tbl");
    });

    it("parses simple table name as TableRef", () => {
      expect(parseFrom(`my_table`)).toMatchInlineSnapshot(`
        {
          "table": {
            "name": "my_table",
            "text": "my_table",
            "type": "identifier",
          },
          "type": "table_ref",
        }
      `);
    });

    it("supports qualified table names", () => {
      test("SELECT col FROM schm.tbl");
      test("SELECT col FROM schm /*c1*/./*c2*/ tbl");
    });

    it("parses qualified table name as TableRef", () => {
      expect(parseFrom(`my_schema.my_table`)).toMatchInlineSnapshot(`
        {
          "schema": {
            "name": "my_schema",
            "text": "my_schema",
            "type": "identifier",
          },
          "table": {
            "name": "my_table",
            "text": "my_table",
            "type": "identifier",
          },
          "type": "table_ref",
        }
      `);
    });

    dialect("sqlite", () => {
      it("supports quoted qualified table name", () => {
        test(`SELECT col FROM "my db"."my tbl"`);
        test("SELECT col FROM `my db`.`my tbl`");
        test("SELECT col FROM [my db].[my tbl]");
      });
    });

    dialect("mysql", () => {
      it("supports quoted qualified table name", () => {
        test("SELECT col FROM `my db`.`my tbl`");
      });
    });
  });
});
