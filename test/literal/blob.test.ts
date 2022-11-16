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
});
