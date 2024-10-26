import { dialect, parseExpr, test, testExpr } from "./test_utils";

describe("identifier", () => {
  function parseIdent(str: string) {
    const expr = parseExpr(str);
    if (expr.type !== "identifier") {
      throw new Error(`Expected type:identifier, instead got type:${expr.type}`);
    }
    return expr;
  }

  it("supports simple identifiers", () => {
    testExpr("foo");
    testExpr("foo123");
    testExpr("_96");
  });

  // For SQLite see: #45
  dialect(["postgresql", "mysql", "mariadb", "sqlite"], () => {
    it("supports unicode letters in identifiers", () => {
      testExpr("õllevägilane");
    });
  });

  dialect(["postgresql", "mysql", "mariadb"], () => {
    it("supports $-character in identifiers", () => {
      testExpr("foo$bar");
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports $-character at the start of an identifier", () => {
      testExpr("$foo");
    });
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
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

  dialect(["sqlite", "postgresql"], () => {
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

  dialect(["mysql", "mariadb", "sqlite", "bigquery"], () => {
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

    dialect(["mysql", "mariadb", "sqlite"], () => {
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

    // Issue #80
    it("supports KEY as identifier", () => {
      test(`SELECT key FROM key;`);
    });
  });

  dialect("postgresql", () => {
    it("parses unicode identifier", () => {
      expect(parseExpr(`U&"d\\0061t\\+000061"`)).toMatchInlineSnapshot(`
        {
          "name": "d\\0061t\\+000061",
          "text": "U&"d\\0061t\\+000061"",
          "type": "identifier",
        }
      `);
    });

    it(`supports ""-escaping in unicode identifer`, () => {
      testExpr(`U&"my "" why"`);
    });

    it("supports custom unicode escape character on unicode identifier", () => {
      expect(parseExpr(`U&"!0441!043B!043E!043D" UESCAPE '!'`)).toMatchInlineSnapshot(`
        {
          "left": {
            "name": "!0441!043B!043E!043D",
            "text": "U&"!0441!043B!043E!043D"",
            "type": "identifier",
          },
          "operator": {
            "name": "UESCAPE",
            "text": "UESCAPE",
            "type": "keyword",
          },
          "right": {
            "text": "'!'",
            "type": "string_literal",
            "value": "!",
          },
          "type": "binary_expr",
        }
      `);
    });
  });
});
