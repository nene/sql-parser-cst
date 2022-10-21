import { parseExpr, test } from "./test_utils";

describe("window functions", () => {
  it("supports referring to named window", () => {
    test(`SELECT row_number() OVER my_win`);
    test(`SELECT row_number() OVER /*c*/ my_win`);
  });

  it("supports empty window specification", () => {
    test(`SELECT row_number() OVER ()`);
    test(`SELECT row_number() OVER (/*c*/)`);
  });

  it("supports PARTITION BY", () => {
    test(`SELECT sum(profit) OVER (PARTITION BY product)`);
    test(
      `SELECT sum(profit) /*c1*/ OVER /*c2*/ ( /*c3*/ PARTITION /*c4*/ BY /*c5*/ product /*c6*/ )`
    );
  });

  it("supports ORDER BY", () => {
    test(`SELECT row_number() OVER (ORDER BY col)`);
    test(`SELECT row_number() /*c1*/ OVER /*c2*/ ( /*c3*/ ORDER BY col /*c4*/ )`);
  });

  it("supports base window", () => {
    test(`SELECT row_number() OVER (my_win)`);
    test(`SELECT row_number() OVER (my_win PARTITION BY product)`);
    test(`SELECT row_number() OVER (my_win PARTITION BY product ORDER BY price)`);
    test(`SELECT row_number() OVER (/*c1*/ my_win /*c2*/)`);
  });

  it("parses window function call to syntax tree", () => {
    expect(parseExpr("row_number() OVER (my_win PARTITION BY product ORDER BY price)"))
      .toMatchInlineSnapshot(`
      {
        "args": {
          "expr": {
            "items": [],
            "type": "expr_list",
          },
          "type": "paren_expr",
        },
        "name": {
          "text": "row_number",
          "type": "identifier",
        },
        "over": {
          "overKw": {
            "text": "OVER",
            "type": "keyword",
          },
          "type": "over_arg",
          "window": {
            "expr": {
              "baseWindowName": {
                "text": "my_win",
                "type": "identifier",
              },
              "orderBy": {
                "orderByKw": [
                  {
                    "text": "ORDER",
                    "type": "keyword",
                  },
                  {
                    "text": "BY",
                    "type": "keyword",
                  },
                ],
                "specifications": [
                  {
                    "expr": {
                      "column": {
                        "text": "price",
                        "type": "identifier",
                      },
                      "type": "column_ref",
                    },
                    "type": "sort_specification",
                  },
                ],
                "type": "order_by_clause",
              },
              "partitionBy": {
                "partitionByKw": [
                  {
                    "text": "PARTITION",
                    "type": "keyword",
                  },
                  {
                    "text": "BY",
                    "type": "keyword",
                  },
                ],
                "specifications": [
                  {
                    "column": {
                      "text": "product",
                      "type": "identifier",
                    },
                    "type": "column_ref",
                  },
                ],
                "type": "partition_by_clause",
              },
              "type": "window_definition",
            },
            "type": "paren_expr",
          },
        },
        "type": "func_call",
      }
    `);
  });
});
