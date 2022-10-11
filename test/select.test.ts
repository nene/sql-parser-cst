import { parse, show } from "../src/parser";

describe("select", () => {
  function test(sql: string) {
    expect(show(parse(sql))).toBe(sql);
  }

  it("parses simple SELECT", () => {
    test("SELECT 'hello'");
    test("SELECT 1, 2, 3");
    test("SELECT 1 /*c1*/, /*c2*/ 2");
  });

  describe("syntax tree", () => {
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
});
