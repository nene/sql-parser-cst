import { dialect, testClause as testClauseWc } from "../test_utils";

describe("select ORDER BY", () => {
  it("supports ORDER BY clause", () => {
    testClauseWc("ORDER BY name");
    testClauseWc("ORDER BY salary - tax");
    testClauseWc("ORDER BY name ASC");
    testClauseWc("ORDER BY age DESC");
    testClauseWc("ORDER BY name DESC , age ASC, salary");
  });

  dialect(["sqlite", "mysql"], () => {
    it("supports ORDER BY with collation", () => {
      testClauseWc("ORDER BY name COLLATE utf8 DESC");
    });
  });

  dialect("sqlite", () => {
    it("supports null handling specifiers", () => {
      testClauseWc("ORDER BY name NULLS FIRST");
      testClauseWc("ORDER BY name DESC NULLS FIRST");
      testClauseWc("ORDER BY name ASC NULLS LAST");
    });
  });

  dialect("mysql", () => {
    it("supports WITH ROLLUP", () => {
      testClauseWc("ORDER BY name, age WITH ROLLUP");
    });
  });
});
