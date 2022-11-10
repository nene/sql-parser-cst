import { dialect, parseStmt, test } from "../test_utils";

describe("drop table", () => {
  it("simple DROP TABLE statement", () => {
    test("DROP TABLE my_tbl");
    test("DROP /*c1*/ TABLE /*c2*/ my_tbl");
  });

  it("with qualified table name", () => {
    test("DROP TABLE db.my_tbl");
  });

  it("with IF EXISTS condition", () => {
    test("DROP TABLE IF EXISTS my_tbl");
    test("DROP /*c1*/ TABLE /*c2*/ IF /*c3*/ EXISTS /*c4*/ my_tbl");
  });

  dialect("mysql", () => {
    it("with TEMPORARY table", () => {
      test("DROP TEMPORARY TABLE my_tbl");
      test("DROP /*c1*/ TEMPORARY /*c2*/ TABLE my_tbl");
    });
  });

  it("with multiple tables", () => {
    test("DROP TABLE tbl1, tbl2, tbl3");
    test("DROP TABLE tbl1 /*c1*/,/*c2*/ tbl2");
  });

  dialect("mysql", () => {
    it("with CASCADE/RESTRICT behavior", () => {
      test("DROP TABLE tbl CASCADE");
      test("DROP TABLE tbl RESTRICT");
      test("DROP TABLE /*c1*/ tbl /*c2*/ RESTRICT");
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
        "ifExistsKw": undefined,
        "tableKw": {
          "name": "TABLE",
          "text": "TABLE",
          "type": "keyword",
        },
        "tables": {
          "items": [
            {
              "table": {
                "text": "my_table",
                "type": "identifier",
              },
              "type": "table_ref",
            },
          ],
          "type": "expr_list",
        },
        "temporaryKw": undefined,
        "type": "drop_table_stmt",
      }
    `);
  });
});
