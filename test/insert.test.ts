import { dialect, parseStmt, test } from "./test_utils";

describe("insert into", () => {
  it("supports INSERT INTO with values", () => {
    test("INSERT INTO tbl VALUES (1, 2, 3)");
    test("INSERT INTO db.tbl VALUES (1, 2, 3)");
  });

  dialect(["mysql", "sqlite"], () => {
    // The REPLACE syntax is otherwise exactly the same as INSERT
    it("supports REPLACE INTO", () => {
      test("REPLACE INTO tbl VALUES (1, 2, 3)");
    });
  });

  dialect("mysql", () => {
    it("supports INSERT without INTO", () => {
      test("INSERT tbl VALUES (1, 2, 3)");
    });
    it("supports REPLACE without INTO", () => {
      test("REPLACE tbl VALUES (1, 2, 3)");
    });
  });

  dialect("mysql", () => {
    it("supports VALUE instead of VALUES", () => {
      test("INSERT INTO tbl VALUE (1, 2, 3)");
    });
  });

  it("supports INSERT with aliased table", () => {
    test("INSERT INTO tbl AS t VALUES (1, 2, 3)");
  });

  it("supports INSERT INTO with columns and values", () => {
    test("INSERT INTO tbl (col1, col2, col3) VALUES (1, 2, 3)");
    test(`INSERT /*c1*/ INTO /*c2*/ tbl /*c3*/ (/*c4*/ col1 /*c5*/,/*c6*/ col2 /*c7*/) /*c8*/
          VALUES /*c9*/ (/*c10*/ 1 /*c11*/,/*c12*/ 2 /*c13*/)`);
  });

  it("supports multiple values", () => {
    test("INSERT INTO tbl VALUES (1, 2, 3), (4, 5, 6), (7, 8, 9)");
    test("INSERT INTO tbl VALUES (1) /*c1*/,/*c2*/ (2)");
  });

  it("supports insert from query", () => {
    test("INSERT INTO tbl SELECT 1, 2, 3");
    test("INSERT INTO tbl (col1, col2, col3) SELECT 1, 2, 3");
    test("INSERT INTO tbl (SELECT 1, 2, 3)");
    test("INSERT INTO tbl /*c1*/ SELECT 1");
  });

  it("supports insert of default values", () => {
    test("INSERT INTO tbl DEFAULT VALUES");
    test("INSERT INTO tbl /*c1*/ DEFAULT /*c2*/ VALUES");
  });

  dialect("mysql", () => {
    it("supports explicit default values for columns", () => {
      test("INSERT INTO tbl VALUES (1, DEFAULT, 3)");
    });
  });

  dialect("mysql", () => {
    it("supports inserting row constructor", () => {
      test("INSERT INTO tbl VALUES ROW(1, DEFAULT), ROW(2, DEFAULT)");
    });
  });

  dialect("mysql", () => {
    it("supports priority options", () => {
      test("INSERT LOW_PRIORITY INTO tbl VALUES (1)");
      test("INSERT DELAYED INTO tbl VALUES (1)");
      test("INSERT HIGH_PRIORITY INTO tbl VALUES (1)");
    });
    it("supports IGNORE option", () => {
      test("INSERT IGNORE INTO tbl VALUES (1)");
      test("INSERT LOW_PRIORITY IGNORE INTO tbl VALUES (1)");
      test("INSERT DELAYED IGNORE INTO tbl VALUES (1)");
      test("INSERT HIGH_PRIORITY IGNORE INTO tbl VALUES (1)");
      test("INSERT /*c1*/ LOW_PRIORITY /*c2*/ IGNORE /*c3*/ INTO tbl VALUES (1)");
    });
  });

  dialect("sqlite", () => {
    it("supports INSERT OR ... options", () => {
      test("INSERT OR ABORT INTO tbl VALUES (1)");
      test("INSERT OR FAIL INTO tbl VALUES (1)");
      test("INSERT OR IGNORE INTO tbl VALUES (1)");
      test("INSERT OR REPLACE INTO tbl VALUES (1)");
      test("INSERT OR ROLLBACK INTO tbl VALUES (1)");
      test("INSERT /*c1*/ OR /*c2*/ ABORT /*c3*/ INTO tbl VALUES (1)");
    });
  });

  dialect("sqlite", () => {
    it("supports WITH ... INSERT ...", () => {
      test("WITH subsel AS (SELECT 1) INSERT INTO tbl VALUES (1)");
      test("WITH subsel AS (SELECT 1) /*c*/ INSERT INTO tbl VALUES (1)");
    });
  });

  dialect("sqlite", () => {
    describe("upsert clause", () => {
      it("supports ON CONFLICT DO NOTHING", () => {
        test("INSERT INTO tbl VALUES (1) ON CONFLICT DO NOTHING");
      });

      it("supports ON CONFLICT DO UPDATE SET col=expr", () => {
        test("INSERT INTO tbl VALUES (1) ON CONFLICT DO UPDATE SET col1=1, col2=2");
      });

      it("supports ON CONFLICT DO UPDATE SET col=expr WHERE", () => {
        test("INSERT INTO tbl VALUES (1) ON CONFLICT DO UPDATE SET col1=1 WHERE x>0");
      });

      it("supports ON CONFLICT (column)", () => {
        test("INSERT INTO tbl VALUES (1) ON CONFLICT (col1, col2) DO NOTHING");
      });

      it("supports ON CONFLICT (column) WHERE expr", () => {
        test("INSERT INTO tbl VALUES (1) ON CONFLICT (col1) WHERE x=0 DO NOTHING");
      });

      it("supports ON CONFLICT (expr)", () => {
        test("INSERT INTO tbl VALUES (1) ON CONFLICT (col1 COLLATE utf8) DO NOTHING");
      });

      it("supports ON CONFLICT (column ASC/DESC)", () => {
        test("INSERT INTO tbl VALUES (1) ON CONFLICT (col1 ASC, col2 DESC) DO NOTHING");
      });

      it("supports multiple upsert clauses", () => {
        test(
          "INSERT INTO tbl VALUES (1) ON CONFLICT (col1) DO NOTHING ON CONFLICT (col2) DO UPDATE SET col2=0"
        );
      });
    });
  });

  dialect("sqlite", () => {
    it("supports INSERT ... RETURNING ...", () => {
      test("INSERT INTO tbl (col) VALUES (1) RETURNING col");
      test("INSERT INTO tbl (col) VALUES (1) /*c1*/ RETURNING /*c2*/ *");
    });
  });

  it("parses INSERT to syntax tree", () => {
    expect(parseStmt("INSERT INTO tbl (col1, col2) VALUES (1, 2), (3, 4)")).toMatchInlineSnapshot(`
      {
        "clauses": [
          {
            "columns": {
              "expr": {
                "items": [
                  {
                    "column": {
                      "text": "col1",
                      "type": "identifier",
                    },
                    "type": "column_ref",
                  },
                  {
                    "column": {
                      "text": "col2",
                      "type": "identifier",
                    },
                    "type": "column_ref",
                  },
                ],
                "type": "expr_list",
              },
              "type": "paren_expr",
            },
            "insertKw": {
              "text": "INSERT",
              "type": "keyword",
            },
            "intoKw": {
              "text": "INTO",
              "type": "keyword",
            },
            "options": [],
            "orAction": undefined,
            "table": {
              "table": {
                "text": "tbl",
                "type": "identifier",
              },
              "type": "table_ref",
            },
            "type": "insert_clause",
          },
          {
            "type": "values_clause",
            "values": {
              "items": [
                {
                  "expr": {
                    "items": [
                      {
                        "text": "1",
                        "type": "number",
                      },
                      {
                        "text": "2",
                        "type": "number",
                      },
                    ],
                    "type": "expr_list",
                  },
                  "type": "paren_expr",
                },
                {
                  "expr": {
                    "items": [
                      {
                        "text": "3",
                        "type": "number",
                      },
                      {
                        "text": "4",
                        "type": "number",
                      },
                    ],
                    "type": "expr_list",
                  },
                  "type": "paren_expr",
                },
              ],
              "type": "expr_list",
            },
            "valuesKw": {
              "text": "VALUES",
              "type": "keyword",
            },
          },
        ],
        "type": "insert_stmt",
      }
    `);
  });
});
