import { parse } from "../src/parser";

describe("expr", () => {
  function parseExpr(expr: string) {
    return parse(`SELECT ${expr}`).columns[0];
  }

  describe("string", () => {
    it("single-quoted string", () => {
      expect(parseExpr("'hello'")).toMatchInlineSnapshot(`
        {
          "text": "'hello'",
          "type": "string",
        }
      `);
    });
  });
});
