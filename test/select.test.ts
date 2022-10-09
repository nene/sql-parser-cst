import { parse } from "../src/parser";

describe("select", () => {
  it("parses simple SELECT", () => {
    expect(parse("SELECT 'hello'")).toEqual({
      type: "select",
      columns: [{ type: "string", text: "'hello'" }],
    });
  });
});
