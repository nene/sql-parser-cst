import { dialect, testExpr } from "../test_utils";

describe("logic operators", () => {
  dialect(["mysql", "sqlite"], () => {
    it("parses unary ! operator", () => {
      testExpr(`!x OR y`);
      testExpr(`!!!false`);
      testExpr(`!/*com*/ true`);
    });
  });

  it("parses NOT operator", () => {
    testExpr(`NOT x > y`);
    testExpr(`NOT NOT true`);
    testExpr(`NOT /*com*/ true`);
  });

  it("parses AND operator", () => {
    testExpr(`x > 1 AND false`);
    testExpr(`c < 2 AND y = 2 AND 3 > 2`);
    testExpr(`true /*com1*/ AND /*com2*/ false`);
  });

  dialect("mysql", () => {
    it("parses XOR operator", () => {
      testExpr(`true XOR false`);
      testExpr(`x != 3 XOR y > 2 XOR z <> 4`);
      testExpr(`true /*com1*/ XOR /*com2*/ false`);
    });
  });

  it("parses OR operator", () => {
    testExpr(`true OR false`);
    testExpr(`x != 3 OR y > 2 OR z <> 4`);
    testExpr(`true /*com1*/ OR /*com2*/ false`);
  });

  dialect("mysql", () => {
    it("parses && as equivalent to AND", () => {
      testExpr(`x > 1 && false`);
      testExpr(`c < 2 && y = 2 && 3 > 2`);
      testExpr(`true /*com1*/ && /*com2*/ false`);
    });

    it("parses || as equivalent to OR", () => {
      testExpr(`true || false`);
      testExpr(`x != 3 || y > 2 || z <> 4`);
      testExpr(`true /*com1*/ || /*com2*/ false`);
    });
  });
});
