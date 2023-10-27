import { dialect, parseStmt, testWc } from "../test_utils";

describe("table", () => {
  dialect(["mysql", "mariadb"], () => {
    it("supports TABLE statement", () => {
      testWc("TABLE my_tbl");
    });

    it("supports ORDER BY & LIMIT clauses", () => {
      testWc("TABLE my_tbl ORDER BY col1 LIMIT 8");
    });

    it("supports UNION of TABLE statements", () => {
      testWc("TABLE foo UNION TABLE bar");
    });

    it("supports INSERT ... TABLE", () => {
      testWc("INSERT INTO foo TABLE bar");
    });

    it("parses TABLE statement as select_stmt with table_clause", () => {
      expect(parseStmt("TABLE foo")).toMatchInlineSnapshot(`
        {
          "clauses": [
            {
              "table": {
                "name": "foo",
                "text": "foo",
                "type": "identifier",
              },
              "tableKw": {
                "name": "TABLE",
                "text": "TABLE",
                "type": "keyword",
              },
              "type": "table_clause",
            },
          ],
          "type": "select_stmt",
        }
      `);
    });
  });

  dialect(["sqlite", "bigquery"], () => {
    it("does not support TABLE statement", () => {
      expect(() => parseStmt("TABLE foo")).toThrowError();
    });
  });

  dialect("postgresql", () => {
    it("TODO:postgres", () => {
      expect(true).toBe(true);
    });
  });
});
