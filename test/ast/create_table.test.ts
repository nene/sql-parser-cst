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
});
