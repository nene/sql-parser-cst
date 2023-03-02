import { testClauseWc } from "../test_utils";

describe("select limiting", () => {
  it("parses basic LIMIT clause", () => {
    testClauseWc("LIMIT 25");
  });

  it("parses LIMIT offset,count clause", () => {
    testClauseWc("LIMIT 100, 25");
  });

  it("parses LIMIT..OFFSET clause", () => {
    testClauseWc("LIMIT 25 OFFSET 100");
  });
});
