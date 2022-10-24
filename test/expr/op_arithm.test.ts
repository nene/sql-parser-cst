import { testExpr } from "../test_utils";

describe("arithmetic operators", () => {
  ["+", "-", "*", "/", "%"].forEach((op) => {
    it(`parses ${op} operator`, () => {
      testExpr(`5 ${op} 7`);
      testExpr(`6 /* com1 */ ${op} /* com2 */ 7`);
    });
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
