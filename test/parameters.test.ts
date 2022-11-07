import { test } from "./test_utils";

describe("bound parameters", () => {
  it("supports ? parameter placeholders", () => {
    test("SELECT * FROM foo WHERE x = ? AND y = ?");
  });

  it("supports ?nr parameter placeholders", () => {
    test("SELECT * FROM foo WHERE x = ?1 AND y = ?2");
  });

  it("supports :name parameter placeholders", () => {
    test("SELECT * FROM foo WHERE x = :foo AND y = :bar");
  });

  it("supports @name parameter placeholders", () => {
    test("SELECT * FROM foo WHERE x = @foo AND y = @bar");
  });

  it("supports $name parameter placeholders", () => {
    test("SELECT * FROM foo WHERE x = $foo AND y = $bar");
  });
});
