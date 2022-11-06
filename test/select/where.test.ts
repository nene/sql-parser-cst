import { testClause } from "../test_utils";

describe("select WHERE", () => {
  it("parses where clause", () => {
    testClause("WHERE age > 10");
    testClause("where true");
    testClause("/*c1*/ WHERE /*c2*/ name = 'Mary'");
  });
});
