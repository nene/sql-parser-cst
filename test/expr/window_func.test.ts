import { dialect, parseExpr, testWc } from "../test_utils";

describe("window functions", () => {
  it("supports referring to named window", () => {
    testWc(`SELECT row_number() OVER my_win`);
  });

  it("supports empty window specification", () => {
    testWc(`SELECT row_number() OVER ( )`);
  });

  dialect("sqlite", () => {
    it("supports FILTER combined with OVER", () => {
      testWc(`SELECT row_number() FILTER (WHERE true) OVER my_win`);
    });
  });

  it("supports PARTITION BY", () => {
    testWc(`SELECT sum(profit) OVER (PARTITION BY product)`);
  });

  it("supports ORDER BY", () => {
    testWc(`SELECT row_number() OVER (ORDER BY col)`);
  });

  it("supports base window", () => {
    testWc(`SELECT row_number() OVER (my_win)`);
    testWc(`SELECT row_number() OVER (my_win PARTITION BY product)`);
    testWc(`SELECT row_number() OVER (my_win PARTITION BY product ORDER BY price)`);
  });

  it("supports frame clause with single bound", () => {
    testWc(`SELECT sum(price) OVER (ROWS UNBOUNDED PRECEDING) as running_total`);
    testWc(`SELECT sum(price) OVER (ROWS UNBOUNDED FOLLOWING) as running_total`);
    testWc(`SELECT sum(price) OVER (ROWS CURRENT ROW)`);
    testWc(`SELECT sum(price) OVER (ROWS 15 PRECEDING)`);
    testWc(`SELECT sum(price) OVER (ROWS 28 FOLLOWING)`);
  });

  it("supports frame clause with BETWEEN", () => {
    testWc(`SELECT sum(price) OVER (ROWS BETWEEN 1 PRECEDING AND 2 FOLLOWING)`);
    testWc(`SELECT sum(price) OVER (ROWS BETWEEN 2 FOLLOWING AND 1 FOLLOWING)`);
    testWc(`SELECT sum(price) OVER (ROWS BETWEEN UNBOUNDED PRECEDING AND 1 FOLLOWING)`);
    testWc(`SELECT sum(price) OVER (ROWS BETWEEN 2 PRECEDING AND UNBOUNDED PRECEDING)`);
    testWc(`SELECT sum(price) OVER (ROWS BETWEEN 7 FOLLOWING AND CURRENT ROW)`);
  });

  it("supports frame clause with RANGE unit", () => {
    testWc(`SELECT sum(price) OVER (RANGE CURRENT ROW)`);
    testWc(`SELECT sum(price) OVER (RANGE BETWEEN CURRENT ROW AND 1 FOLLOWING)`);
  });

  dialect("sqlite", () => {
    it("supports frame clause with GROUPS unit", () => {
      testWc(`SELECT sum(price) OVER (GROUPS CURRENT ROW)`);
      testWc(`SELECT sum(price) OVER (GROUPS BETWEEN CURRENT ROW AND 1 FOLLOWING)`);
    });
  });

  it("supports frame clause with exclusion", () => {
    testWc(`SELECT sum(price) OVER (ROWS 1 PRECEDING EXCLUDE CURRENT ROW)`);
    testWc(`SELECT sum(price) OVER (ROWS 1 PRECEDING EXCLUDE NO OTHERS)`);
    testWc(`SELECT sum(price) OVER (ROWS 1 PRECEDING EXCLUDE TIES)`);
    testWc(`SELECT sum(price) OVER (ROWS 1 PRECEDING EXCLUDE GROUP)`);
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
            "args": {
              "items": [],
              "type": "list_expr",
            },
            "distinctKw": undefined,
            "limit": undefined,
            "nullHandlingKw": undefined,
            "orderBy": undefined,
            "type": "func_args",
          },
          "type": "paren_expr",
        },
        "filter": undefined,
        "name": {
          "name": "row_number",
          "text": "row_number",
          "type": "identifier",
        },
        "over": {
          "overKw": {
            "name": "OVER",
            "text": "OVER",
            "type": "keyword",
          },
          "type": "over_arg",
          "window": {
            "expr": {
              "baseWindowName": {
                "name": "my_win",
                "text": "my_win",
                "type": "identifier",
              },
              "frame": {
                "exclusion": {
                  "excludeKw": {
                    "name": "EXCLUDE",
                    "text": "EXCLUDE",
                    "type": "keyword",
                  },
                  "kindKw": [
                    {
                      "name": "CURRENT",
                      "text": "CURRENT",
                      "type": "keyword",
                    },
                    {
                      "name": "ROW",
                      "text": "ROW",
                      "type": "keyword",
                    },
                  ],
                  "type": "frame_exclusion",
                },
                "extent": {
                  "andKw": {
                    "name": "AND",
                    "text": "AND",
                    "type": "keyword",
                  },
                  "begin": {
                    "expr": {
                      "type": "frame_unbounded",
                      "unboundedKw": {
                        "name": "UNBOUNDED",
                        "text": "UNBOUNDED",
                        "type": "keyword",
                      },
                    },
                    "precedingKw": {
                      "name": "PRECEDING",
                      "text": "PRECEDING",
                      "type": "keyword",
                    },
                    "type": "frame_bound_preceding",
                  },
                  "betweenKw": {
                    "name": "BETWEEN",
                    "text": "BETWEEN",
                    "type": "keyword",
                  },
                  "end": {
                    "expr": {
                      "text": "2",
                      "type": "number_literal",
                      "value": 2,
                    },
                    "followingKw": {
                      "name": "FOLLOWING",
                      "text": "FOLLOWING",
                      "type": "keyword",
                    },
                    "type": "frame_bound_following",
                  },
                  "type": "frame_between",
                },
                "type": "frame_clause",
                "unitKw": {
                  "name": "ROWS",
                  "text": "ROWS",
                  "type": "keyword",
                },
              },
              "orderBy": {
                "orderByKw": [
                  {
                    "name": "ORDER",
                    "text": "ORDER",
                    "type": "keyword",
                  },
                  {
                    "name": "BY",
                    "text": "BY",
                    "type": "keyword",
                  },
                ],
                "specifications": {
                  "items": [
                    {
                      "name": "price",
                      "text": "price",
                      "type": "identifier",
                    },
                  ],
                  "type": "list_expr",
                },
                "type": "order_by_clause",
                "withRollupKw": undefined,
              },
              "partitionBy": {
                "partitionByKw": [
                  {
                    "name": "PARTITION",
                    "text": "PARTITION",
                    "type": "keyword",
                  },
                  {
                    "name": "BY",
                    "text": "BY",
                    "type": "keyword",
                  },
                ],
                "specifications": {
                  "items": [
                    {
                      "name": "product",
                      "text": "product",
                      "type": "identifier",
                    },
                  ],
                  "type": "list_expr",
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
