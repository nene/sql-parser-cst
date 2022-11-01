import { dialect, testExpr } from "../test_utils";

describe("string operators", () => {
  it("supports [NOT] LIKE operator", () => {
    testExpr(`'foobar' LIKE 'foo%'`);
    testExpr(`'foobar' /*c1*/ LIKE /*c2*/ 'foo%'`);
    testExpr(`'foobar' /*c1*/ NOT /*c2*/ LIKE /*c3*/ 'foo%'`);
  });

  it("supports LIKE with ESCAPE", () => {
    testExpr(`'foobar' LIKE 'percentage |%' ESCAPE '|'`);
    testExpr(`'foobar' NOT LIKE 'foo^_bar' ESCAPE '^'`);
    testExpr(`'foobar' LIKE 'foo' /*c1*/ ESCAPE /*c2*/ '|'`);
  });

  it("supports [NOT] REGEXP operator", () => {
    testExpr(`'foooo' REGEXP 'fo*'`);
    testExpr(`'foooo' /*c0*/ NOT /*c1*/ REGEXP /*c2*/ 'fo*'`);
  });

  dialect("sqlite", () => {
    it("supports [NOT] GLOB operator", () => {
      testExpr(`col GLOB 'fo*'`);
      testExpr(`col /*c0*/ NOT /*c1*/ GLOB /*c2*/ 'fo*'`);
    });
    it("supports [NOT] MATCH operator", () => {
      testExpr(`col MATCH 'fo*'`);
      testExpr(`col /*c0*/ NOT /*c1*/ MATCH /*c2*/ 'fo*'`);
    });
  });

  dialect("mysql", () => {
    it("supports [NOT] RLIKE operator", () => {
      testExpr(`'foooo' RLIKE 'fo*'`);
      testExpr(`'foooo' /*c0*/ NOT /*c1*/ RLIKE /*c2*/ 'fo*'`);
    });
  });

  dialect("sqlite", () => {
    it("treats || as concatenation operator", () => {
      testExpr(`'hello' || ' ' || 'world'`);
      testExpr(`str1 /*c1*/ || /*c2*/ str2`);
    });
  });

  dialect(["sqlite", "mysql"], () => {
    it("supports JSON operators", () => {
      testExpr(`col->'items[0].id'`);
      testExpr(`x /*c1*/ -> /*c2*/ 'op'`);

      testExpr(`col->>'items[0].id'`);
      testExpr(`x /*c1*/ ->> /*c2*/ 'op'`);
    });

    it("supports chain of JSON operators", () => {
      testExpr(`col->'items'->'[0]'->'id'`);
    });
  });
});
