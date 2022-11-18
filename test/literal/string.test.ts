import { dialect, parseExpr, testExpr } from "../test_utils";

function testMysqlBackslashEscaping(q: '"' | "'" | '"""' | "'''") {
  // For reference, see:
  // https://dev.mysql.com/doc/refman/8.0/en/string-literals.html#character-escape-sequences
  [
    { text: q + String.raw`\0` + q, value: `\0`, visible: "<NUL>" },
    { text: q + String.raw`\'` + q, value: `'` },
    { text: q + String.raw`\"` + q, value: `"` },
    { text: q + String.raw`\b` + q, value: `\b`, visible: "<BACKSPACE>" },
    { text: q + String.raw`\n` + q, value: `\n`, visible: "<NEWLINE>" },
    { text: q + String.raw`\r` + q, value: `\r`, visible: "<CARRIAGE RETURN>" },
    { text: q + String.raw`\t` + q, value: `\t`, visible: "<TAB>" },
    { text: q + String.raw`\Z` + q, value: `\x1A`, visible: "<CTRL+Z>" },
    { text: q + String.raw`\\` + q, value: `\\` },
    { text: q + String.raw`\%` + q, value: `\\%` },
    { text: q + String.raw`\_` + q, value: `\\_` },
    { text: q + String.raw`\e\l\s\e` + q, value: `else` },
  ].forEach(({ text, value, visible }) => {
    it(`${text} evaluates to: ${visible || value}`, () => {
      expect(parseExpr(text)).toEqual({
        type: "string",
        text,
        value,
      });
    });
  });
}

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

  dialect(["mysql", "bigquery"], () => {
    describe("backslash-escaping inside single-quoted strings", () => {
      testMysqlBackslashEscaping("'");
    });
  });

  dialect(["mysql", "bigquery"], () => {
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

    describe("backslash-escaping inside double-quoted strings", () => {
      testMysqlBackslashEscaping('"');
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

      testMysqlBackslashEscaping("'''");
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

      testMysqlBackslashEscaping('"""');
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
