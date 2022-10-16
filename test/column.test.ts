import { parseExpr, testExpr } from "./test_utils";

describe("column", () => {
  it("parses simple column name", () => {
    testExpr("foo");
    testExpr("foo123");
    testExpr("_96");
  });

  it("parses quoted column name", () => {
    testExpr("`some special name`");
  });

  it("parses escaped quotes in column name", () => {
    testExpr("`some `` name`");
  });

  it("parses qualified column name", () => {
    testExpr("foo.bar");
    testExpr("`foo`.`bar`");
    testExpr("foo /*c1*/./*c2*/ bar");
  });

  it("does not recognize string as table name", () => {
    expect(() => parseExpr(`'foo'.bar`)).toThrowError("Expected");
    expect(() => parseExpr(`"foo".bar`)).toThrowError("Expected");
  });

  it("does not recognize string as column name", () => {
    expect(() => parseExpr(`foo.'bar'`)).toThrowError("Expected");
    expect(() => parseExpr(`foo."bar"`)).toThrowError("Expected");
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
});
