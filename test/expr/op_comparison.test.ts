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

  dialect("mysql", () => {
    it(`supports <=> operator`, () => {
      testExprWc(`5 <=> 7`);
    });
  });

  describe("IS", () => {
    it("supports IS [NOT] NULL operator", () => {
      testExprWc(`col IS NULL`);
      testExprWc(`col IS NOT NULL`);
    });

    dialect(["bigquery", "mysql"], () => {
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

    dialect(["sqlite", "bigquery"], () => {
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
});
