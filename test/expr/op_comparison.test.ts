import { BinaryExpr } from "../../src/cst/Node";
import { dialect, parseExpr, testExpr } from "../test_utils";

describe("comparison operators", () => {
  [">=", ">", "<=", "<>", "<", "=", "!="].forEach((op) => {
    it(`parses ${op} operator`, () => {
      testExpr(`5 ${op} 7`);
      testExpr(`6 /* com1 */ ${op} /* com2 */ 7`);
    });
  });

  dialect("sqlite", () => {
    it(`supports == operator`, () => {
      testExpr(`5 == 7`);
      testExpr(`6 /* com1 */ == /* com2 */ 7`);
    });
  });

  dialect("mysql", () => {
    it(`supports <=> operator`, () => {
      testExpr(`5 <=> 7`);
      testExpr(`6 /* com1 */ <=> /* com2 */ 7`);
    });
  });

  describe("IS", () => {
    it("supports IS [NOT] NULL operator", () => {
      testExpr(`col IS NULL`);
      testExpr(`col IS NOT NULL`);
      testExpr(`c /*c1*/ IS /*c2*/ NOT /*c3*/ NULL`);
    });

    dialect("bigquery", () => {
      it("supports IS [NOT] TRUE/FALSE operator", () => {
        testExpr(`col IS TRUE`);
        testExpr(`col IS NOT FALSE`);
        testExpr(`c /*c1*/ IS /*c2*/ NOT /*c3*/ TRUE`);
      });

      it("supports IS [NOT] UNKNOWN operator", () => {
        testExpr(`col IS UNKNOWN`);
        testExpr(`col IS NOT UNKNOWN`);
        testExpr(`c /*c1*/ IS /*c2*/ NOT /*c3*/ UNKNOWN`);
      });
    });

    dialect(["sqlite", "bigquery"], () => {
      it("supports IS [NOT] DISTINCT FROM as alternative spelling for IS [NOT]", () => {
        testExpr(`col IS DISTINCT FROM NULL`);
        testExpr(`col /*c1*/ IS /*c2*/ NOT /*c3*/ DISTINCT /*c4*/ FROM /*c5*/ NULL`);
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
      testExpr("col ISNULL");
      testExpr("col NOTNULL");
      testExpr("col NOT NULL");
      testExpr("col /*c1*/ NOT /*c2*/ NULL");
    });

    it("parses unary null-check operators as postfix operators", () => {
      expect(parseExpr("col NOT NULL")).toMatchInlineSnapshot(`
        {
          "expr": {
            "column": {
              "name": "col",
              "text": "col",
              "type": "identifier",
            },
            "type": "column_ref",
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
      testExpr(`x IN col1`);
      testExpr(`x NOT IN col1`);
      testExpr(`x /*c1*/ NOT /*c2*/ IN /*c3*/ col1`);
    });

    it("supports [NOT] IN (...) operator", () => {
      testExpr(`7 IN (1, 2, 3, 4)`);
      testExpr(`7 NOT IN (1, 2, 3, 4)`);
      testExpr(`7 /**/ NOT /*c*/ IN /*c0*/ (/*c1*/ 1 /*c2*/, /*c3*/ 2 /*c4*/)`);
    });

    it("supports [NOT] IN (SELECT) operator", () => {
      testExpr(`7 IN (SELECT * FROM numbers)`);
      testExpr(`7 NOT IN (SELECT 1)`);
    });
  });

  describe("BETWEEN", () => {
    it("supports [NOT] BETWEEN operator", () => {
      testExpr(`5 BETWEEN 1 AND 10`);
      testExpr(`5 between 1 and 10`);
      testExpr(`col NOT BETWEEN 1 AND 10`);
      testExpr(`5 /*c0*/ not /*c1*/ BETWEEN /*c2*/ 1 /*c3*/ AND /*c4*/ 10`);
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
            "type": "number",
            "value": 7,
          },
          "betweenKw": {
            "name": "BETWEEN",
            "text": "BETWEEN",
            "type": "keyword",
          },
          "end": {
            "text": "20",
            "type": "number",
            "value": 20,
          },
          "left": {
            "column": {
              "name": "age",
              "text": "age",
              "type": "identifier",
            },
            "type": "column_ref",
          },
          "type": "between_expr",
        }
      `);
    });
  });
});
