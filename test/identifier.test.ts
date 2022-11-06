import { dialect, parseExpr, parseStmt, testExpr, test, parseFrom } from "./test_utils";

describe("identifier", () => {
  describe("column name", () => {
    it("supports simple column name", () => {
      testExpr("foo");
      testExpr("foo123");
      testExpr("_96");
    });

    it("supports qualified column name", () => {
      testExpr("foo.bar");
      testExpr("foo /*c1*/./*c2*/ bar");
    });

    it("allows for keywords as qualified column names", () => {
      testExpr("foo.insert");
    });

    dialect(["mysql", "sqlite"], () => {
      it("supports backtick-quoted column name", () => {
        testExpr("`some special name`");
      });

      it("supports backtick-quoted table and column name", () => {
        testExpr("`my foo`.`my bar`");
      });

      it("supports escaped quotes in column name", () => {
        testExpr("`some `` name`");
      });
    });

    dialect("sqlite", () => {
      it("parses double-quoted column name", () => {
        expect(parseExpr(`"some special name"`)).toMatchInlineSnapshot(`
          {
            "column": {
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

      it("parses bracket-quoted column name", () => {
        expect(parseExpr("[some special name]")).toMatchInlineSnapshot(`
          {
            "column": {
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
            "text": "bar",
            "type": "identifier",
          },
          "table": {
            "text": "foo",
            "type": "identifier",
          },
          "type": "column_ref",
        }
      `);
    });

    it("allows column name to start with number", () => {
      expect(parseExpr("18foo")).toMatchInlineSnapshot(`
        {
          "column": {
            "text": "18foo",
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
            "text": "my_schema",
            "type": "identifier",
          },
          "table": {
            "text": "my_table",
            "type": "identifier",
          },
          "type": "table_ref",
        }
      `);
    });

    dialect("sqlite", () => {
      it("supports double-quoted table name", () => {
        test(`SELECT col FROM "my tbl"`);
      });
      it("supports double-quoted qualified table name", () => {
        test(`SELECT col FROM "my db"."my tbl"`);
      });
    });

    dialect(["mysql", "sqlite"], () => {
      it("supports backtick-quoted table name", () => {
        test("SELECT col FROM `my tbl`");
      });
      it("supports backtick-quoted qualified table name", () => {
        test("SELECT col FROM `my db`.`my tbl`");
      });
    });

    dialect("sqlite", () => {
      it("supports bracket-quoted table name", () => {
        test("SELECT col FROM [my tbl]");
      });
      it("supports bracket-quoted qualified table name", () => {
        test("SELECT col FROM [my db].[my tbl]");
      });
    });
  });
});
