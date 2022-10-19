import { test } from "./test_utils";

describe("select WHERE", () => {
  it("parses where clause", () => {
    test("SELECT name FROM pupils WHERE age > 10");
    test("SELECT name FROM pupils where true");
    test("SELECT name FROM pupils /*c1*/ WHERE /*c2*/ name = 'Mary'");
  });
});
