import { test } from "./test_utils";

describe("select HAVING", () => {
  it("parses having clause", () => {
    test("SELECT c FROM t WHERE true GROUP BY col HAVING x > 3");
    test("SELECT c FROM t /*c1*/ Having /*c2*/ x = 81");
  });
});
