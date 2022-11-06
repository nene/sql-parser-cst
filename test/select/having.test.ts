import { testClause } from "../test_utils";

describe("select HAVING", () => {
  it("parses having clause", () => {
    testClause("WHERE true GROUP BY col HAVING x > 3");
    testClause("/*c1*/ Having /*c2*/ x = 81");
  });
});
