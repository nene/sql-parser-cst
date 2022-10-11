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
        testExpr(`6 /* com1 */ ${op} /* com2 */ 7`);
      });
    });

    it("parses chain of operators", () => {
      testExpr(`5 + 6 - 8`);
      testExpr(`2 * 7 / 3`);
      testExpr(`6 + 7 * 3 - 16 / 2`);
    });

    it("parses DIV operator", () => {
      testExpr(`8 DIV 4`);
      testExpr(`8 div 4`);
      testExpr(`8 /* com1 */ DIV /* com2 */ 2`);
    });

    it("parses IS operator", () => {
      testExpr(`7 IS 5`);
      testExpr(`7 /*c1*/ IS /*c2*/ 5`);
    });

    it("parses IS NOT operator", () => {
      testExpr(`7 IS NOT 5`);
      testExpr(`7 /*c1*/ IS /*c2*/ NOT /*c3*/ 5`);
    });

    it("parses LIKE operator", () => {
      testExpr(`'foobar' LIKE 'foo%'`);
      testExpr(`'foobar' /*c1*/ LIKE /*c2*/ 'foo%'`);
    });

    it("parses NOT LIKE operator", () => {
      testExpr(`'foobar' NOT LIKE 'foo%'`);
      testExpr(`'foobar' /*c1*/ NOT /*c2*/ LIKE /*c3*/ 'foo%'`);
    });
  });
});
