import { showCompoundPrecedence, test, testWc } from "../test_utils";

describe("compound select", () => {
  it("parses UNION [ALL|DISTINCT]", () => {
    testWc("SELECT 1 UNION SELECT 2");
    testWc("SELECT 1 UNION ALL SELECT 2");
    testWc("SELECT 1 UNION DISTINCT SELECT 2");
  });

  it("parses EXCEPT [ALL|DISTINCT]", () => {
    testWc("SELECT 1 EXCEPT SELECT 2");
    testWc("SELECT 1 EXCEPT ALL SELECT 2");
    testWc("SELECT 1 EXCEPT DISTINCT SELECT 2");
  });

  it("parses INTERSECT [ALL|DISTINCT]", () => {
    testWc("SELECT 1 INTERSECT SELECT 2");
    testWc("SELECT 1 INTERSECT ALL SELECT 2");
    testWc("SELECT 1 INTERSECT DISTINCT SELECT 2");
  });

  it("supports parenthesis around sub-selects", () => {
    test("(SELECT 1) UNION (SELECT 2)");
    test("((SELECT 1)) UNION ((SELECT 2))");
    test("((SELECT 1) UNION (SELECT 2))");
  });

  it("treats UNION and EXCEPT as left-associative operators on same precedence level", () => {
    expect(showCompoundPrecedence(`SELECT 1 UNION SELECT 2 EXCEPT SELECT 3 UNION SELECT 4`)).toBe(
      `(((SELECT 1 UNION SELECT 2) EXCEPT SELECT 3) UNION SELECT 4)`
    );
  });

  it("INTERSECT has higher precedence than UNION/EXCEPT", () => {
    expect(
      showCompoundPrecedence(`SELECT 1 UNION SELECT 2 INTERSECT SELECT 3 UNION SELECT 4`)
    ).toBe(`((SELECT 1 UNION (SELECT 2 INTERSECT SELECT 3)) UNION SELECT 4)`);
  });
});
