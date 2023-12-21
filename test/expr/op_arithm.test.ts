import { dialect, parseExpr, testExprWc } from "../test_utils";

describe("arithmetic operators", () => {
  ["+", "-", "*", "/"].forEach((op) => {
    it(`supports ${op} operator`, () => {
      testExprWc(`5 ${op} 7`);
    });
  });

  dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
    it("supports % operator", () => {
      testExprWc(`8 % 4`);
    });
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("supports DIV operator", () => {
      testExprWc(`8 DIV 4`);
      testExprWc(`8 div 4`);
    });

    it("supports MOD operator", () => {
      testExprWc(`8 MOD 4`);
      testExprWc(`8 mod 4`);
    });
  });

  dialect(["postgresql"], () => {
    it("supports ^ operator", () => {
      testExprWc(`10 ^ 2`);
    });
  });

  it("supports unary negation operator", () => {
    testExprWc(`x + -y`);
    testExprWc(`x - -y`);
    testExprWc(`x - - -y`);
  });

  it("supports unary plus operator", () => {
    testExprWc(`x + +y`);
    testExprWc(`x - +y`);
    testExprWc(`x + + +y`);
  });

  it("parses unary + and - as operators, not as part of numbers", () => {
    expect(parseExpr("+5")).toMatchInlineSnapshot(`
      {
        "expr": {
          "text": "5",
          "type": "number_literal",
          "value": 5,
        },
        "operator": "+",
        "type": "prefix_op_expr",
      }
    `);
    expect(parseExpr("-5")).toMatchInlineSnapshot(`
      {
        "expr": {
          "text": "5",
          "type": "number_literal",
          "value": 5,
        },
        "operator": "-",
        "type": "prefix_op_expr",
      }
    `);
  });
});
