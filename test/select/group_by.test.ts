import { dialect, testClauseWc } from "../test_utils";

describe("select GROUP BY", () => {
  it("parses group by with single expression", () => {
    testClauseWc("GROUP BY t.id");
    testClauseWc("Group By t.id");
  });

  it("parses group by with multiple expressions", () => {
    testClauseWc("GROUP BY id, name, age");
  });

  dialect("bigquery", () => {
    it("supports GROUP BY ROLLUP()", () => {
      testClauseWc("GROUP BY ROLLUP ( id, name + age )");
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports GROUP BY .. WITH ROLLUP", () => {
      testClauseWc("GROUP BY id, name WITH ROLLUP");
    });
  });
});
