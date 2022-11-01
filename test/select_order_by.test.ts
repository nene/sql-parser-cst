import { dialect, test } from "./test_utils";

describe("select ORDER BY", () => {
  it("supports ORDER BY clause", () => {
    test("SELECT c FROM t ORDER BY name");
    test("SELECT c FROM t ORDER BY salary - tax");
    test("SELECT c FROM t ORDER BY name ASC");
    test("SELECT c FROM t ORDER BY age DESC");
    test("SELECT c FROM t ORDER BY name DESC, age ASC, salary");
    test("SELECT c FROM t /*c0*/ Order /*c1*/ By /*c2*/ age /*c3*/ ASC /*c4*/, /*c5*/ name");
  });

  it("supports ORDER BY with collation", () => {
    test("SELECT c FROM t ORDER BY name COLLATE utf8 DESC");
  });

  dialect("sqlite", () => {
    it("supports null handling specifiers", () => {
      test("SELECT c FROM t ORDER BY name NULLS FIRST");
      test("SELECT c FROM t ORDER BY name DESC NULLS FIRST");
      test("SELECT c FROM t ORDER BY name ASC NULLS LAST");
      test("SELECT c FROM t ORDER BY name ASC /*c1*/ NULLS /*c2*/ LAST");
    });
  });
});
