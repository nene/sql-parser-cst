// import { UpdateStmt } from "../../src/ast/Node";
import { parseAstStmt } from "./ast_test_utils";

describe("update", () => {
  function parseAstUpdate(sql: string) {
    const stmt = parseAstStmt(sql);
    if (stmt.type !== "update_stmt") {
      throw new Error(`Expected UpdateStmt, instead got ${stmt.type}`);
    }
    return stmt;
  }

  it("parses basic UPDATE", () => {
    expect(parseAstUpdate(`UPDATE tbl SET x = 1, y = 2 WHERE true`)).toMatchInlineSnapshot(`
      {
        "assignments": [
          {
            "column": {
              "name": "x",
              "type": "identifier",
            },
            "expr": {
              "type": "number_literal",
              "value": 1,
            },
            "type": "column_assignment",
          },
          {
            "column": {
              "name": "y",
              "type": "identifier",
            },
            "expr": {
              "type": "number_literal",
              "value": 2,
            },
            "type": "column_assignment",
          },
        ],
        "tables": [
          {
            "name": "tbl",
            "type": "identifier",
          },
        ],
        "type": "update_stmt",
        "where": {
          "type": "boolean_literal",
          "value": true,
        },
      }
    `);
  });

  it("parses UPDATE OR ABORT", () => {
    expect(parseAstUpdate(`UPDATE OR ABORT tbl SET x=1`).orAction).toBe("abort");
  });
});
