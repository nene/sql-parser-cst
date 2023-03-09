import { dialect, testExprWc } from "../test_utils";

describe("arithmetic operators", () => {
  ["+", "-", "*", "/"].forEach((op) => {
    it(`supports ${op} operator`, () => {
      testExprWc(`5 ${op} 7`);
    });
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("supports % operator", () => {
      testExprWc(`8 % 4`);
    });

    it("supports DIV operator", () => {
      testExprWc(`8 DIV 4`);
      testExprWc(`8 div 4`);
    });

    it("supports MOD operator", () => {
      testExprWc(`8 MOD 4`);
      testExprWc(`8 mod 4`);
    });
  });

  it("supports unary negation operator", () => {
    testExprWc(`x + -y`);
  });
});
