import { parse } from "../src/parser";

describe("parser", () => {
  it("parses single-quoted string", () => {
    expect(parse("SELECT 'hello'")).toEqual({
      type: "select",
      columns: [{ type: "string", text: "'hello'" }],
    });
  });
});
