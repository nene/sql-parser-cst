import { dialect, parseStmt, testWc } from "../test_utils";

describe("drop table", () => {
  it("simple DROP TABLE statement", () => {
    testWc("DROP TABLE my_tbl");
  });

  it("with qualified table name", () => {
    testWc("DROP TABLE db.my_tbl");
  });

  it("with IF EXISTS condition", () => {
    testWc("DROP TABLE IF EXISTS my_tbl");
  });

  dialect(["mysql", "mariadb"], () => {
    it("with TEMPORARY table", () => {
      testWc("DROP TEMPORARY TABLE my_tbl");
    });
  });

  dialect("bigquery", () => {
    it("with SNAPSHOT table", () => {
      testWc("DROP SNAPSHOT TABLE my_tbl");
    });

    it("with EXTERNAL table", () => {
      testWc("DROP EXTERNAL TABLE my_tbl");
    });
  });

  it("with multiple tables", () => {
    testWc("DROP TABLE tbl1, tbl2, tbl3");
  });

  dialect(["mysql", "mariadb"], () => {
    it("with CASCADE/RESTRICT behavior", () => {
      testWc("DROP TABLE tbl CASCADE");
      testWc("DROP TABLE tbl RESTRICT");
    });
  });

  it("parses to syntax tree", () => {
    expect(parseStmt("DROP TABLE my_table")).toMatchInlineSnapshot(`
      {
        "behaviorKw": undefined,
        "dropKw": {
          "name": "DROP",
          "text": "DROP",
          "type": "keyword",
        },
        "externalKw": undefined,
        "ifExistsKw": undefined,
        "snapshotKw": undefined,
        "tableKw": {
          "name": "TABLE",
          "text": "TABLE",
          "type": "keyword",
        },
        "tables": {
          "items": [
            {
              "name": "my_table",
              "text": "my_table",
              "type": "identifier",
            },
          ],
          "type": "list_expr",
        },
        "temporaryKw": undefined,
        "type": "drop_table_stmt",
      }
    `);
  });
});
