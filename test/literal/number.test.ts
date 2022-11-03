import { dialect, parseExpr, testExpr } from "../test_utils";

describe("number literal", () => {
  it("number", () => {
    expect(parseExpr(`0`)).toMatchInlineSnapshot(`
      {
        "text": "0",
        "type": "number",
      }
    `);
    testExpr(`123`);
    testExpr(`0.15`);
    testExpr(`123e15`);
    testExpr(`1.23E+13`);
    testExpr(`0.107e-62`);
    testExpr(`-6`);
    testExpr(`+18`);
  });

  dialect("sqlite", () => {
    it("parses 0x12FC0a as hex number", () => {
      expect(parseExpr(`0x12FC0a`)).toMatchInlineSnapshot(`
        {
          "text": "0x12FC0a",
          "type": "number",
        }
      `);
    });
  });

  dialect("mysql", () => {
    it("parses 0x12FC0a as hex string", () => {
      expect(parseExpr(`0x12FC0a`)).toMatchInlineSnapshot(`
        {
          "text": "0x12FC0a",
          "type": "string",
        }
      `);
    });
  });
});
