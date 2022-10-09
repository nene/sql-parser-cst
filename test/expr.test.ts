import { parse } from "../src/parser";

describe("expr", () => {
  function parseExpr(expr: string) {
    return parse(`SELECT ${expr}`).columns[0];
  }

  describe("string", () => {
    it("single-quoted string", () => {
      expect(parseExpr(`'hello'`)).toMatchInlineSnapshot(`
        {
          "text": "'hello'",
          "type": "string",
        }
      `);
    });

    it("double-quoted string", () => {
      expect(parseExpr(`"hello"`)).toMatchInlineSnapshot(`
        {
          "text": ""hello"",
          "type": "string",
        }
      `);
    });

    it("hex literal", () => {
      expect(parseExpr(`0xAAFF11`)).toMatchInlineSnapshot(`
        {
          "prefix": null,
          "text": "0xAAFF11",
          "type": "string",
        }
      `);
      expect(parseExpr(`_binary 0xAAFF11`)).toMatchInlineSnapshot(`
        {
          "prefix": "_binary",
          "text": "0xAAFF11",
          "type": "string",
        }
      `);
    });

    it("bit string", () => {
      expect(parseExpr(`b'011001'`)).toMatchInlineSnapshot(`
        {
          "prefix": null,
          "text": "b'011001'",
          "type": "string",
        }
      `);
      expect(parseExpr(`_binary b'011001'`)).toMatchInlineSnapshot(`
        {
          "prefix": "_binary",
          "text": "b'011001'",
          "type": "string",
        }
      `);
    });

    it("hex string", () => {
      expect(parseExpr(`x'AFC123'`)).toMatchInlineSnapshot(`
        {
          "prefix": null,
          "text": "x'AFC123'",
          "type": "string",
        }
      `);
      expect(parseExpr(`_binary x'AFC123'`)).toMatchInlineSnapshot(`
        {
          "prefix": "_binary",
          "text": "x'AFC123'",
          "type": "string",
        }
      `);
    });
  });
});
