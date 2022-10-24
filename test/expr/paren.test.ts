import { testExpr } from "../test_utils";

describe("paren_expr", () => {
  it("parses parenthesized expressions", () => {
    testExpr(`2 * (2 + 3)`);
    testExpr(`((true OR false) AND true)`);
    testExpr(`(/*c1*/ 42 /*c2*/)`);
  });
});
