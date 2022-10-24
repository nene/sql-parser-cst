import { dialect, parseExpr, showPrecedence, testExpr } from "./test_utils";

describe("expr", () => {
  describe("operators", () => {
    // punctuation-based operators
    [
      "+",
      "-",
      "*",
      "/",
      "%",
      "&",
      ">>",
      "<<",
      "^",
      "|",
      "<=>",
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

    it("requires no space around punctuation-based operators", () => {
      testExpr(`8+4`);
    });

    it("associates same level binary operators to left", () => {
      expect(showPrecedence(`5 + 2 - 1 + 3`)).toBe(`(((5 + 2) - 1) + 3)`);
    });

    it("multiplication has higher precedence than addition", () => {
      expect(showPrecedence(`5 + 2 * 3`)).toBe(`(5 + (2 * 3))`);
    });

    it("addition has higher precedence than comparison", () => {
      expect(showPrecedence(`5 + 2 > 3 + 1`)).toBe(`((5 + 2) > (3 + 1))`);
    });

    it("requires space around keyword operators", () => {
      // this gets parsed as an identifier
      expect(parseExpr(`8DIV4`)).toMatchInlineSnapshot(`
        {
          "column": {
            "text": "8DIV4",
            "type": "identifier",
          },
          "type": "column_ref",
        }
      `);
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

    it("parses unary bit inversion operator", () => {
      testExpr(`x << ~y`);
    });

    it("parses unary ! operator", () => {
      testExpr(`!x OR y`);
      testExpr(`!!!false`);
      testExpr(`!/*com*/ true`);
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

    it("parses REGEXP/RLIKE operator", () => {
      testExpr(`'foooo' REGEXP 'fo*'`);
      testExpr(`'foooo' RLIKE 'fo*'`);
      testExpr(`'foooo' /*c1*/ RLIKE /*c2*/ 'fo*'`);
    });

    it("parses NOT REGEXP/RLIKE operator", () => {
      testExpr(`'foooo' NOT REGEXP 'fo*'`);
      testExpr(`'foooo' NOT RLIKE 'fo*'`);
      testExpr(`'foooo' /*c1*/ NOT /*c2*/ RLIKE /*c3*/ 'fo*'`);
    });

    it("parses basic IN operator", () => {
      testExpr(`'oo' IN 'foobar'`);
      testExpr(`'oo' /*c1*/ IN /*c2*/ 'foobar'`);
    });

    it("parses basic NOT IN operator", () => {
      testExpr(`'oo' NOT IN 'foobar'`);
      testExpr(`'oo' /*c1*/ NOT /*c2*/ IN /*c3*/ 'foobar'`);
    });

    it("parses IN (...) operator", () => {
      testExpr(`7 IN (1, 2, 3, 4)`);
      testExpr(`7 NOT IN (1, 2, 3, 4)`);
      testExpr(`7 /*c*/ IN /*c0*/ (/*c1*/ 1 /*c2*/, /*c3*/ 2 /*c4*/)`);
      testExpr(`7 /**/ NOT /*c*/ IN /*c0*/ (/*c1*/ 1 /*c2*/, /*c3*/ 2 /*c4*/)`);
    });

    it("parses BETWEEN operator", () => {
      testExpr(`5 BETWEEN 1 AND 10`);
      testExpr(`5 between 1 and 10`);
      testExpr(`5 /*c1*/ BETWEEN /*c2*/ 1 /*c3*/ AND /*c4*/ 10`);
    });

    it("parses NOT BETWEEN operator", () => {
      testExpr(`5 NOT BETWEEN 1 AND 10`);
      testExpr(`5 /*c0*/ not /*c1*/ BETWEEN /*c2*/ 1 /*c3*/ AND /*c4*/ 10`);
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

    dialect("sqlite", () => {
      it("parses || as concatenation operator", () => {
        testExpr(`'hello' || ' ' || 'world'`);
        testExpr(`str1 /*c1*/ || /*c2*/ str2`);
      });

      it("treats || with higher precedence than multiplication", () => {
        expect(showPrecedence(`2 * y || z`)).toBe(`(2 * (y || z))`);
      });

      it("treats || with lower precedence than negation", () => {
        expect(showPrecedence(`-x || -y`)).toBe(`((- x) || (- y))`);
      });
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

  describe("parenthesis", () => {
    it("parses parenthesized expressions", () => {
      testExpr(`2 * (2 + 3)`);
      testExpr(`((true OR false) AND true)`);
      testExpr(`(/*c1*/ 42 /*c2*/)`);
    });
  });
});
