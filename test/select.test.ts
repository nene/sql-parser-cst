import { parse } from "../src/parser";

describe("select", () => {
  it("parses simple SELECT", () => {
    expect(parse("SELECT 'hello'")).toMatchInlineSnapshot(`
      {
        "columns": [
          {
            "text": "'hello'",
            "type": "string",
          },
        ],
        "type": "select",
      }
    `);
  });
});
