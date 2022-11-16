import { dialect, parseExpr, testExpr } from "../test_utils";

describe("string literal", () => {
  it("single-quoted string", () => {
    expect(parseExpr(`'hello'`)).toMatchInlineSnapshot(`
      {
        "text": "'hello'",
        "type": "string",
        "value": "hello",
      }
    `);
  });
  it("single-quoted string with repeated-quote escapes", () => {
    testExpr(`'hel''lo'`);
  });
  it("parses single-quoted string with repeated-quote escapes", () => {
    expect(parseExpr(`'hel''lo'`)).toMatchInlineSnapshot(`
      {
        "text": "'hel''lo'",
        "type": "string",
        "value": "hel'lo",
      }
    `);
  });

  dialect("mysql", () => {
    it("single-quoted string with backslash escapes", () => {
      testExpr(`'hel\\'lo'`);
    });
  });

  dialect("mysql", () => {
    it("double-quoted string", () => {
      expect(parseExpr(`"hello"`)).toMatchInlineSnapshot(`
        {
          "text": ""hello"",
          "type": "string",
          "value": "hello",
        }
      `);
    });
    it("double-quoted string with repeated-quote escapes", () => {
      testExpr(`"hel""lo"`);
    });
    it("parses double-quoted string with repeated-quote escapes", () => {
      expect(parseExpr(`"hel""lo"`)).toMatchInlineSnapshot(`
        {
          "text": ""hel""lo"",
          "type": "string",
          "value": "hel"lo",
        }
      `);
    });
    it("double-quoted string with backslash escapes", () => {
      testExpr(`"hel\\"lo"`);
    });
    it("parses double-quoted string with backslash escapes", () => {
      expect(parseExpr(`"hel\\"lo"`)).toMatchInlineSnapshot(`
        {
          "text": ""hel\\"lo"",
          "type": "string",
          "value": "hel"lo",
        }
      `);
    });
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
              "value": "hello",
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
      it("bit literal with charset", () => {
        testExpr(`_big5 b'011001'`);
      });
      it("hex literal string with charset", () => {
        testExpr(`_utf16le X'AFC123'`);
      });
    });
  });

  dialect("mysql", () => {
    it("natural character set string", () => {
      expect(parseExpr(`N'hello'`)).toMatchInlineSnapshot(`
        {
          "text": "N'hello'",
          "type": "string",
          "value": "hello",
        }
      `);
    });
    it("natural character set string with repeated-quote escapes", () => {
      testExpr(`N'hel''lo'`);
    });
    it("natural character set string with backslash escapes", () => {
      testExpr(`n'hel\\'lo'`);
    });
  });
});
