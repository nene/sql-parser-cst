import { testClause, testClauseWc } from "../test_utils";

describe("select WINDOW", () => {
  it("supports named window definition", () => {
    testClauseWc("WINDOW my_win AS ( ORDER BY col1 )");
  });

  it("supports multiple named window definitions", () => {
    testClause("WINDOW win1 AS (basewin1), win2 AS (basewin2)");
  });
});
