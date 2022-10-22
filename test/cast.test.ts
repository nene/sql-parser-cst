import { parseExpr, testExpr } from "./test_utils";

describe("type cast", () => {
  it("supports cast() function", () => {
    testExpr(`CAST(x AS INT)`);
    testExpr(`CAST(2 / 8 AS DECIMAL(3, 2))`);
    testExpr(`CAST /*c1*/ ( /*c2*/ x /*c3*/ AS /*c4*/ INT /*c5*/)`);
  });

  // To make sure we don't parse it as normal function call
  it("parses CAST() to syntax tree", () => {
    expect(parseExpr(`CAST(10 AS INT)`)).toMatchInlineSnapshot(`
      {
        "args": {
          "expr": {
            "asKw": {
              "text": "AS",
              "type": "keyword",
            },
            "dataType": {
              "nameKw": {
                "text": "INT",
                "type": "keyword",
              },
              "type": "data_type",
            },
            "expr": {
              "text": "10",
              "type": "number",
            },
            "type": "cast_arg",
          },
          "type": "paren_expr",
        },
        "castKw": {
          "text": "CAST",
          "type": "keyword",
        },
        "type": "cast_expr",
      }
    `);
  });
});
