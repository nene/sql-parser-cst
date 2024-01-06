import { dialect, parseClause, testClause as testClauseWc } from "../test_utils";

describe("select ORDER BY", () => {
  it("supports ORDER BY clause", () => {
    testClauseWc("ORDER BY name");
    testClauseWc("ORDER BY salary - tax");
    testClauseWc("ORDER BY name ASC");
    testClauseWc("ORDER BY age DESC");
    testClauseWc("ORDER BY name DESC , age ASC, salary");
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("supports ORDER BY with collation", () => {
      testClauseWc("ORDER BY name COLLATE utf8 DESC");
    });
  });

  dialect(["sqlite", "postgresql"], () => {
    it("supports null handling specifiers", () => {
      testClauseWc("ORDER BY name NULLS FIRST");
      testClauseWc("ORDER BY name DESC NULLS FIRST");
      testClauseWc("ORDER BY name ASC NULLS LAST");
    });
  });

  dialect(["mysql"], () => {
    it("supports WITH ROLLUP", () => {
      testClauseWc("ORDER BY name, age WITH ROLLUP");
    });
  });

  dialect("postgresql", () => {
    it("supports USING operator", () => {
      testClauseWc("ORDER BY name USING >, age USING <");
    });

    it("supports USING OPERATOR()", () => {
      testClauseWc("ORDER BY name USING OPERATOR(>>)");
    });
  });

  it("parses ORDER BY clause", () => {
    expect(parseClause("ORDER BY col1 DESC")).toMatchInlineSnapshot(`
      {
        "orderByKw": [
          {
            "name": "ORDER",
            "text": "ORDER",
            "type": "keyword",
          },
          {
            "name": "BY",
            "text": "BY",
            "type": "keyword",
          },
        ],
        "specifications": {
          "items": [
            {
              "direction": {
                "descKw": {
                  "name": "DESC",
                  "text": "DESC",
                  "type": "keyword",
                },
                "type": "sort_direction_desc",
              },
              "expr": {
                "name": "col1",
                "text": "col1",
                "type": "identifier",
              },
              "type": "sort_specification",
            },
          ],
          "type": "list_expr",
        },
        "type": "order_by_clause",
        "withRollupKw": undefined,
      }
    `);
  });
});
