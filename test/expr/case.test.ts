import { parseExpr, testExpr, testExprWc } from "../test_utils";

describe("CASE expression", () => {
  it("supports simple CASE", () => {
    testExprWc(`
      CASE animal
        WHEN 1 THEN 'dog'
        WHEN 2 THEN 'cat'
        ELSE 'mouse'
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
                "name": "animal",
                "text": "animal",
                "type": "identifier",
              },
              "operator": "=",
              "right": {
                "text": "1",
                "type": "number_literal",
                "value": 1,
              },
              "type": "binary_expr",
            },
            "result": {
              "text": "'dog'",
              "type": "string_literal",
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
              "type": "string_literal",
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
