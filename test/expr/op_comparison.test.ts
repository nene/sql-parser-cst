import { BinaryExpr } from "../../src/cst/Node";
import { dialect, parseExpr, testExprWc } from "../test_utils";

describe("comparison operators", () => {
  [">=", ">", "<=", "<>", "<", "=", "!="].forEach((op) => {
    it(`parses ${op} operator`, () => {
      testExprWc(`5 ${op} 7`);
    });
  });

  dialect("sqlite", () => {
    it(`supports == operator`, () => {
      testExprWc(`5 == 7`);
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it(`supports <=> operator`, () => {
      testExprWc(`5 <=> 7`);
    });
  });

  describe("IS", () => {
    it("supports IS [NOT] NULL operator", () => {
      testExprWc(`col IS NULL`);
      testExprWc(`col IS NOT NULL`);
    });

    dialect(["mysql", "mariadb", "bigquery", "postgresql"], () => {
      it("supports IS [NOT] TRUE/FALSE operator", () => {
        testExprWc(`col IS TRUE`);
        testExprWc(`col IS NOT FALSE`);
      });

      it("supports IS [NOT] UNKNOWN operator", () => {
        testExprWc(`col IS UNKNOWN`);
        testExprWc(`col IS NOT UNKNOWN`);
      });

      it("parses UNKNOWN in IS UNKNOWN as keyword, not as identifier", () => {
        expect(parseExpr("col IS UNKNOWN")).toMatchInlineSnapshot(`
          {
            "expr": {
              "name": "col",
              "text": "col",
              "type": "identifier",
            },
            "operator": [
              {
                "name": "IS",
                "text": "IS",
                "type": "keyword",
              },
              {
                "name": "UNKNOWN",
                "text": "UNKNOWN",
                "type": "keyword",
              },
            ],
            "type": "postfix_op_expr",
          }
        `);
      });
    });

    dialect(["sqlite", "bigquery", "postgresql"], () => {
      it("supports IS [NOT] DISTINCT FROM as alternative spelling for IS [NOT]", () => {
        testExprWc(`col IS DISTINCT FROM NULL`);
        testExprWc(`col IS NOT DISTINCT FROM NULL`);
      });
    });

    it("parses IS NOT as single operator (not IS + NOT)", () => {
      expect((parseExpr(`x IS NOT NULL`) as BinaryExpr).operator).toMatchInlineSnapshot(`
        [
          {
            "name": "IS",
            "text": "IS",
            "type": "keyword",
          },
          {
            "name": "NOT",
            "text": "NOT",
            "type": "keyword",
          },
        ]
      `);
    });
  });

  dialect("sqlite", () => {
    it("supports unary null-check operators", () => {
      testExprWc("col ISNULL");
      testExprWc("col NOTNULL");
      testExprWc("col NOT NULL");
    });

    it("parses unary null-check operators as postfix operators", () => {
      expect(parseExpr("col NOT NULL")).toMatchInlineSnapshot(`
        {
          "expr": {
            "name": "col",
            "text": "col",
            "type": "identifier",
          },
          "operator": [
            {
              "name": "NOT",
              "text": "NOT",
              "type": "keyword",
            },
            {
              "name": "NULL",
              "text": "NULL",
              "type": "keyword",
            },
          ],
          "type": "postfix_op_expr",
        }
      `);
    });
  });

  describe("IN", () => {
    it("supports basic [NOT] IN operator", () => {
      testExprWc(`x IN col1`);
      testExprWc(`x NOT IN col1`);
    });

    it("supports [NOT] IN (...) operator", () => {
      testExprWc(`7 IN (1, 2, 3, 4)`);
      testExprWc(`7 NOT IN (1, 2, 3, 4)`);
    });

    it("supports [NOT] IN (SELECT) operator", () => {
      testExprWc(`7 IN (SELECT * FROM numbers)`);
      testExprWc(`7 NOT IN (SELECT 1)`);
    });

    dialect("bigquery", () => {
      it("supports IN UNNEST (array) operator", () => {
        testExprWc(`7 IN UNNEST ([1, 2, 3])`);
        testExprWc(`7 NOT IN UNNEST ([42])`);
      });
    });
  });

  describe("BETWEEN", () => {
    it("supports [NOT] BETWEEN operator", () => {
      testExprWc(`5 BETWEEN 1 AND 10`);
      testExprWc(`5 between 1 and 10`);
      testExprWc(`col NOT BETWEEN 1 AND 10`);
    });

    it("parses BETWEEN..AND as single expression (not BETWEEN + AND)", () => {
      expect(parseExpr(`age BETWEEN 7 AND 20`)).toMatchInlineSnapshot(`
        {
          "andKw": {
            "name": "AND",
            "text": "AND",
            "type": "keyword",
          },
          "begin": {
            "text": "7",
            "type": "number_literal",
            "value": 7,
          },
          "betweenKw": {
            "name": "BETWEEN",
            "text": "BETWEEN",
            "type": "keyword",
          },
          "end": {
            "text": "20",
            "type": "number_literal",
            "value": 20,
          },
          "left": {
            "name": "age",
            "text": "age",
            "type": "identifier",
          },
          "type": "between_expr",
        }
      `);
    });
  });

  dialect(["mysql"], () => {
    it("supports MEMBER OF operator", () => {
      testExprWc(`17 MEMBER OF ('[23, 17, 10]')`);
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports SOUNDS LIKE operator", () => {
      testExprWc(`'haha' SOUNDS LIKE 'hoho'`);
    });
  });

  dialect(["sqlite", "bigquery"], () => {
    it("does not support MEMBER OF operator", () => {
      expect(() => parseExpr(`3 MEMBER OF ('[3]')`)).toThrowError();
    });
    it("does not support SOUNDS LIKE operator", () => {
      expect(() => parseExpr(`'sun' SOUNDS LIKE 'son'`)).toThrowError();
    });
  });

  describe("quantifiers", () => {
    dialect(["mysql", "mariadb"], () => {
      it("supports ANY / SOME / ALL quantifiers", () => {
        testExprWc(`col = ANY (SELECT c1 FROM tbl)`);
        testExprWc(`col >= SOME (SELECT c1 FROM tbl)`);
        testExprWc(`col < ALL (SELECT c1 FROM tbl)`);
      });

      it("parses quantifier_expr", () => {
        expect(parseExpr(`col = ANY (SELECT 1)`)).toMatchInlineSnapshot(`
          {
            "left": {
              "name": "col",
              "text": "col",
              "type": "identifier",
            },
            "operator": "=",
            "right": {
              "expr": {
                "expr": {
                  "clauses": [
                    {
                      "asStructOrValueKw": undefined,
                      "columns": {
                        "items": [
                          {
                            "text": "1",
                            "type": "number_literal",
                            "value": 1,
                          },
                        ],
                        "type": "list_expr",
                      },
                      "distinctKw": undefined,
                      "hints": [],
                      "selectKw": {
                        "name": "SELECT",
                        "text": "SELECT",
                        "type": "keyword",
                      },
                      "type": "select_clause",
                    },
                  ],
                  "type": "select_stmt",
                },
                "type": "paren_expr",
              },
              "quantifier": {
                "name": "ANY",
                "text": "ANY",
                "type": "keyword",
              },
              "type": "quantifier_expr",
            },
            "type": "binary_expr",
          }
        `);
      });
    });

    dialect(["sqlite", "bigquery"], () => {
      it("does not support quantifiers in comparison", () => {
        // The more complex test is needed because SQLite parses ANY(..) as function call
        expect(() => {
          const expr = parseExpr(`x = ANY (SELECT 1)`);
          if (expr.type !== "binary_expr") {
            throw new Error("Expected binary_expr");
          }
          if (expr.right.type !== "quantifier_expr") {
            throw new Error("Expected quantifier_expr");
          }
        }).toThrowError();
      });
    });
  });

  describe("full-text search", () => {
    dialect(["mysql", "mariadb"], () => {
      it("supports MATCH..AGAINST", () => {
        testExprWc(`MATCH (a) AGAINST ('abc')`);
        testExprWc(`MATCH (col1, col2, col3) AGAINST ('foo')`);
      });

      it("supports MATCH..AGAINST with modifiers", () => {
        testExprWc(`MATCH (a) AGAINST ('abc' IN NATURAL LANGUAGE MODE)`);
        testExprWc(`MATCH (a) AGAINST ('abc' IN NATURAL LANGUAGE MODE WITH QUERY EXPANSION)`);
        testExprWc(`MATCH (a) AGAINST ('abc' IN BOOLEAN MODE)`);
        testExprWc(`MATCH (a) AGAINST ('abc' WITH QUERY EXPANSION)`);
      });

      it("parses MATCH..AGAINST", () => {
        expect(parseExpr(`MATCH (a) AGAINST ('abc' IN BOOLEAN MODE)`)).toMatchInlineSnapshot(`
          [
            undefined,
            {
              "againstKw": {
                "name": "AGAINST",
                "text": "AGAINST",
                "type": "keyword",
              },
              "args": {
                "expr": {
                  "expr": {
                    "text": "'abc'",
                    "type": "string_literal",
                    "value": "abc",
                  },
                  "modifier": [
                    {
                      "name": "IN",
                      "text": "IN",
                      "type": "keyword",
                    },
                    {
                      "name": "BOOLEAN",
                      "text": "BOOLEAN",
                      "type": "keyword",
                    },
                    {
                      "name": "MODE",
                      "text": "MODE",
                      "type": "keyword",
                    },
                  ],
                  "type": "full_text_match_args",
                },
                "type": "paren_expr",
              },
              "columns": {
                "expr": {
                  "items": [
                    {
                      "name": "a",
                      "text": "a",
                      "type": "identifier",
                    },
                  ],
                  "type": "list_expr",
                },
                "type": "paren_expr",
              },
              "matchKw": {
                "name": "MATCH",
                "text": "MATCH",
                "type": "keyword",
              },
              "type": "full_text_match_expr",
            },
          ]
        `);
      });
    });

    dialect(["sqlite", "bigquery"], () => {
      it("does not support MATCH..AGAINST operator", () => {
        expect(() => parseExpr(`MATCH (col) AGAINST ('foo')`)).toThrowError();
      });
    });
  });
});
