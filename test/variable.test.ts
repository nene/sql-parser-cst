import { dialect, parseExpr, testExpr } from "./test_utils";

describe("variable", () => {
  dialect("bigquery", () => {
    it("supports BigQuery @@system_variables", () => {
      testExpr("@@error");
      testExpr("@@error.message");
      testExpr("@@script.bytes_billed");
    });

    it("parses @@system_variable into type:variable", () => {
      expect(parseExpr("@@error.message")).toMatchInlineSnapshot(`
        {
          "object": {
            "name": "error",
            "text": "@@error",
            "type": "variable",
          },
          "property": {
            "name": "message",
            "text": "message",
            "type": "identifier",
          },
          "type": "member_expr",
        }
      `);
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports @variables", () => {
      testExpr("@foo");
    });

    it("supports quoted @variables", () => {
      testExpr("@`foo`");
      testExpr(`@'foo'`);
      testExpr(`@"foo"`);
    });

    it("supports repeated-quote escapes inside variable names", () => {
      testExpr("@`fo``o`");
      testExpr(`@'fo''o'`);
      testExpr(`@"fo""o"`);
    });

    it("supports backslash escapes inside variable names", () => {
      testExpr(String.raw`@'fo\'o'`);
      testExpr(String.raw`@"fo\"o"`);
    });

    it("parses @var as variable", () => {
      expect(parseExpr("@var")).toMatchInlineSnapshot(`
        {
          "name": "var",
          "text": "@var",
          "type": "variable",
        }
      `);
    });

    it("parses backtick-quoted variable", () => {
      expect(parseExpr("@`var`")).toMatchInlineSnapshot(`
        {
          "name": "var",
          "text": "@\`var\`",
          "type": "variable",
        }
      `);
    });

    it("parses single-quoted variable", () => {
      expect(parseExpr("@'foo'")).toMatchInlineSnapshot(`
        {
          "name": "foo",
          "text": "@'foo'",
          "type": "variable",
        }
      `);
    });

    it("parses double-quoted variable", () => {
      expect(parseExpr('@"foo"')).toMatchInlineSnapshot(`
        {
          "name": "foo",
          "text": "@"foo"",
          "type": "variable",
        }
      `);
    });
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("does not support @@variables", () => {
      expect(() => parseExpr("@@my_var")).toThrowError();
    });
  });

  dialect("postgresql", () => {
    it.skip("TODO:postgres", () => {
      expect(true).toBe(true);
    });
  });
});
