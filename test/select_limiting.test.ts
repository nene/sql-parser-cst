import { testClause } from "./test_utils";

describe("select limiting", () => {
  it("parses basic LIMIT clause", () => {
    testClause("LIMIT 25");
    testClause("LIMIT /*c*/ 25");
  });

  it("parses LIMIT offset,count clause", () => {
    testClause("LIMIT 100, 25");
    testClause("LIMIT /*c1*/ 100 /*c2*/ , /*c3*/ 25");
  });

  it("parses LIMIT..OFFSET clause", () => {
    testClause("LIMIT 25 OFFSET 100");
    testClause("LIMIT /*c1*/ 25 /*c2*/ OFFSET /*c3*/ 100");
  });
});
