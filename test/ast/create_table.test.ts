import { createParseSpecificStmt } from "./ast_test_utils";
import { dialect } from "../test_utils";

describe("create table", () => {
  const parseAstCreateTable = createParseSpecificStmt("create_table_stmt");

  it("parses basic CREATE TABLE", () => {
    expect(parseAstCreateTable(`CREATE TABLE my_table (id INT)`)).toMatchInlineSnapshot(`
      {
        "columns": [
          {
            "dataType": {
              "name": "int",
              "type": "data_type",
            },
            "name": {
              "name": "id",
              "type": "identifier",
            },
            "type": "column_definition",
          },
        ],
        "name": {
          "name": "my_table",
          "type": "identifier",
        },
        "type": "create_table_stmt",
      }
    `);
  });

  it("parses IF NOT EXISTS", () => {
    expect(parseAstCreateTable(`CREATE TABLE IF NOT EXISTS my_table (id INT)`).ifNotExists).toBe(
      true
    );
  });

  it("parses TEMPORARY table", () => {
    expect(parseAstCreateTable(`CREATE TEMPORARY TABLE my_table (id INT)`).temporary).toBe(true);
  });

  dialect(["bigquery"], () => {
    it("parses OR REPLACE", () => {
      expect(parseAstCreateTable(`CREATE OR REPLACE TABLE my_table (id INT)`).orReplace).toBe(true);
    });

    it("parses EXTERNAL table", () => {
      expect(parseAstCreateTable(`CREATE EXTERNAL TABLE my_table (id INT)`).external).toBe(true);
    });

    it("parses SNAPSHOT table", () => {
      expect(parseAstCreateTable(`CREATE SNAPSHOT TABLE my_table (id INT)`).snapshot).toBe(true);
    });
  });

  dialect(["sqlite", "mysql"], () => {
    it("parses table constraints", () => {
      expect(
        parseAstCreateTable(`
          CREATE TABLE foo (
            id INT,
            PRIMARY KEY (id),
            UNIQUE (id),
            CHECK (id > 0),
            FOREIGN KEY (usr_id) REFERENCES users (id)
          )`).columns
      ).toMatchInlineSnapshot(`
        [
          {
            "dataType": {
              "name": "int",
              "type": "data_type",
            },
            "name": {
              "name": "id",
              "type": "identifier",
            },
            "type": "column_definition",
          },
          {
            "columns": [
              {
                "name": "id",
                "type": "identifier",
              },
            ],
            "type": "constraint_primary_key",
          },
          {
            "columns": [
              {
                "name": "id",
                "type": "identifier",
              },
            ],
            "type": "constraint_unique",
          },
          {
            "expr": {
              "left": {
                "name": "id",
                "type": "identifier",
              },
              "operator": ">",
              "right": {
                "type": "number_literal",
                "value": 0,
              },
              "type": "binary_expr",
            },
            "type": "constraint_check",
          },
          {
            "columns": [
              {
                "name": "usr_id",
                "type": "identifier",
              },
            ],
            "references": {
              "columns": [
                {
                  "name": "id",
                  "type": "identifier",
                },
              ],
              "options": [],
              "table": {
                "name": "users",
                "type": "identifier",
              },
              "type": "references_specification",
            },
            "type": "constraint_foreign_key",
          },
        ]
      `);
    });

    it("parses named table constraint", () => {
      expect(
        parseAstCreateTable(`
          CREATE TABLE foo (
            CONSTRAINT prim_key PRIMARY KEY (id)
          )`).columns
      ).toMatchInlineSnapshot(`
        [
          {
            "constraint": {
              "columns": [
                {
                  "name": "id",
                  "type": "identifier",
                },
              ],
              "type": "constraint_primary_key",
            },
            "name": {
              "name": "prim_key",
              "type": "identifier",
            },
            "type": "constraint",
          },
        ]
      `);
    });
  });

  dialect("sqlite", () => {
    it("parses PRIMARY KEY with ON CONFLICT", () => {
      expect(
        parseAstCreateTable(`
          CREATE TABLE foo (
            PRIMARY KEY (id) ON CONFLICT ROLLBACK
          )`).columns
      ).toMatchInlineSnapshot(`
        [
          {
            "columns": [
              {
                "name": "id",
                "type": "identifier",
              },
            ],
            "onConflict": "rollback",
            "type": "constraint_primary_key",
          },
        ]
      `);
    });
  });

  dialect("sqlite", () => {
    it("parses FOREIGN KEY with ON DELETE CASCADE & MATCH FULL", () => {
      expect(
        parseAstCreateTable(`
          CREATE TABLE tbl (
            FOREIGN KEY (id) REFERENCES foo (id) ON DELETE CASCADE MATCH FULL
          )`).columns
      ).toMatchInlineSnapshot(`
        [
          {
            "columns": [
              {
                "name": "id",
                "type": "identifier",
              },
            ],
            "references": {
              "columns": [
                {
                  "name": "id",
                  "type": "identifier",
                },
              ],
              "options": [
                {
                  "action": "cascade",
                  "event": "delete",
                  "type": "referential_action",
                },
                {
                  "matchType": "full",
                  "type": "referential_match",
                },
              ],
              "table": {
                "name": "foo",
                "type": "identifier",
              },
              "type": "references_specification",
            },
            "type": "constraint_foreign_key",
          },
        ]
      `);
    });
  });

  dialect("mysql", () => {
    it("parses INDEX constraint", () => {
      expect(
        parseAstCreateTable(`
          CREATE TABLE foo (
            INDEX (id)
          )`).columns
      ).toMatchInlineSnapshot(`
        [
          {
            "columns": [
              {
                "name": "id",
                "type": "identifier",
              },
            ],
            "type": "constraint_index",
          },
        ]
      `);
    });
  });
});
