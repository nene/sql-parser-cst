import { test } from "./test_utils";

describe("select ORDER BY", () => {
  it("parses order by clause", () => {
    test("SELECT c FROM t ORDER BY name");
    test("SELECT c FROM t ORDER BY salary - tax");
    test("SELECT c FROM t ORDER BY name ASC");
    test("SELECT c FROM t ORDER BY age DESC");
    test("SELECT c FROM t ORDER BY name DESC, age ASC, salary");
    test("SELECT c FROM t /*c0*/ Order /*c1*/ By /*c2*/ age /*c3*/ ASC /*c4*/, /*c5*/ name");
  });
});
