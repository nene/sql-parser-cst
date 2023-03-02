import { testClauseWc } from "../test_utils";

describe("select HAVING", () => {
  it("parses having clause", () => {
    testClauseWc("WHERE true GROUP BY col HAVING x > 3");
    testClauseWc("Having x = 81");
  });
});
