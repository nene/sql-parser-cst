import { parse, show } from "../src/parser";

describe("comments", () => {
  it("parses line comments", () => {
    expect(show(parse("SELECT 1 + -- comment 1\n -- comment 2\n 2"))).toBe(
      "SELECT 1 + -- comment 1\n -- comment 2\n 2"
    );
  });

  it("parses hash comments", () => {
    expect(show(parse("SELECT 1 + # comment 1\n # comment 2\n 2"))).toBe(
      "SELECT 1 + # comment 1\n # comment 2\n 2"
    );
  });

  it("parses block comments", () => {
    expect(show(parse("SELECT 1 + /* comment 1 */ /* comment 2 */ 2"))).toBe(
      "SELECT 1 + /* comment 1 */ /* comment 2 */ 2"
    );
  });
});
