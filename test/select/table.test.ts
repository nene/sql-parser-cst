import { dialect, parseStmt, testWc } from "../test_utils";

describe("table", () => {
  dialect(["mysql", "mariadb", "postgresql"], () => {
    it("supports TABLE statement", () => {
      testWc("TABLE my_tbl");
    });

    it("supports TABLE with namespaced table", () => {
      testWc("TABLE my_schema.my_tbl");
    });

    it("supports WITH ... TABLE", () => {
      testWc("WITH p AS (TABLE person) TABLE p");
    });

    it("supports ORDER BY & LIMIT clauses", () => {
      testWc("TABLE my_tbl ORDER BY col1 LIMIT 8");
    });

    dialect("postgresql", () => {
      it("supports TABLE ONLY name", () => {
        testWc("TABLE ONLY my_tbl");
      });

      it("supports TABLE name *", () => {
        testWc("TABLE my_tbl *");
      });

      it("supports OFFSET & FETCH clauses", () => {
        testWc("TABLE my_tbl OFFSET 100 FETCH FIRST 25 ROWS ONLY");
      });

      it("supports FOR clause", () => {
        testWc("TABLE my_tbl FOR UPDATE");
      });
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
});
