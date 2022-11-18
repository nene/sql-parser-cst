import { dialect, parseExpr, testExpr, test, parseFrom } from "./test_utils";

describe("identifier", () => {
  describe("identifier", () => {
    function parseIdent(str: string) {
      const expr = parseExpr(str);
      if (expr.type !== "column_ref") {
        throw new Error(`Expected type:column_ref, instead got type:${expr.type}`);
      }
      const col = expr.column;
      if (col.type !== "identifier") {
        throw new Error(
          `Expected type:identifier inside ColumnRef.column, instead got type:${col.type}`
        );
      }
      return col;
    }

    it("supports simple identifiers", () => {
      testExpr("foo");
      testExpr("foo123");
      testExpr("_96");
    });

    dialect(["mysql", "sqlite"], () => {
      it("allows identifier name to start with number", () => {
        expect(parseIdent("18foo")).toMatchInlineSnapshot(`
          {
            "name": "18foo",
            "text": "18foo",
            "type": "identifier",
          }
        `);
      });
    });

    dialect("bigquery", () => {
      it("supports dash-separated identifier names", () => {
        expect(parseIdent("foo-bar-baz")).toMatchInlineSnapshot(`
          {
            "name": "foo-bar-baz",
            "text": "foo-bar-baz",
            "type": "identifier",
          }
        `);
      });

      it("supports numbers in dash-separated identifier names", () => {
        expect(parseIdent("foo2-18-20")).toMatchInlineSnapshot(`
          {
            "name": "foo2-18-20",
            "text": "foo2-18-20",
            "type": "identifier",
          }
        `);
      });

      it("does not allow repeated--dash inside identifier", () => {
        // the --bar part is treated as a comment
        expect(parseIdent("foo--bar")).toMatchInlineSnapshot(`
          {
            "name": "foo",
            "text": "foo",
            "type": "identifier",
          }
        `);
      });

      it("does not allow number as first part of identifier", () => {
        expect(parseExpr("10-foo").type).toBe("binary_expr");
      });
    });

    dialect("sqlite", () => {
      it("supports double-quoted identifiers", () => {
        testExpr(`"some special name"`);
      });

      it("parses double-quoted identifier", () => {
        expect(parseIdent(`"some special name"`)).toMatchInlineSnapshot(`
          {
            "name": "some special name",
            "text": ""some special name"",
            "type": "identifier",
          }
        `);
      });

      it("supports repeated-quote escaping in double-quoted identifier", () => {
        testExpr(`"some "" name"`);
      });

      it("parses escaped double-quote as single quote", () => {
        expect(parseIdent(`"some "" name"`)).toMatchInlineSnapshot(`
          {
            "name": "some " name",
            "text": ""some "" name"",
            "type": "identifier",
          }
        `);
      });
    });

    dialect(["mysql", "sqlite", "bigquery"], () => {
      it("supports backtick-quoted identifiers", () => {
        testExpr("`some special name`");
      });

      it("parses backtick-quoted identifier", () => {
        expect(parseIdent("`some special name`")).toMatchInlineSnapshot(`
          {
            "name": "some special name",
            "text": "\`some special name\`",
            "type": "identifier",
          }
        `);
      });

      dialect(["mysql", "sqlite"], () => {
        it("supports repeated-quote-escaped quotes in identifiers", () => {
          testExpr("`some `` name`");
        });

        it("parses repeated-quote-escaped backtick-quote as single backtick", () => {
          expect(parseIdent("`some `` name`")).toMatchInlineSnapshot(`
            {
              "name": "some \` name",
              "text": "\`some \`\` name\`",
              "type": "identifier",
            }
          `);
        });
      });

      dialect("bigquery", () => {
        it("supports backslash-escaped quotes in identifiers", () => {
          testExpr("`some \\` name`");
        });

        it("parses backslash-escaped backtick-quote as single backtick", () => {
          expect(parseIdent("`some \\` name`")).toMatchInlineSnapshot(`
            {
              "name": "some \` name",
              "text": "\`some \\\` name\`",
              "type": "identifier",
            }
          `);
        });

        function parseIdentName(str: string) {
          return parseIdent("`" + str + "`").name;
        }

        it("supports the same escapes as strings", () => {
          expect(parseIdentName(String.raw`\\`)).toBe("\\");
          expect(parseIdentName(String.raw`\n`)).toBe("\n");
          expect(parseIdentName(String.raw`\r`)).toBe("\r");
          expect(parseIdentName(String.raw`\t`)).toBe("\t");
        });
      });
    });

    dialect("sqlite", () => {
      it("supports bracket-quoted identifiers", () => {
        testExpr("[some special name]");
      });

      it("parses bracket-quoted identifier", () => {
        expect(parseIdent("[some special name]")).toMatchInlineSnapshot(`
          {
            "name": "some special name",
            "text": "[some special name]",
            "type": "identifier",
          }
        `);
      });

      it("supports ]] escaping in bracket-quoted identifier", () => {
        testExpr(`[some ]] name]`);
      });

      it("parses escaped bracket as single bracket", () => {
        expect(parseIdent("[some ]] name]")).toMatchInlineSnapshot(`
          {
            "name": "some ] name",
            "text": "[some ]] name]",
            "type": "identifier",
          }
        `);
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

    dialect(["mysql", "bigquery"], () => {
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

    dialect(["mysql", "bigquery"], () => {
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

    dialect("bigquery", () => {
      it("supports three-part table name: project.dataset.table", () => {
        test("SELECT col FROM my-project.my-dataset.my-table");
      });

      it("parses three-part table name as TableRef", () => {
        expect(parseFrom(`my-project.my-dataset.my-table`)).toMatchInlineSnapshot(`
          {
            "catalog": {
              "name": "my-project",
              "text": "my-project",
              "type": "identifier",
            },
            "schema": {
              "name": "my-dataset",
              "text": "my-dataset",
              "type": "identifier",
            },
            "table": {
              "name": "my-table",
              "text": "my-table",
              "type": "identifier",
            },
            "type": "table_ref",
          }
        `);
      });
    });

    dialect("sqlite", () => {
      it("supports quoted qualified table name", () => {
        test(`SELECT col FROM "my db"."my tbl"`);
        test("SELECT col FROM `my db`.`my tbl`");
        test("SELECT col FROM [my db].[my tbl]");
      });
    });

    dialect(["mysql", "bigquery"], () => {
      it("supports quoted qualified table name", () => {
        test("SELECT col FROM `my db`.`my tbl`");
      });
    });
  });
});
