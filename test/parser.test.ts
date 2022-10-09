import { parse } from "../src/parser";

describe("parser", () => {
  it("parses something", () => {
    expect(parse("SELECT *")).toBe(true);
  });
});
