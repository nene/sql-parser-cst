import { dialect, parseExpr, testExpr } from "../test_utils";

type StringTest = { text: string; value: string; visible?: string };
type Quote = '"' | "'" | '"""' | "'''";

function testStringEscaping(q: Quote, tests: StringTest[]) {
  tests.forEach(({ text, value, visible }) => {
    const quotedText = q + text + q;
    it(`${quotedText} evaluates to: ${visible || value}`, () => {
      expect(parseExpr(quotedText)).toEqual({
        type: "string_literal",
        text: quotedText,
        value,
      });
    });
  });
}

const stdBackslashEscaping: StringTest[] = [
  { text: String.raw`\'`, value: `'` },
  { text: String.raw`\"`, value: `"` },
  { text: String.raw`\b`, value: `\b`, visible: "<BACKSPACE>" },
  { text: String.raw`\n`, value: `\n`, visible: "<NEWLINE>" },
  { text: String.raw`\r`, value: `\r`, visible: "<CARRIAGE RETURN>" },
  { text: String.raw`\t`, value: `\t`, visible: "<TAB>" },
  { text: String.raw`\\`, value: `\\` },
];

const mysqlBackslashEscaping: StringTest[] = [
  ...stdBackslashEscaping,
  { text: String.raw`\0`, value: `\0`, visible: "<NUL>" },
  { text: String.raw`\Z`, value: `\x1A`, visible: "<CTRL+Z>" },
  { text: String.raw`\%`, value: `\\%` },
  { text: String.raw`\_`, value: `\\_` },
  { text: String.raw`\e\l\s\e`, value: `else` },
];

const bigqueryBackslashEscaping: StringTest[] = [
  ...stdBackslashEscaping,
  { text: String.raw`\a`, value: `\x07`, visible: "<BELL>" },
  { text: String.raw`\f`, value: `\f`, visible: "<FORM FEED>" },
  { text: String.raw`\v`, value: `\v`, visible: "<VERTICAL TAB>" },
  { text: String.raw`\?`, value: `?` },
  { text: String.raw`\``, value: "`" },
  { text: String.raw`\101\105`, value: "AE" },
  { text: String.raw`\x41\X45`, value: "AE" },
  { text: String.raw`\u03B1\u03b2\u03B3`, value: "αβγ" },
  { text: String.raw`\U00000041\U0001F600`, value: "A😀" },
];

describe("string literal", () => {
  describe("single-quoted string", () => {
    it("parses basic string", () => {
      expect(parseExpr(`'hello'`)).toMatchInlineSnapshot(`
        {
          "text": "'hello'",
          "type": "string_literal",
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
            "type": "string_literal",
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

    dialect("mysql", () => {
      testStringEscaping("'", mysqlBackslashEscaping);
    });
    dialect("bigquery", () => {
      testStringEscaping("'", bigqueryBackslashEscaping);
    });
  });

  describe("double-quoted string", () => {
    dialect(["mysql", "bigquery"], () => {
      it("parses simple string", () => {
        expect(parseExpr(`"hello"`)).toMatchInlineSnapshot(`
          {
            "text": ""hello"",
            "type": "string_literal",
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
            "type": "string_literal",
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

    dialect("mysql", () => {
      testStringEscaping('"', mysqlBackslashEscaping);
    });
    dialect("bigquery", () => {
      testStringEscaping('"', bigqueryBackslashEscaping);
    });
  });

  dialect("bigquery", () => {
    describe("triple-quoted string (single-quotes)", () => {
      it("parses triple-quoted string", () => {
        expect(parseExpr(`'''It's about time!'''`)).toMatchInlineSnapshot(`
          {
            "text": "'''It's about time!'''",
            "type": "string_literal",
            "value": "It's about time!",
          }
        `);
      });

      it("handles repeated quotes inside", () => {
        expect(parseExpr(`'''Are you ''sure'' about this?'''`)).toMatchInlineSnapshot(`
          {
            "text": "'''Are you ''sure'' about this?'''",
            "type": "string_literal",
            "value": "Are you ''sure'' about this?",
          }
        `);
      });

      testStringEscaping("'", bigqueryBackslashEscaping);
    });

    describe("triple-quoted string (double-quotes)", () => {
      it("parses triple-quoted string", () => {
        expect(parseExpr(`"""Are you "sure" about this?"""`)).toMatchInlineSnapshot(`
          {
            "text": """"Are you "sure" about this?"""",
            "type": "string_literal",
            "value": "Are you "sure" about this?",
          }
        `);
      });

      it("handles repeated quotes inside", () => {
        expect(parseExpr(`"""Are you ""sure"" about this?"""`)).toMatchInlineSnapshot(`
          {
            "text": """"Are you ""sure"" about this?"""",
            "type": "string_literal",
            "value": "Are you ""sure"" about this?",
          }
        `);
      });

      testStringEscaping("'", bigqueryBackslashEscaping);
    });

    describe("raw strings", () => {
      it("supports R prefix for all quote types", () => {
        testExpr(`r'hello'`);
        testExpr(`R'''hello'''`);
        testExpr(`R"hello"`);
        testExpr(`r"""hello"""`);
      });

      it("allows no escaping inside raw strings", () => {
        expect(parseExpr(String.raw`r'no\nescapes'`)).toMatchInlineSnapshot(`
          {
            "text": "r'no\\nescapes'",
            "type": "string_literal",
            "value": "no\\nescapes",
          }
        `);
      });

      it("allows for quotes inside triple-quoted raw strings", () => {
        testExpr(`r"""for "your" eyes only"""`);
        testExpr(`r'''it's'''`);
      });
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
              "type": "string_literal",
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
          "type": "string_literal",
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
