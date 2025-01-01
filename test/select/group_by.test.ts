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
    it("supports GROUP BY empty list", () => {
      testClauseWc("GROUP BY ()");
      testClauseWc("GROUP BY foo, (), bar, ()");
    });
  });

  dialect(["bigquery"], () => {
    it("supports GROUP BY ALL", () => {
      testClauseWc("GROUP BY ALL");
    });
  });

  dialect(["bigquery", "postgresql"], () => {
    it("supports GROUP BY ROLLUP()", () => {
      testClauseWc("GROUP BY ROLLUP ( id, name + age )");
      testClauseWc("GROUP BY ROLLUP ( id, (name, age) )");
    });

    it("supports GROUP BY CUBE()", () => {
      testClauseWc("GROUP BY CUBE (id, name + age)");
      testClauseWc("GROUP BY CUBE (id, (name, age))");
    });

    it("supports multiple ROLLUPs and CUBEs in one GROUP BY", () => {
      testClauseWc("GROUP BY ROLLUP(id), CUBE(name)");
    });

    it("parses multiple ROLLUPs & CUBEs as group_by_rollup/cube nodes", () => {
      const clause = parseClause("GROUP BY ROLLUP(id), CUBE(name)");
      if (clause.type !== "group_by_clause") {
        throw new Error("Expected group_by_clause");
      }
      expect(clause.columns.items[0].type).toBe("group_by_rollup");
      expect(clause.columns.items[1].type).toBe("group_by_cube");
    });
  });

  dialect(["bigquery", "postgresql"], () => {
    it("supports GROUPING SETS", () => {
      testClauseWc("GROUP BY GROUPING SETS ( (id, name), age )");
    });

    it("supports multiple GROUPING SETS", () => {
      testClauseWc("GROUP BY GROUPING SETS (id), GROUPING SETS (name)");
    });

    it("supports ROLLUP & CUBE inside GROUPING SETS", () => {
      testClauseWc("GROUP BY GROUPING SETS ( ROLLUP(id), CUBE(age) )");
    });

    it("supports GROUPING SETS inside GROUPING SETS", () => {
      testClauseWc("GROUP BY GROUPING SETS ( GROUPING SETS (foo, bar), GROUPING SETS (age) )");
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
          "distinctKw": {
            "name": "DISTINCT",
            "text": "DISTINCT",
            "type": "keyword",
          },
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
