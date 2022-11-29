import { dialect, test, parseFrom, parseExpr } from "./test_utils";

describe("table names", () => {
  it("supports simple table names", () => {
    test("SELECT col FROM my_tbl");
  });

  it("parses simple table name as MemberExpr", () => {
    expect(parseFrom(`my_table`)).toMatchInlineSnapshot(`
      {
        "name": "my_table",
        "text": "my_table",
        "type": "identifier",
      }
    `);
  });

  it("supports qualified table names", () => {
    test("SELECT col FROM schm.tbl");
    test("SELECT col FROM schm /*c1*/./*c2*/ tbl");
  });

  it("parses qualified table name as MemberExpr", () => {
    expect(parseFrom(`my_schema.my_table`)).toMatchInlineSnapshot(`
      {
        "object": {
          "name": "my_schema",
          "text": "my_schema",
          "type": "identifier",
        },
        "property": {
          "name": "my_table",
          "text": "my_table",
          "type": "identifier",
        },
        "type": "member_expr",
      }
    `);
  });

  dialect("bigquery", () => {
    it("supports three-part table name: project.dataset.table", () => {
      test("SELECT col FROM my-project.my-dataset.my-table");
    });

    it("parses three-part table name as MemberExpr", () => {
      expect(parseFrom(`my-project.my-dataset.my-table`)).toMatchInlineSnapshot(`
        {
          "object": {
            "object": {
              "name": "my-project",
              "text": "my-project",
              "type": "identifier",
            },
            "property": {
              "name": "my-dataset",
              "text": "my-dataset",
              "type": "identifier",
            },
            "type": "member_expr",
          },
          "property": {
            "name": "my-table",
            "text": "my-table",
            "type": "identifier",
          },
          "type": "member_expr",
        }
      `);
    });
  });

  dialect("sqlite", () => {
    it("supports quoted qualified table name", () => {
      test(`SELECT col FROM "my db"."my tbl"`);
      test("SELECT col FROM `my db`.`my tbl`");
      test("SELECT col FROM [my db].[my tbl]");
    });
  });

  dialect(["mysql", "bigquery"], () => {
    it("supports quoted qualified table name", () => {
      test("SELECT col FROM `my db`.`my tbl`");
    });
  });

  dialect("bigquery", () => {
    describe("quoted table paths", () => {
      it("supports quoted table path", () => {
        test("SELECT * FROM `project.dataset.table`");
        test("SELECT * FROM `my project.some dataset.my table`");
      });

      it("parses table path elements out of quoted table path", () => {
        expect(parseExpr("`project.dataset.table`")).toMatchInlineSnapshot(`
          {
            "expr": {
              "object": {
                "object": {
                  "name": "project",
                  "text": "project",
                  "type": "identifier",
                },
                "property": {
                  "name": "dataset",
                  "text": "dataset",
                  "type": "identifier",
                },
                "type": "member_expr",
              },
              "property": {
                "name": "table",
                "text": "table",
                "type": "identifier",
              },
              "type": "member_expr",
            },
            "type": "bigquery_quoted_member_expr",
          }
        `);
      });

      it("supports partially quoted table path", () => {
        test("SELECT * FROM project.`dataset.table`");
        test("SELECT * FROM `project`.`dataset.table`");
        test("SELECT * FROM `project.dataset`.`table`");
        test("SELECT * FROM `project.dataset`.table");
      });

      it("parses partially quoted table path elements", () => {
        expect(parseExpr("`my project`.`my dataset.my table`")).toMatchInlineSnapshot(`
          {
            "object": {
              "name": "my project",
              "text": "\`my project\`",
              "type": "identifier",
            },
            "property": {
              "expr": {
                "object": {
                  "name": "my dataset",
                  "text": "my dataset",
                  "type": "identifier",
                },
                "property": {
                  "name": "my table",
                  "text": "my table",
                  "type": "identifier",
                },
                "type": "member_expr",
              },
              "type": "bigquery_quoted_member_expr",
            },
            "type": "member_expr",
          }
        `);
      });

      it("supports repeated dots in quoted table path", () => {
        test("SELECT * FROM `project..dataset...table`");
      });

      it("parses repeated dots in quoted table path", () => {
        expect(parseExpr("`dataset...table`")).toMatchInlineSnapshot(`
          {
            "expr": {
              "object": {
                "object": {
                  "object": {
                    "name": "dataset",
                    "text": "dataset",
                    "type": "identifier",
                  },
                  "property": {
                    "type": "empty",
                  },
                  "type": "member_expr",
                },
                "property": {
                  "type": "empty",
                },
                "type": "member_expr",
              },
              "property": {
                "name": "table",
                "text": "table",
                "type": "identifier",
              },
              "type": "member_expr",
            },
            "type": "bigquery_quoted_member_expr",
          }
        `);
      });
    });
  });
});
