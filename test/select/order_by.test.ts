import { dialect, testClause } from "../test_utils";

describe("select ORDER BY", () => {
  it("supports ORDER BY clause", () => {
    testClause("ORDER BY name");
    testClause("ORDER BY salary - tax");
    testClause("ORDER BY name ASC");
    testClause("ORDER BY age DESC");
    testClause("ORDER BY name DESC, age ASC, salary");
    testClause("/*c0*/ Order /*c1*/ By /*c2*/ age /*c3*/ ASC /*c4*/, /*c5*/ name");
  });

  it("supports ORDER BY with collation", () => {
    testClause("ORDER BY name COLLATE utf8 DESC");
  });

  dialect("sqlite", () => {
    it("supports null handling specifiers", () => {
      testClause("ORDER BY name NULLS FIRST");
      testClause("ORDER BY name DESC NULLS FIRST");
      testClause("ORDER BY name ASC NULLS LAST");
      testClause("ORDER BY name ASC /*c1*/ NULLS /*c2*/ LAST");
    });
  });

  dialect("mysql", () => {
    it("supports WITH ROLLUP", () => {
      testClause("ORDER BY name, age WITH ROLLUP");
      testClause("ORDER BY name /*c1*/ WITH /*c2*/ ROLLUP");
    });
  });
});
