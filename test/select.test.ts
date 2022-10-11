import { parse } from "../src/parser";

describe("select", () => {
  it("parses simple SELECT", () => {
    expect(parse("SELECT 'hello'")).toMatchInlineSnapshot(`
      {
        "columns": {
          "children": [
            {
              "text": "'hello'",
              "type": "string",
            },
          ],
          "type": "expr_list",
        },
        "type": "select",
      }
    `);
  });

  it("parses SELECT with multiple columns", () => {
    expect(parse("SELECT 1, 2, 3")).toMatchInlineSnapshot(`
      {
        "columns": {
          "children": [
            {
              "text": "1",
              "type": "number",
            },
            {
              "text": "2",
              "type": "number",
            },
            {
              "text": "3",
              "type": "number",
            },
          ],
          "type": "expr_list",
        },
        "type": "select",
      }
    `);
  });
});
