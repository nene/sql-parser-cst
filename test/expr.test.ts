import { parse, show } from "../src/parser";

describe("expr", () => {
  function parseExpr(expr: string) {
    return parse(`SELECT ${expr}`).select.columns[0];
  }

  function testExpr(expr: string) {
    expect(show(parse(`SELECT ${expr}`))).toBe(`SELECT ${expr}`);
  }

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

    it("parses NOT operator", () => {
      testExpr(`NOT x > y`);
      testExpr(`NOT NOT true`);
      testExpr(`NOT /*com*/ true`);
    });

    it("parses AND / && operator", () => {
      testExpr(`x > 1 AND false`);
      testExpr(`c < 2 AND y = 2 AND 3 > 2`);
      testExpr(`true /*com1*/ AND /*com2*/ false`);

      testExpr(`x > 1 && false`);
      testExpr(`c < 2 && y = 2 && 3 > 2`);
      testExpr(`true /*com1*/ && /*com2*/ false`);
    });

    it("parses OR / || operator", () => {
      testExpr(`true OR false`);
      testExpr(`x != 3 OR y > 2 OR z <> 4`);
      testExpr(`true /*com1*/ OR /*com2*/ false`);

      testExpr(`true || false`);
      testExpr(`x != 3 || y > 2 || z <> 4`);
      testExpr(`true /*com1*/ || /*com2*/ false`);
    });
  });

  describe("operator precedence", () => {
    it("associates same level binary operators to left", () => {
      expect(parseExpr(`5 + 2 - 1`)).toMatchInlineSnapshot(`
        {
          "left": {
            "left": {
              "text": "5",
              "type": "number",
            },
            "operator": "+",
            "right": {
              "text": "2",
              "type": "number",
            },
            "type": "binary_expr",
          },
          "operator": "-",
          "right": {
            "text": "1",
            "type": "number",
          },
          "type": "binary_expr",
        }
      `);
    });

    it("multiplication has higher precedence than addition", () => {
      expect(parseExpr(`5 + 2 * 3`)).toMatchInlineSnapshot(`
        {
          "left": {
            "text": "5",
            "type": "number",
          },
          "operator": "+",
          "right": {
            "left": {
              "text": "2",
              "type": "number",
            },
            "operator": "*",
            "right": {
              "text": "3",
              "type": "number",
            },
            "type": "binary_expr",
          },
          "type": "binary_expr",
        }
      `);
    });

    it("addition has higher precedence than comparison", () => {
      expect(parseExpr(`5 + 2 > 3 + 1`)).toMatchInlineSnapshot(`
        {
          "left": {
            "left": {
              "text": "5",
              "type": "number",
            },
            "operator": "+",
            "right": {
              "text": "2",
              "type": "number",
            },
            "type": "binary_expr",
          },
          "operator": ">",
          "right": {
            "left": {
              "text": "3",
              "type": "number",
            },
            "operator": "+",
            "right": {
              "text": "1",
              "type": "number",
            },
            "type": "binary_expr",
          },
          "type": "binary_expr",
        }
      `);
    });

    it("comparison has higher precedence than NOT", () => {
      expect(parseExpr(`NOT x > y`)).toMatchInlineSnapshot(`
        {
          "expr": {
            "left": {
              "column": {
                "text": "x",
                "type": "identifier",
              },
              "type": "column_ref",
            },
            "operator": ">",
            "right": {
              "column": {
                "text": "y",
                "type": "identifier",
              },
              "type": "column_ref",
            },
            "type": "binary_expr",
          },
          "operator": {
            "text": "NOT",
            "type": "keyword",
          },
          "type": "unary_expr",
        }
      `);
    });

    it("NOT has higher precedence than AND", () => {
      expect(parseExpr(`NOT false AND true`)).toMatchInlineSnapshot(`
        {
          "left": {
            "expr": {
              "text": "false",
              "type": "bool",
            },
            "operator": {
              "text": "NOT",
              "type": "keyword",
            },
            "type": "unary_expr",
          },
          "operator": {
            "text": "AND",
            "type": "keyword",
          },
          "right": {
            "text": "true",
            "type": "bool",
          },
          "type": "binary_expr",
        }
      `);
    });

    it("AND has higher precedence than OR", () => {
      expect(parseExpr(`true OR false AND true`)).toMatchInlineSnapshot(`
        {
          "left": {
            "text": "true",
            "type": "bool",
          },
          "operator": {
            "text": "OR",
            "type": "keyword",
          },
          "right": {
            "left": {
              "text": "false",
              "type": "bool",
            },
            "operator": {
              "text": "AND",
              "type": "keyword",
            },
            "right": {
              "text": "true",
              "type": "bool",
            },
            "type": "binary_expr",
          },
          "type": "binary_expr",
        }
      `);
    });
  });
});
