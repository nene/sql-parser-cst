import { dialect, parseExpr, testExpr } from "../test_utils";

type StringTest = { text: string; value: string; visible?: string };
type Quote = '"' | "'" | '"""' | "'''";

function testStringEscaping(q: Quote, tests: StringTest[]) {
  tests.forEach(({ text, value, visible }) => {
    const quotedText = q + text + q;
    it(`${quotedText} evaluates to: ${visible || value}`, () => {
      expect(parseExpr(quotedText)).toEqual({
        type: "string",
        text: quotedText,
        value,
      });
    });
  });
}

const mysqlBackslashEscaping: StringTest[] = [
  { text: String.raw`\0`, value: `\0`, visible: "<NUL>" },
  { text: String.raw`\'`, value: `'` },
  { text: String.raw`\"`, value: `"` },
  { text: String.raw`\b`, value: `\b`, visible: "<BACKSPACE>" },
  { text: String.raw`\n`, value: `\n`, visible: "<NEWLINE>" },
  { text: String.raw`\r`, value: `\r`, visible: "<CARRIAGE RETURN>" },
  { text: String.raw`\t`, value: `\t`, visible: "<TAB>" },
  { text: String.raw`\Z`, value: `\x1A`, visible: "<CTRL+Z>" },
  { text: String.raw`\\`, value: `\\` },
  { text: String.raw`\%`, value: `\\%` },
  { text: String.raw`\_`, value: `\\_` },
  { text: String.raw`\e\l\s\e`, value: `else` },
];

describe("string literal", () => {
  describe("single-quoted string", () => {
    it("parses basic string", () => {
      expect(parseExpr(`'hello'`)).toMatchInlineSnapshot(`
        {
          "text": "'hello'",
          "type": "string",
          "value": "hello",
        }
      `);
    });

    dialect(["mysql", "sqlite"], () => {
      it("supports repeated-quote escapes", () => {
        testExpr(`'hel''lo'`);
      });
      it("parses repeated-quote escapes", () => {
        expect(parseExpr(`'hel''lo'`)).toMatchInlineSnapshot(`
          {
            "text": "'hel''lo'",
            "type": "string",
            "value": "hel'lo",
          }
        `);
      });
    });

    dialect("bigquery", () => {
      it("does not support repeated-quote escapes", () => {
        expect(() => parseExpr(`'hel''lo'`)).toThrowError();
      });
    });

    dialect(["mysql", "bigquery"], () => {
      testStringEscaping("'", mysqlBackslashEscaping);
    });
  });

  describe("double-quoted string", () => {
    dialect(["mysql", "bigquery"], () => {
      it("parses simple string", () => {
        expect(parseExpr(`"hello"`)).toMatchInlineSnapshot(`
          {
            "text": ""hello"",
            "type": "string",
            "value": "hello",
          }
        `);
      });
    });

    dialect("mysql", () => {
      it("supports repeated-quote escapes", () => {
        testExpr(`"hel""lo"`);
      });
      it("parses repeated-quote escapes", () => {
        expect(parseExpr(`"hel""lo"`)).toMatchInlineSnapshot(`
          {
            "text": ""hel""lo"",
            "type": "string",
            "value": "hel"lo",
          }
        `);
      });
    });

    dialect("bigquery", () => {
      it("does not support repeated-quote escapes", () => {
        expect(() => parseExpr(`"hel""lo"`)).toThrowError();
      });
    });

    dialect(["mysql", "bigquery"], () => {
      testStringEscaping("'", mysqlBackslashEscaping);
    });
  });

  dialect("bigquery", () => {
    describe("triple-quoted string (single-quotes)", () => {
      it("parses triple-quoted string", () => {
        expect(parseExpr(`'''It's about time!'''`)).toMatchInlineSnapshot(`
          {
            "text": "'''It's about time!'''",
            "type": "string",
            "value": "It's about time!",
          }
        `);
      });

      it("handles repeated quotes inside", () => {
        expect(parseExpr(`'''Are you ''sure'' about this?'''`)).toMatchInlineSnapshot(`
          {
            "text": "'''Are you ''sure'' about this?'''",
            "type": "string",
            "value": "Are you ''sure'' about this?",
          }
        `);
      });

      testStringEscaping("'", mysqlBackslashEscaping);
    });

    describe("triple-quoted string (double-quotes)", () => {
      it("parses triple-quoted string", () => {
        expect(parseExpr(`"""Are you "sure" about this?"""`)).toMatchInlineSnapshot(`
          {
            "text": """"Are you "sure" about this?"""",
            "type": "string",
            "value": "Are you "sure" about this?",
          }
        `);
      });

      it("handles repeated quotes inside", () => {
        expect(parseExpr(`"""Are you ""sure"" about this?"""`)).toMatchInlineSnapshot(`
          {
            "text": """"Are you ""sure"" about this?"""",
            "type": "string",
            "value": "Are you ""sure"" about this?",
          }
        `);
      });

      testStringEscaping("'", mysqlBackslashEscaping);
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
