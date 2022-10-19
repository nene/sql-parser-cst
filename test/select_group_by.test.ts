import { test } from "./test_utils";

describe("select GROUP BY", () => {
  it("parses group by with single expression", () => {
    test("SELECT c FROM t GROUP BY t.id");
    test("SELECT c FROM t /*c0*/ Group /*c1*/ By /*c2*/ t.id");
  });

  it("parses group by with multiple expressions", () => {
    test("SELECT id, name, age FROM t GROUP BY id, name, age");
    test("SELECT id, name FROM t GROUP BY /*c1*/ id /*c2*/, /*c3*/ name");
  });
});
