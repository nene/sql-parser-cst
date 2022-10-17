import { dialect, parse, parseExpr, testExpr } from "./test_utils";

describe("column", () => {
  it("parses simple column name", () => {
    testExpr("foo");
    testExpr("foo123");
    testExpr("_96");
  });

  it("parses qualified column name", () => {
    testExpr("foo.bar");
    testExpr("foo /*c1*/./*c2*/ bar");
  });

  it("allows for keywords as qualified column names", () => {
    testExpr("foo.insert");
  });

  dialect(["mysql", "sqlite"], () => {
    it("parses backtick-quoted column name", () => {
      testExpr("`some special name`");
    });

    it("parses backtick-quoted table and column name", () => {
      testExpr("`my foo`.`my bar`");
    });

    it("parses escaped quotes in column name", () => {
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
