import { dialect, parseExpr, testExpr, testExprWc } from "../test_utils";

describe("member_expr", () => {
  it("supports simple member_expr (e.g. qualified column name)", () => {
    testExpr("foo.bar");
    testExprWc("foo . bar");
  });

  it("supports nested member_expr (e.g. traversing JSON object)", () => {
    testExpr("foo.bar.baz");
  });

  it("supports member_expr on function call", () => {
    testExpr("foo().baz");
  });

  it("allows member_expr on a string", () => {
    testExpr(`'foo'.bar`);
  });

  it("allows for keywords as field/column names", () => {
    testExpr("foo.insert");
  });

  dialect("sqlite", () => {
    it("supports quoted field name", () => {
      testExpr(`"my tbl"."my col"`);
      testExpr("`my foo`.`my bar`");
      testExpr(`[my tbl].[my col]`);
    });
  });

  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("supports quoted field name", () => {
      testExpr("`my foo`.`my bar`");
    });
  });

  it("does not allow string as field name", () => {
    expect(() => parseExpr(`foo.'bar'`)).toThrowError();
  });

  it("parses nested member expression", () => {
    expect(parseExpr(`foo.bar.baz`)).toMatchInlineSnapshot(`
      {
        "object": {
          "object": {
            "name": "foo",
            "text": "foo",
            "type": "identifier",
          },
          "property": {
            "name": "bar",
            "text": "bar",
            "type": "identifier",
          },
          "type": "member_expr",
        },
        "property": {
          "name": "baz",
          "text": "baz",
          "type": "identifier",
        },
        "type": "member_expr",
      }
    `);
  });
});
