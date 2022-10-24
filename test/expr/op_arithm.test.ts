import { showPrecedence, testExpr } from "../test_utils";

describe("arithmetic operators", () => {
  ["+", "-", "*", "/", "%"].forEach((op) => {
    it(`parses ${op} operator`, () => {
      testExpr(`5 ${op} 7`);
      testExpr(`6 /* com1 */ ${op} /* com2 */ 7`);
    });
  });

  it("multiplication has higher precedence than addition", () => {
    expect(showPrecedence(`5 + 2 * 3`)).toBe(`(5 + (2 * 3))`);
  });

  it("addition has higher precedence than comparison", () => {
    expect(showPrecedence(`5 + 2 > 3 + 1`)).toBe(`((5 + 2) > (3 + 1))`);
  });

  it("parses DIV operator", () => {
    testExpr(`8 DIV 4`);
    testExpr(`8 div 4`);
    testExpr(`8 /* com1 */ DIV /* com2 */ 2`);
  });

  it("parses MOD operator", () => {
    testExpr(`8 MOD 4`);
    testExpr(`8 mod 4`);
    testExpr(`8 /* com1 */ MOD /* com2 */ 2`);
  });

  it("parses unary negation operator", () => {
    testExpr(`x + -y`);
  });
});
