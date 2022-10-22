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

  it("supports frame clause with single bound", () => {
    test(`SELECT sum(price) OVER (ROWS UNBOUNDED PRECEDING) as running_total`);
    test(
      `SELECT sum(price) OVER (/*c1*/ ROWS /*c2*/ UNBOUNDED /*c3*/ PRECEDING /*c4*/) as running_total`
    );
    test(`SELECT sum(price) OVER (ROWS UNBOUNDED FOLLOWING) as running_total`);
    test(
      `SELECT sum(price) OVER (/*c1*/ ROWS /*c2*/ UNBOUNDED /*c3*/ FOLLOWING /*c4*/) as running_total`
    );
    test(`SELECT sum(price) OVER (ROWS CURRENT ROW)`);
    test(`SELECT sum(price) OVER (/*c1*/ ROWS /*c2*/ CURRENT /*c3*/ ROW /*c4*/)`);
    test(`SELECT sum(price) OVER (ROWS 15 PRECEDING)`);
    test(`SELECT sum(price) OVER (/*c1*/ ROWS /*c2*/ 15 /*c3*/ PRECEDING /*c4*/)`);
    test(`SELECT sum(price) OVER (ROWS 28 FOLLOWING)`);
    test(`SELECT sum(price) OVER (/*c1*/ ROWS /*c2*/ 28 /*c3*/ FOLLOWING /*c4*/)`);
  });

  it("supports frame clause with BETWEEN", () => {
    test(`SELECT sum(price) OVER (ROWS BETWEEN 1 PRECEDING AND 2 FOLLOWING)`);
    test(`SELECT sum(price) OVER (ROWS BETWEEN 2 FOLLOWING AND 1 FOLLOWING)`);
    test(`SELECT sum(price) OVER (ROWS BETWEEN UNBOUNDED PRECEDING AND 1 FOLLOWING)`);
    test(`SELECT sum(price) OVER (ROWS BETWEEN 2 PRECEDING AND UNBOUNDED PRECEDING)`);
    test(`SELECT sum(price) OVER (ROWS BETWEEN 7 FOLLOWING AND CURRENT ROW)`);
    test(
      `SELECT sum(price) OVER (ROWS BETWEEN /*c1*/ 1 /*c2*/ PRECEDING /*c3*/ AND /*c4*/ 2 /*c5*/ FOLLOWING)`
    );
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
