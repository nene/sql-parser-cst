import { testClauseWc } from "../test_utils";

describe("select WHERE", () => {
  it("parses where clause", () => {
    testClauseWc("WHERE age > 10");
    testClauseWc("where true");
  });
});
