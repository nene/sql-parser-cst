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

  it("supports fractions without leading digits", () => {
    testExpr(`.23`);
    expect(parseExpr(`.158`)).toMatchInlineSnapshot(`
      {
        "text": ".158",
        "type": "number_literal",
        "value": 0.158,
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

  dialect("postgresql", () => {
    it("parses 0b01101010 as binary number", () => {
      expect(parseExpr(`0b01101010`)).toMatchInlineSnapshot(`
        {
          "text": "0b01101010",
          "type": "number_literal",
          "value": 106,
        }
      `);
    });
  });

  dialect("postgresql", () => {
    it("parses 0o755 as octal number", () => {
      expect(parseExpr(`0o755`)).toMatchInlineSnapshot(`
        {
          "text": "0o755",
          "type": "number_literal",
          "value": 493,
        }
      `);
    });
  });

  dialect("postgresql", () => {
    function testNumberLiteral(text: string, value: number) {
      expect(parseExpr(text)).toEqual({ type: "number_literal", text, value });
    }

    it("parses underscores in number literal", () => {
      testNumberLiteral(`10_000_000`, 10000000);
      testNumberLiteral(`3.14_15_92_65`, 3.14159265);
      testNumberLiteral(`1.2345e1_0`, 1.2345e10);
      testNumberLiteral(`.2345e1_0`, 0.2345e10);
    });

    it("parses underscores in hex literal", () => {
      testNumberLiteral(`0xFFF_000`, 0xfff000);
    });

    it("parses underscores in octal literal", () => {
      testNumberLiteral(`0o77_66_00`, 0o776600);
    });

    it("parses underscores in bit literal", () => {
      testNumberLiteral(`0b0011_1010_1101_0010`, 0b0011101011010010);
    });

    function parseNumberLiteral(text: string) {
      const e = parseExpr(text);
      if (e.type !== "number_literal") {
        throw new Error(`Expected number literal, got ${e.type}`);
      }
      return e;
    }

    ["10_000_", "52__350", "_15_000", "0x_", "0o_", "0b_"].forEach((nr) => {
      it(`does not parse invalid underscores: ${nr}`, () => {
        expect(() => parseNumberLiteral(nr)).toThrow();
      });
    });
  });
});
