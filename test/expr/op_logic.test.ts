import { dialect, showPrecedence, testExpr } from "../test_utils";

describe("logic operators", () => {
  it("parses unary ! operator", () => {
    testExpr(`!x OR y`);
    testExpr(`!!!false`);
    testExpr(`!/*com*/ true`);
  });

  it("comparison has higher precedence than NOT", () => {
    expect(showPrecedence(`NOT x > 1`)).toBe(`(NOT (x > 1))`);
  });

  it("parses NOT operator", () => {
    testExpr(`NOT x > y`);
    testExpr(`NOT NOT true`);
    testExpr(`NOT /*com*/ true`);
  });

  it("NOT has higher precedence than AND", () => {
    expect(showPrecedence(`NOT false AND true`)).toBe(`((NOT false) AND true)`);
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

    it("XOR precedence: AND > XOR > OR", () => {
      expect(showPrecedence(`true OR false XOR true OR false`)).toBe(
        `((true OR (false XOR true)) OR false)`
      );
      expect(showPrecedence(`true XOR false AND true XOR false`)).toBe(
        `((true XOR (false AND true)) XOR false)`
      );
    });
  });

  it("AND has higher precedence than OR", () => {
    expect(showPrecedence(`true OR false AND true`)).toBe(`(true OR (false AND true))`);
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

    it("treats && with higher precedence than ||", () => {
      expect(showPrecedence(`true || false && true`)).toBe(`(true || (false && true))`);
    });

    it("gives same precedence to && and AND", () => {
      expect(showPrecedence(`true AND false && true AND false`)).toBe(
        `(((true AND false) && true) AND false)`
      );
    });

    it("gives same precedence to || and OR", () => {
      expect(showPrecedence(`true OR false || true OR false`)).toBe(
        `(((true OR false) || true) OR false)`
      );
    });
  });
});
