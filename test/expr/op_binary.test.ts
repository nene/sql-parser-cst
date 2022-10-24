import { testExpr } from "../test_utils";

describe("binary operators", () => {
  ["&", ">>", "<<", "^", "|"].forEach((op) => {
    it(`parses ${op} operator`, () => {
      testExpr(`5 ${op} 7`);
      testExpr(`6 /* com1 */ ${op} /* com2 */ 7`);
    });
  });

  it("parses unary bit inversion operator", () => {
    testExpr(`x << ~y`);
  });
});
