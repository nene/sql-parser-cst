import { dialect, parseExpr, testExpr } from "../test_utils";

describe("blob literal", () => {
  describe("hex literal string", () => {
    it("parses as blob", () => {
      expect(parseExpr(`x'3132332D414243'`)).toMatchInlineSnapshot(`
        {
          "text": "x'3132332D414243'",
          "type": "blob",
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
          "type": "blob",
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
            "type": "blob",
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
            "type": "blob",
            "value": [
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
            "type": "blob",
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
            "type": "blob",
            "value": [
              1,
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
            "type": "blob",
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
            "type": "blob",
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
            "type": "blob",
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
            "type": "blob",
            "value": [
              10,
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
            "type": "blob",
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
            "type": "blob",
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
            "type": "blob",
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
            "type": "blob",
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
