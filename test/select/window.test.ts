import { testClause } from "../test_utils";

describe("select WINDOW", () => {
  it("supports named window definition", () => {
    testClause("WINDOW my_win AS (ORDER BY col1)");
    testClause("WINDOW /*c1*/ my_win /*c2*/ AS /*c3*/ (/*c4*/ ORDER /*c5*/ BY /*c6*/ col1 /*c7*/)");
  });

  it("supports multiple named window definitions", () => {
    testClause("WINDOW win1 AS (basewin1), win2 AS (basewin2)");
  });
});
