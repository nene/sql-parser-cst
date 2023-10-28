import { dialect, parseStmt, testWc } from "../test_utils";

describe("rename table", () => {
  dialect(["mysql", "mariadb"], () => {
    it("supports RENAME TABLE statement", () => {
      testWc("RENAME TABLE foo TO bar");
      testWc("RENAME TABLE schm1.foo TO schm2.foo");
    });

    it("supports RENAME TABLE for multiple tables", () => {
      testWc("RENAME TABLE foo TO bar, zip TO zap");
    });

    it("parses RenameTableStmt", () => {
      expect(parseStmt("RENAME TABLE foo TO bar")).toMatchInlineSnapshot(`
        {
          "actions": {
            "items": [
              {
                "from": {
                  "name": "foo",
                  "text": "foo",
                  "type": "identifier",
                },
                "to": {
                  "name": "bar",
                  "text": "bar",
                  "type": "identifier",
                },
                "toKw": {
                  "name": "TO",
                  "text": "TO",
                  "type": "keyword",
                },
                "type": "rename_action",
              },
            ],
            "type": "list_expr",
          },
          "renameKw": {
            "name": "RENAME",
            "text": "RENAME",
            "type": "keyword",
          },
          "tableKw": {
            "name": "TABLE",
            "text": "TABLE",
            "type": "keyword",
          },
          "type": "rename_table_stmt",
        }
      `);
    });
  });

  dialect(["bigquery", "sqlite"], () => {
    it("does not support RENAME TABLE", () => {
      expect(() => parseStmt("RENAME TABLE foo TO bar")).toThrowError();
    });
  });

  dialect("postgresql", () => {
    it.skip("TODO:postgres", () => {
      expect(true).toBe(true);
    });
  });
});
