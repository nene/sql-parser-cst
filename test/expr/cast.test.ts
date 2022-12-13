import { dialect, parseExpr, testExpr } from "../test_utils";

describe("type cast", () => {
  it("supports cast() function", () => {
    testExpr(`CAST(x AS INT)`);
    testExpr(`CAST(2 / 8 AS DECIMAL(3, 2))`);
    testExpr(`CAST /*c1*/ ( /*c2*/ x /*c3*/ AS /*c4*/ INT /*c5*/)`);
  });

  dialect("bigquery", () => {
    it("supports SAFE_CAST", () => {
      testExpr(`SAFE_CAST(x AS INT)`);
    });

    it("supports CAST with FORMAT", () => {
      testExpr(`CAST('86-11-08' AS DATE FORMAT 'YY-MM-DD')`);
      testExpr(`CAST(1024 AS STRING FORMAT get_fmt(4))`);
      testExpr(`CAST(8 AS STRING /*c1*/ FORMAT /*c2*/ '$99' /*c3*/)`);
    });
  });

  // To make sure we don't parse it as normal function call
  it("parses CAST() to syntax tree", () => {
    expect(parseExpr(`CAST(10 AS INT)`)).toMatchInlineSnapshot(`
      {
        "args": {
          "expr": {
            "asKw": {
              "name": "AS",
              "text": "AS",
              "type": "keyword",
            },
            "dataType": {
              "nameKw": {
                "name": "INT",
                "text": "INT",
                "type": "keyword",
              },
              "type": "data_type",
            },
            "expr": {
              "text": "10",
              "type": "number_literal",
              "value": 10,
            },
            "format": undefined,
            "type": "cast_arg",
          },
          "type": "paren_expr",
        },
        "castKw": {
          "name": "CAST",
          "text": "CAST",
          "type": "keyword",
        },
        "type": "cast_expr",
      }
    `);
  });
});
