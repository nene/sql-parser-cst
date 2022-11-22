import { dialect, test, parseFrom } from "./test_utils";

describe("table_ref", () => {
  it("supports simple table names", () => {
    test("SELECT col FROM my_tbl");
  });

  it("parses simple table name as TableRef", () => {
    expect(parseFrom(`my_table`)).toMatchInlineSnapshot(`
      {
        "table": {
          "name": "my_table",
          "text": "my_table",
          "type": "identifier",
        },
        "type": "table_ref",
      }
    `);
  });

  it("supports qualified table names", () => {
    test("SELECT col FROM schm.tbl");
    test("SELECT col FROM schm /*c1*/./*c2*/ tbl");
  });

  it("parses qualified table name as TableRef", () => {
    expect(parseFrom(`my_schema.my_table`)).toMatchInlineSnapshot(`
      {
        "schema": {
          "name": "my_schema",
          "text": "my_schema",
          "type": "identifier",
        },
        "table": {
          "name": "my_table",
          "text": "my_table",
          "type": "identifier",
        },
        "type": "table_ref",
      }
    `);
  });

  dialect("bigquery", () => {
    it("supports three-part table name: project.dataset.table", () => {
      test("SELECT col FROM my-project.my-dataset.my-table");
    });

    it("parses three-part table name as TableRef", () => {
      expect(parseFrom(`my-project.my-dataset.my-table`)).toMatchInlineSnapshot(`
        {
          "catalog": {
            "name": "my-project",
            "text": "my-project",
            "type": "identifier",
          },
          "schema": {
            "name": "my-dataset",
            "text": "my-dataset",
            "type": "identifier",
          },
          "table": {
            "name": "my-table",
            "text": "my-table",
            "type": "identifier",
          },
          "type": "table_ref",
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
});
