import { parse, show } from "../src/parser";

describe("column", () => {
  function parseExpr(expr: string) {
    return parse(`SELECT ${expr}`)[0].select.columns[0];
  }

  function testExpr(expr: string) {
    expect(show(parse(`SELECT ${expr}`))).toBe(`SELECT ${expr}`);
  }

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
    testExpr("foo.'bar'");
    testExpr("`foo`.'bar'");
    testExpr('foo."bar"');
    testExpr('`foo`."bar"');
    testExpr("foo /*c1*/./*c2*/ bar");
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
