import { dialect, parseExpr, testExpr } from "../test_utils";

describe("string literal", () => {
  it("single-quoted string", () => {
    expect(parseExpr(`'hello'`)).toMatchInlineSnapshot(`
      {
        "text": "'hello'",
        "type": "string",
      }
    `);
  });
  it("single-quoted string with escapes", () => {
    testExpr(`'hel\\'lo'`);
    testExpr(`'hel''lo'`);
  });

  dialect("mysql", () => {
    it("double-quoted string", () => {
      expect(parseExpr(`"hello"`)).toMatchInlineSnapshot(`
        {
          "text": ""hello"",
          "type": "string",
        }
      `);
    });
    it("double-quoted string with escapes", () => {
      testExpr(`"hel\\"lo"`);
      testExpr(`"hel""lo"`);
    });
  });

  it("hex literal", () => {
    expect(parseExpr(`0xAAFF11`)).toMatchInlineSnapshot(`
      {
        "text": "0xAAFF11",
        "type": "string",
      }
    `);
  });

  it("bit string", () => {
    expect(parseExpr(`b'011001'`)).toMatchInlineSnapshot(`
      {
        "text": "b'011001'",
        "type": "string",
      }
    `);
  });

  it("hex string", () => {
    expect(parseExpr(`x'AFC123'`)).toMatchInlineSnapshot(`
      {
        "text": "x'AFC123'",
        "type": "string",
      }
    `);
  });

  dialect("mysql", () => {
    describe("string with charset", () => {
      it("parses single-quoted string with charset to syntax tree", () => {
        expect(parseExpr(`_binary 'hello'`)).toMatchInlineSnapshot(`
          {
            "charset": "binary",
            "string": {
              "text": "'hello'",
              "type": "string",
            },
            "type": "string_with_charset",
          }
        `);
      });
      it("single-quoted string with charset", () => {
        testExpr(`_latin1 'hello'`);
        testExpr(`_latin1 /*c*/ 'hello'`);
      });
      it("double-quoted string with charset", () => {
        testExpr(`_latin1 'hello'`);
      });
      it("hex literal with charset", () => {
        testExpr(`_utf8 0xAAFF11`);
      });
      it("bit string with charset", () => {
        testExpr(`_big5 b'011001'`);
      });
      it("hex string with charset", () => {
        testExpr(`_utf16le X'AFC123'`);
      });
    });
  });

  it("natural character set string", () => {
    expect(parseExpr(`N'hello'`)).toMatchInlineSnapshot(`
      {
        "text": "N'hello'",
        "type": "string",
      }
    `);
  });
  it("natural character set string with escapes", () => {
    testExpr(`n'hel\\'lo'`);
    testExpr(`N'hel''lo'`);
  });
});
