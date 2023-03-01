import { testExpr, testExprWc } from "../test_utils";

describe("paren_expr", () => {
  it("parses parenthesized expressions", () => {
    testExpr(`2 * (2 + 3)`);
    testExpr(`((true OR false) AND true)`);
    testExprWc(`( 42 )`);
  });
});
