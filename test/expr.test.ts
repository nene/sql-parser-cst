import { parse, show } from "../src/parser";

describe("expr", () => {
  function testExpr(expr: string) {
    expect(show(parse(`SELECT ${expr}`))).toBe(`SELECT ${expr}`);
  }

  describe("operators", () => {
    // punctuation-based operators
    [
      "+",
      "-",
      "~",
      "*",
      "/",
      "%",
      "&",
      ">>",
      "<<",
      "^",
      "|",
      "~",
      ">=",
      ">",
      "<=",
      "<>",
      "<",
      "=",
      "!=",
    ].forEach((op) => {
      it(`parses ${op} operator`, () => {
        testExpr(`5 ${op} 7`);
      });
    });

    it("parses chain of addition and subtraction", () => {
      testExpr(`5 + 6 - 8`);
    });

    it("parses chain of multiplication and division", () => {
      testExpr(`2 * 7 / 3`);
    });

    it("treats multiplication with higher precedence than addition", () => {
      testExpr(`6 + 7 * 3`);
    });

    it("parses DIV operator", () => {
      testExpr(`8 DIV 4`);
    });

    it("recognizes lowercase DIV operator", () => {
      testExpr(`8 div 4`);
    });

    it("parses addition with comments", () => {
      testExpr(`6 /* com1 */ + /* com2 */ 7`);
    });

    it("parses multiplication with comments", () => {
      testExpr(`6 /* com1 */ * /* com2 */ 7`);
    });

    it("parses comparison with comments", () => {
      testExpr(`6 /* com1 */ < /* com2 */ 7`);
    });

    it("parses IS operator", () => {
      testExpr(`7 IS 5`);
    });
    it("parses IS operator with comments", () => {
      testExpr(`7 /*c1*/ IS /*c2*/ 5`);
    });

    it("parses IS NOT operator", () => {
      testExpr(`7 IS NOT 5`);
    });
    it("parses IS NOT operator with comments", () => {
      testExpr(`7 /*c1*/ IS /*c2*/ NOT /*c3*/ 5`);
    });

    it("parses LIKE & NOT LIKE operators", () => {
      testExpr(`'foobar' LIKE 'foo%'`);
      testExpr(`'foobar' NOT LIKE 'foo%'`);
    });
    it("parses LIKE & NOT LIKE operators with comments", () => {
      testExpr(`'foobar' /*c1*/ LIKE /*c2*/ 'foo%'`);
      testExpr(`'foobar' /*c1*/ NOT /*c2*/ LIKE /*c3*/ 'foo%'`);
    });
  });
});
