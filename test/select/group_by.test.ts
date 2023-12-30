import { dialect, parseClause, testClauseWc } from "../test_utils";

describe("select GROUP BY", () => {
  it("supports GROUP BY with single expression", () => {
    testClauseWc("GROUP BY t.id");
    testClauseWc("Group By t.id");
  });

  it("supports GROUP BY with multiple expressions", () => {
    testClauseWc("GROUP BY id, name, age");
  });

  it("supports GROUP BY with list expression", () => {
    testClauseWc("GROUP BY (id, name), age");
  });

  dialect(["bigquery", "postgresql"], () => {
    it("supports GROUP BY ROLLUP()", () => {
      testClauseWc("GROUP BY ROLLUP ( id, name + age )");
      testClauseWc("GROUP BY ROLLUP ( id, (name, age) )");
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports GROUP BY .. WITH ROLLUP", () => {
      testClauseWc("GROUP BY id, name WITH ROLLUP");
    });
  });

  dialect("postgresql", () => {
    it("supports GROUP BY {ALL | DISTINCT}", () => {
      testClauseWc("GROUP BY ALL id");
      testClauseWc("GROUP BY DISTINCT name, age");
    });

    it("parses GROUP BY DISTINCT", () => {
      expect(parseClause("GROUP BY DISTINCT col")).toMatchInlineSnapshot(`
        {
          "columns": {
            "items": [
              {
                "name": "col",
                "text": "col",
                "type": "identifier",
              },
            ],
            "type": "list_expr",
          },
          "distinctKw": [
            {
              "name": "DISTINCT",
              "text": "DISTINCT",
              "type": "keyword",
            },
            undefined,
          ],
          "groupByKw": [
            {
              "name": "GROUP",
              "text": "GROUP",
              "type": "keyword",
            },
            {
              "name": "BY",
              "text": "BY",
              "type": "keyword",
            },
          ],
          "type": "group_by_clause",
          "withRollupKw": undefined,
        }
      `);
    });
  });
});
