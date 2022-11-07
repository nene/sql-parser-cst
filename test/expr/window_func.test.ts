import { dialect, parseExpr, test } from "../test_utils";

describe("window functions", () => {
  it("supports referring to named window", () => {
    test(`SELECT row_number() OVER my_win`);
    test(`SELECT row_number() OVER /*c*/ my_win`);
  });

  it("supports empty window specification", () => {
    test(`SELECT row_number() OVER ()`);
    test(`SELECT row_number() OVER (/*c*/)`);
  });

  dialect("sqlite", () => {
    it("supports FILTER combined with OVER", () => {
      test(`SELECT row_number() FILTER (WHERE true) OVER my_win`);
    });
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

  it("supports frame clause with RANGE unit", () => {
    test(`SELECT sum(price) OVER (RANGE CURRENT ROW)`);
    test(`SELECT sum(price) OVER (RANGE BETWEEN CURRENT ROW AND 1 FOLLOWING)`);
  });

  dialect("sqlite", () => {
    it("supports frame clause with GROUPS unit", () => {
      test(`SELECT sum(price) OVER (GROUPS CURRENT ROW)`);
      test(`SELECT sum(price) OVER (GROUPS BETWEEN CURRENT ROW AND 1 FOLLOWING)`);
    });
  });

  it("supports frame clause with exclusion", () => {
    test(`SELECT sum(price) OVER (ROWS 1 PRECEDING EXCLUDE CURRENT ROW)`);
    test(`SELECT sum(price) OVER (ROWS 1 PRECEDING /*c1*/ EXCLUDE /*c2*/ CURRENT /*c3*/ ROW)`);
    test(`SELECT sum(price) OVER (ROWS 1 PRECEDING EXCLUDE NO OTHERS)`);
    test(`SELECT sum(price) OVER (ROWS 1 PRECEDING /*c1*/ EXCLUDE /*c2*/ NO /*c3*/ OTHERS)`);
    test(`SELECT sum(price) OVER (ROWS 1 PRECEDING EXCLUDE TIES)`);
    test(`SELECT sum(price) OVER (ROWS 1 PRECEDING /*c1*/ EXCLUDE /*c2*/ TIES)`);
    test(`SELECT sum(price) OVER (ROWS 1 PRECEDING EXCLUDE GROUP)`);
    test(`SELECT sum(price) OVER (ROWS 1 PRECEDING /*c1*/ EXCLUDE /*c2*/ GROUP)`);
  });

  it("parses window function call to syntax tree", () => {
    expect(
      parseExpr(`
      row_number() OVER (
        my_win
        PARTITION BY product
        ORDER BY price
        ROWS BETWEEN UNBOUNDED PRECEDING AND 2 FOLLOWING EXCLUDE CURRENT ROW
      )`)
    ).toMatchInlineSnapshot(`
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
              "frame": {
                "exclusion": {
                  "excludeKw": {
                    "text": "EXCLUDE",
                    "type": "keyword",
                  },
                  "kindKw": [
                    {
                      "text": "CURRENT",
                      "type": "keyword",
                    },
                    {
                      "text": "ROW",
                      "type": "keyword",
                    },
                  ],
                  "type": "frame_exclusion",
                },
                "extent": {
                  "andKw": {
                    "text": "AND",
                    "type": "keyword",
                  },
                  "begin": {
                    "expr": {
                      "type": "frame_unbounded",
                      "unboundedKw": {
                        "text": "UNBOUNDED",
                        "type": "keyword",
                      },
                    },
                    "precedingKw": {
                      "text": "PRECEDING",
                      "type": "keyword",
                    },
                    "type": "frame_bound_preceding",
                  },
                  "betweenKw": {
                    "text": "BETWEEN",
                    "type": "keyword",
                  },
                  "end": {
                    "expr": {
                      "text": "2",
                      "type": "number",
                    },
                    "followingKw": {
                      "text": "FOLLOWING",
                      "type": "keyword",
                    },
                    "type": "frame_bound_following",
                  },
                  "type": "frame_between",
                },
                "type": "frame_clause",
                "unitKw": {
                  "text": "ROWS",
                  "type": "keyword",
                },
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
                "specifications": {
                  "items": [
                    {
                      "column": {
                        "text": "price",
                        "type": "identifier",
                      },
                      "type": "column_ref",
                    },
                  ],
                  "type": "expr_list",
                },
                "type": "order_by_clause",
                "withRollupKw": undefined,
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
                "specifications": {
                  "items": [
                    {
                      "column": {
                        "text": "product",
                        "type": "identifier",
                      },
                      "type": "column_ref",
                    },
                  ],
                  "type": "expr_list",
                },
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
