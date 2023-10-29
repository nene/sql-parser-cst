import { dialect, parseStmt, testWc } from "../test_utils";

describe("insert into", () => {
  it("supports INSERT INTO with values", () => {
    testWc("INSERT INTO tbl VALUES (1, 2, 3)");
    testWc("INSERT INTO db.tbl VALUES (1, 2, 3)");
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    // The REPLACE syntax is otherwise exactly the same as INSERT
    it("supports REPLACE INTO", () => {
      testWc("REPLACE INTO tbl VALUES (1, 2, 3)");
    });
  });

  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("supports INSERT without INTO", () => {
      testWc("INSERT tbl VALUES (1, 2, 3)");
    });
  });
  dialect(["mysql", "mariadb"], () => {
    it("supports REPLACE without INTO", () => {
      testWc("REPLACE tbl VALUES (1, 2, 3)");
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports VALUE instead of VALUES", () => {
      testWc("INSERT INTO tbl VALUE (1, 2, 3)");
    });
  });

  dialect("sqlite", () => {
    it("supports INSERT with aliased table", () => {
      testWc("INSERT INTO tbl AS t VALUES (1, 2, 3)");
    });
  });

  it("supports INSERT INTO with columns and values", () => {
    testWc("INSERT INTO tbl (col1, col2, col3) VALUES (1, 2, 3)");
  });

  it("supports multiple values", () => {
    testWc("INSERT INTO tbl VALUES (1, 2, 3), (4, 5, 6), (7, 8, 9)");
  });

  it("supports insert from query", () => {
    testWc("INSERT INTO tbl SELECT 1, 2, 3");
    testWc("INSERT INTO tbl (col1, col2, col3) SELECT 1, 2, 3");
    testWc("INSERT INTO tbl (SELECT 1, 2, 3)");
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("supports insert of default values", () => {
      testWc("INSERT INTO tbl DEFAULT VALUES");
    });
  });

  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("supports explicit default values for columns", () => {
      testWc("INSERT INTO tbl VALUES (1, DEFAULT, 3)");
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports inserting row constructor", () => {
      testWc("INSERT INTO tbl VALUES ROW (1, DEFAULT), ROW (2, DEFAULT)");
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports hints", () => {
      testWc("INSERT LOW_PRIORITY INTO tbl VALUES (1)");
      testWc("INSERT DELAYED INTO tbl VALUES (1)");
      testWc("INSERT HIGH_PRIORITY INTO tbl VALUES (1)");
      testWc("INSERT IGNORE INTO tbl VALUES (1)");
      testWc("INSERT LOW_PRIORITY IGNORE INTO tbl VALUES (1)");
    });
  });

  dialect("sqlite", () => {
    it("supports INSERT OR ... options", () => {
      testWc("INSERT OR ABORT INTO tbl VALUES (1)");
      testWc("INSERT OR FAIL INTO tbl VALUES (1)");
      testWc("INSERT OR IGNORE INTO tbl VALUES (1)");
      testWc("INSERT OR REPLACE INTO tbl VALUES (1)");
      testWc("INSERT OR ROLLBACK INTO tbl VALUES (1)");
    });
  });

  dialect(["sqlite", "postgresql"], () => {
    it("supports WITH ... INSERT ...", () => {
      testWc("WITH subsel AS (SELECT 1) INSERT INTO tbl VALUES (1)");
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports SET clause", () => {
      testWc("INSERT INTO tbl SET id = 1, age = 28, priority = DEFAULT");
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports PARTITION clause", () => {
      testWc("INSERT INTO tbl PARTITION (foo, bar) (col1, col2) VALUES (1, 2)");
    });
  });

  dialect("sqlite", () => {
    describe("upsert clause", () => {
      it("supports ON CONFLICT DO NOTHING", () => {
        testWc("INSERT INTO tbl VALUES (1) ON CONFLICT DO NOTHING");
      });

      it("supports ON CONFLICT DO UPDATE SET col=expr", () => {
        testWc("INSERT INTO tbl VALUES (1) ON CONFLICT DO UPDATE SET col1=1, col2=2");
      });

      it("supports ON CONFLICT DO UPDATE SET col=expr WHERE", () => {
        testWc("INSERT INTO tbl VALUES (1) ON CONFLICT DO UPDATE SET col1=1 WHERE x>0");
      });

      it("supports ON CONFLICT (column)", () => {
        testWc("INSERT INTO tbl VALUES (1) ON CONFLICT (col1, col2) DO NOTHING");
      });

      it("supports ON CONFLICT (column) WHERE expr", () => {
        testWc("INSERT INTO tbl VALUES (1) ON CONFLICT (col1) WHERE x=0 DO NOTHING");
      });

      it("supports ON CONFLICT (expr)", () => {
        testWc("INSERT INTO tbl VALUES (1) ON CONFLICT (col1 COLLATE utf8) DO NOTHING");
      });

      it("supports ON CONFLICT (column ASC/DESC)", () => {
        testWc("INSERT INTO tbl VALUES (1) ON CONFLICT (col1 ASC, col2 DESC) DO NOTHING");
      });

      it("supports multiple upsert clauses", () => {
        testWc(
          "INSERT INTO tbl VALUES (1) ON CONFLICT (col1) DO NOTHING ON CONFLICT (col2) DO UPDATE SET col2=0"
        );
      });
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports ON DUPLICATE KEY UPDATE", () => {
      testWc("INSERT INTO tbl (col1) VALUES (1) ON DUPLICATE KEY UPDATE col1 = 2, col2 = DEFAULT");
    });

    // deprecated since MySQL 8.0.20
    it("supports VALUES() function in ON DUPLICATE KEY UPDATE", () => {
      testWc("INSERT INTO tbl (x) VALUES (1) ON DUPLICATE KEY UPDATE x = VALUES(x) + 1");
    });

    it("supports row alias", () => {
      testWc(`
        INSERT INTO tbl (x) VALUES (1) AS new
        ON DUPLICATE KEY UPDATE x = new.x + 1
      `);
    });

    it("supports columns aliases", () => {
      testWc(`
        INSERT INTO tbl (x, y) VALUES (1) AS new_row (id, fname)
        ON DUPLICATE KEY UPDATE x = new_row.id + 1, y = ''
      `);
    });
  });

  dialect(["sqlite", "mariadb"], () => {
    it("supports INSERT ... RETURNING ...", () => {
      testWc("INSERT INTO tbl (col) VALUES (1) RETURNING col");
    });
  });

  it("parses INSERT to syntax tree", () => {
    expect(parseStmt("INSERT INTO tbl (col1, col2) VALUES (1, 2), (3, 4)")).toMatchInlineSnapshot(`
      {
        "clauses": [
          {
            "hints": [],
            "insertKw": {
              "name": "INSERT",
              "text": "INSERT",
              "type": "keyword",
            },
            "intoKw": {
              "name": "INTO",
              "text": "INTO",
              "type": "keyword",
            },
            "orAction": undefined,
            "table": {
              "name": "tbl",
              "text": "tbl",
              "type": "identifier",
            },
            "type": "insert_clause",
          },
          {
            "columns": {
              "expr": {
                "items": [
                  {
                    "name": "col1",
                    "text": "col1",
                    "type": "identifier",
                  },
                  {
                    "name": "col2",
                    "text": "col2",
                    "type": "identifier",
                  },
                ],
                "type": "list_expr",
              },
              "type": "paren_expr",
            },
            "type": "insert_columns_clause",
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
                        "type": "number_literal",
                        "value": 1,
                      },
                      {
                        "text": "2",
                        "type": "number_literal",
                        "value": 2,
                      },
                    ],
                    "type": "list_expr",
                  },
                  "type": "paren_expr",
                },
                {
                  "expr": {
                    "items": [
                      {
                        "text": "3",
                        "type": "number_literal",
                        "value": 3,
                      },
                      {
                        "text": "4",
                        "type": "number_literal",
                        "value": 4,
                      },
                    ],
                    "type": "list_expr",
                  },
                  "type": "paren_expr",
                },
              ],
              "type": "list_expr",
            },
            "valuesKw": {
              "name": "VALUES",
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
