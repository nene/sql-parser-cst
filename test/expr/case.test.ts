import { parseExpr, testExpr } from "../test_utils";

describe("CASE expression", () => {
  it("supports simple CASE", () => {
    testExpr(`
      CASE animal
        WHEN 1 THEN 'dog'
        WHEN 2 THEN 'cat'
        ELSE 'mouse'
      END`);

    testExpr(`
      CASE /*c1*/ animal /*c2*/
        WHEN /*c3*/ 1 /*c4*/ THEN /*c5*/ 'dog' /*c6*/
        ELSE /*c7*/ 'mouse' /*c8*/
      END`);
  });

  it("supports searched CASE", () => {
    testExpr(`
      CASE
        WHEN animal=1 THEN 'dog'
        WHEN animal=2 THEN 'cat'
        ELSE 'mouse'
      END`);
  });

  it("supports CASE without else", () => {
    testExpr(`
      CASE
        WHEN animal=1 THEN 'dog'
      END`);
  });

  it("parses CASE to syntax tree", () => {
    expect(
      parseExpr(`
      CASE
        WHEN animal=1 THEN 'dog'
        ELSE 'mouse'
      END`)
    ).toMatchInlineSnapshot(`
      {
        "caseKw": {
          "name": "CASE",
          "text": "CASE",
          "type": "keyword",
        },
        "clauses": [
          {
            "condition": {
              "left": {
                "column": {
                  "name": "animal",
                  "text": "animal",
                  "type": "identifier",
                },
                "type": "column_ref",
              },
              "operator": "=",
              "right": {
                "text": "1",
                "type": "number",
                "value": 1,
              },
              "type": "binary_expr",
            },
            "result": {
              "text": "'dog'",
              "type": "string",
              "value": "dog",
            },
            "thenKw": {
              "name": "THEN",
              "text": "THEN",
              "type": "keyword",
            },
            "type": "case_when",
            "whenKw": {
              "name": "WHEN",
              "text": "WHEN",
              "type": "keyword",
            },
          },
          {
            "elseKw": {
              "name": "ELSE",
              "text": "ELSE",
              "type": "keyword",
            },
            "result": {
              "text": "'mouse'",
              "type": "string",
              "value": "mouse",
            },
            "type": "case_else",
          },
        ],
        "endKw": {
          "name": "END",
          "text": "END",
          "type": "keyword",
        },
        "expr": undefined,
        "type": "case_expr",
      }
    `);
  });
});
