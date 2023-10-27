import { dialect, parseExpr, testExpr } from "../test_utils";

describe("number literal", () => {
  it("supports 0", () => {
    testExpr(`0`);
    expect(parseExpr(`0`)).toMatchInlineSnapshot(`
      {
        "text": "0",
        "type": "number_literal",
        "value": 0,
      }
    `);
  });

  it("supports integers", () => {
    testExpr(`123`);
    expect(parseExpr(`15`)).toMatchInlineSnapshot(`
      {
        "text": "15",
        "type": "number_literal",
        "value": 15,
      }
    `);
  });

  it("supports fractions", () => {
    testExpr(`1.23`);
    expect(parseExpr(`0.15`)).toMatchInlineSnapshot(`
      {
        "text": "0.15",
        "type": "number_literal",
        "value": 0.15,
      }
    `);
  });

  it("supports scientific notation", () => {
    testExpr(`123e15`);
    testExpr(`1.23E+13`);
    testExpr(`0.107e-62`);
  });

  it("supports signed numbers", () => {
    testExpr(`-6`);
    testExpr(`+18`);
  });

  dialect(["sqlite", "bigquery", "postgresql"], () => {
    it("parses 0x12FC0a as hex number", () => {
      expect(parseExpr(`0x12FC0a`)).toMatchInlineSnapshot(`
        {
          "text": "0x12FC0a",
          "type": "number_literal",
          "value": 1244170,
        }
      `);
    });
  });
});
