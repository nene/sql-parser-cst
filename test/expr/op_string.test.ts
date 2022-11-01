import { dialect, testExpr } from "../test_utils";

describe("string operators", () => {
  it("parses LIKE operator", () => {
    testExpr(`'foobar' LIKE 'foo%'`);
    testExpr(`'foobar' /*c1*/ LIKE /*c2*/ 'foo%'`);
  });

  it("parses NOT LIKE operator", () => {
    testExpr(`'foobar' NOT LIKE 'foo%'`);
    testExpr(`'foobar' /*c1*/ NOT /*c2*/ LIKE /*c3*/ 'foo%'`);
  });

  it("parses REGEXP/RLIKE operator", () => {
    testExpr(`'foooo' REGEXP 'fo*'`);
    testExpr(`'foooo' RLIKE 'fo*'`);
    testExpr(`'foooo' /*c1*/ RLIKE /*c2*/ 'fo*'`);
  });

  it("parses NOT REGEXP/RLIKE operator", () => {
    testExpr(`'foooo' NOT REGEXP 'fo*'`);
    testExpr(`'foooo' NOT RLIKE 'fo*'`);
    testExpr(`'foooo' /*c1*/ NOT /*c2*/ RLIKE /*c3*/ 'fo*'`);
  });

  dialect("sqlite", () => {
    it("parses || as concatenation operator", () => {
      testExpr(`'hello' || ' ' || 'world'`);
      testExpr(`str1 /*c1*/ || /*c2*/ str2`);
    });
  });
});
