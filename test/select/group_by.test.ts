import { testClause } from "../test_utils";

describe("select GROUP BY", () => {
  it("parses group by with single expression", () => {
    testClause("GROUP BY t.id");
    testClause("/*c0*/ Group /*c1*/ By /*c2*/ t.id");
  });

  it("parses group by with multiple expressions", () => {
    testClause("GROUP BY id, name, age");
    testClause("GROUP BY /*c1*/ id /*c2*/, /*c3*/ name");
  });
});
