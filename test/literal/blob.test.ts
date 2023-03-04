import { dialect, parseExpr, testExpr } from "../test_utils";

describe("blob literal", () => {
  describe("hex literal string", () => {
    it("parses as blob", () => {
      expect(parseExpr(`x'3132332D414243'`)).toMatchInlineSnapshot(`
        {
          "text": "x'3132332D414243'",
          "type": "blob_literal",
          "value": [
            49,
            50,
            51,
            45,
            65,
            66,
            67,
          ],
        }
      `);
    });

    it("supports single-digit hex literal string", () => {
      testExpr(`x'F'`);
      expect(parseExpr(`x'F'`)).toMatchInlineSnapshot(`
        {
          "text": "x'F'",
          "type": "blob_literal",
          "value": [
            15,
          ],
        }
      `);
    });
  });

  dialect("mysql", () => {
    describe("hex literal", () => {
      it("parses as blob", () => {
        expect(parseExpr(`0x3132332D414243`)).toMatchInlineSnapshot(`
          {
            "text": "0x3132332D414243",
            "type": "blob_literal",
            "value": [
              49,
              50,
              51,
              45,
              65,
              66,
              67,
            ],
          }
        `);
      });

      it("supports single-digit hex literal", () => {
        testExpr(`0xF`);
        expect(parseExpr(`0xF`)).toMatchInlineSnapshot(`
          {
            "text": "0xF",
            "type": "blob_literal",
            "value": [
              15,
            ],
          }
        `);
      });

      it("groups bytes to groups of two from right", () => {
        testExpr(`0xF`);
        expect(parseExpr(`0x1FF`)).toMatchInlineSnapshot(`
          {
            "text": "0x1FF",
            "type": "blob_literal",
            "value": [
              1,
              255,
            ],
          }
        `);
      });
    });
  });

  dialect("mysql", () => {
    describe("bit literal", () => {
      it("parses as blob", () => {
        expect(parseExpr(`0b0000110100001110`)).toMatchInlineSnapshot(`
          {
            "text": "0b0000110100001110",
            "type": "blob_literal",
            "value": [
              13,
              14,
            ],
          }
        `);
      });

      it("supports bit literal with bit count not divisable by 8", () => {
        testExpr(`0b1`);
        expect(parseExpr(`0b1111`)).toMatchInlineSnapshot(`
          {
            "text": "0b1111",
            "type": "blob_literal",
            "value": [
              15,
            ],
          }
        `);
      });

      it("groups bits to groups of 8 from right", () => {
        expect(parseExpr(`0b100001111`)).toMatchInlineSnapshot(`
          {
            "text": "0b100001111",
            "type": "blob_literal",
            "value": [
              1,
              15,
            ],
          }
        `);
      });
    });
  });

  dialect("mysql", () => {
    describe("bit literal string", () => {
      it("parses as blob", () => {
        testExpr(`b'01010111'`);
        expect(parseExpr(`b'01010111'`)).toMatchInlineSnapshot(`
          {
            "text": "b'01010111'",
            "type": "blob_literal",
            "value": [
              87,
            ],
          }
        `);
      });

      it("supports single-digit bit literal string", () => {
        testExpr(`b'1'`);
        expect(parseExpr(`b'1'`)).toMatchInlineSnapshot(`
          {
            "text": "b'1'",
            "type": "blob_literal",
            "value": [
              1,
            ],
          }
        `);
      });

      it("groups bits to groups of 8 from right", () => {
        expect(parseExpr(`B'100001111'`)).toMatchInlineSnapshot(`
          {
            "text": "B'100001111'",
            "type": "blob_literal",
            "value": [
              1,
              15,
            ],
          }
        `);
      });
    });
  });

  dialect("bigquery", () => {
    describe("byte strings", () => {
      it("supports byte strings", () => {
        testExpr(`b'hello'`);
        testExpr(`b'''hello'''`);
        testExpr(`B"hello"`);
        testExpr(`B"""hello"""`);
      });

      it("parses byte string as blob", () => {
        expect(parseExpr(`b'abc'`)).toMatchInlineSnapshot(`
          {
            "text": "b'abc'",
            "type": "blob_literal",
            "value": [
              97,
              98,
              99,
            ],
          }
        `);
      });

      it("correctly parses byte values of repeated quotes inside triple-quoted strings", () => {
        expect(parseExpr(`b'''a''c'''`)).toMatchInlineSnapshot(`
          {
            "text": "b'''a''c'''",
            "type": "blob_literal",
            "value": [
              97,
              39,
              39,
              99,
            ],
          }
        `);
        expect(parseExpr(`B"""a""c"""`)).toMatchInlineSnapshot(`
          {
            "text": "B"""a""c"""",
            "type": "blob_literal",
            "value": [
              97,
              34,
              34,
              99,
            ],
          }
        `);
      });

      it("correctly parses byte values of backslash escapes", () => {
        expect(parseExpr(String.raw`B"\n"`)).toMatchInlineSnapshot(`
          {
            "text": "B"\\n"",
            "type": "blob_literal",
            "value": [
              10,
            ],
          }
        `);
      });

      it("correctly parses byte values of UTF-8 characters", () => {
        // encoding of ä in UTF-8: https://unicode-table.com/en/00E4/
        expect(parseExpr(String.raw`B"ä1"`)).toMatchInlineSnapshot(`
          {
            "text": "B"ä1"",
            "type": "blob_literal",
            "value": [
              195,
              164,
              49,
            ],
          }
        `);
      });
    });

    describe("raw byte strings", () => {
      it("supports raw byte strings", () => {
        testExpr(`rb'hello'`);
        testExpr(`Rb'''hello'''`);
        testExpr(`BR"hello"`);
        testExpr(`Br"""hello"""`);
      });

      it("parses raw byte string as blob", () => {
        expect(parseExpr(`rb'abc'`)).toMatchInlineSnapshot(`
          {
            "text": "rb'abc'",
            "type": "blob_literal",
            "value": [
              97,
              98,
              99,
            ],
          }
        `);
      });

      it("correctly parses byte values of repeated quotes inside triple-quoted strings", () => {
        expect(parseExpr(`rb'''a''c'''`)).toMatchInlineSnapshot(`
          {
            "text": "rb'''a''c'''",
            "type": "blob_literal",
            "value": [
              97,
              39,
              39,
              99,
            ],
          }
        `);
        expect(parseExpr(`BR"""a""c"""`)).toMatchInlineSnapshot(`
          {
            "text": "BR"""a""c"""",
            "type": "blob_literal",
            "value": [
              97,
              34,
              34,
              99,
            ],
          }
        `);
      });

      it("correctly parses byte value of backslash", () => {
        expect(parseExpr(String.raw`BR"\n"`)).toMatchInlineSnapshot(`
          {
            "text": "BR"\\n"",
            "type": "blob_literal",
            "value": [
              92,
              110,
            ],
          }
        `);
      });
    });
  });
});
