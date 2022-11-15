import { parse } from "./test_utils";

describe("location", () => {
  it("includeRange:true adds location data to nodes", () => {
    expect(parse("SELECT (1 + col) FROM tbl t", { includeRange: true })).toMatchInlineSnapshot(`
      {
        "range": [
          0,
          27,
        ],
        "statements": [
          {
            "clauses": [
              {
                "columns": {
                  "items": [
                    {
                      "expr": {
                        "left": {
                          "range": [
                            8,
                            9,
                          ],
                          "text": "1",
                          "type": "number",
                          "value": 1,
                        },
                        "operator": "+",
                        "range": [
                          8,
                          15,
                        ],
                        "right": {
                          "column": {
                            "range": [
                              12,
                              15,
                            ],
                            "text": "col",
                            "type": "identifier",
                          },
                          "range": [
                            12,
                            15,
                          ],
                          "type": "column_ref",
                        },
                        "type": "binary_expr",
                      },
                      "range": [
                        7,
                        16,
                      ],
                      "type": "paren_expr",
                    },
                  ],
                  "range": [
                    7,
                    16,
                  ],
                  "type": "list_expr",
                },
                "options": [],
                "range": [
                  0,
                  16,
                ],
                "selectKw": {
                  "name": "SELECT",
                  "range": [
                    0,
                    6,
                  ],
                  "text": "SELECT",
                  "type": "keyword",
                },
                "type": "select_clause",
              },
              {
                "expr": {
                  "alias": {
                    "range": [
                      26,
                      27,
                    ],
                    "text": "t",
                    "type": "identifier",
                  },
                  "expr": {
                    "range": [
                      22,
                      25,
                    ],
                    "table": {
                      "range": [
                        22,
                        25,
                      ],
                      "text": "tbl",
                      "type": "identifier",
                    },
                    "type": "table_ref",
                  },
                  "range": [
                    22,
                    27,
                  ],
                  "type": "alias",
                },
                "fromKw": {
                  "name": "FROM",
                  "range": [
                    17,
                    21,
                  ],
                  "text": "FROM",
                  "type": "keyword",
                },
                "range": [
                  17,
                  27,
                ],
                "type": "from_clause",
              },
            ],
            "range": [
              0,
              27,
            ],
            "type": "select_stmt",
          },
        ],
        "type": "program",
      }
    `);
  });
});
