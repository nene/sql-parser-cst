import { test } from "./test_utils";

describe("bound parameters", () => {
  it("supports ? parameter placeholders", () => {
    test("SELECT * FROM foo WHERE x = ? AND y = ?");
  });
});
