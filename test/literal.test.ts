import { dialect, parseExpr, testExpr } from "./test_utils";

describe("literal", () => {
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
  it("single-quoted string with charset", () => {
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
  it("single-quoted string with charset and comment", () => {
    testExpr(`_latin1 /* comment */ 'hello'`);
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
    it("double-quoted string with charset", () => {
      expect(parseExpr(`_latin1"hello"`)).toMatchInlineSnapshot(`
        {
          "charset": "latin1",
          "string": {
            "text": ""hello"",
            "type": "string",
          },
          "type": "string_with_charset",
        }
      `);
    });
    it("double-quoted string with charset and comments", () => {
      testExpr(`_latin1 -- comment1\n -- comment2\n 'hello'`);
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
  it("hex literal with charset", () => {
    testExpr(`_utf8 0xAAFF11`);
  });

  it("bit string", () => {
    expect(parseExpr(`b'011001'`)).toMatchInlineSnapshot(`
      {
        "text": "b'011001'",
        "type": "string",
      }
    `);
  });
  it("bit string with charset", () => {
    testExpr(`_big5 b'011001'`);
  });

  it("hex string", () => {
    expect(parseExpr(`x'AFC123'`)).toMatchInlineSnapshot(`
      {
        "text": "x'AFC123'",
        "type": "string",
      }
    `);
  });
  it("hex string with charset", () => {
    testExpr(`_utf16le X'AFC123'`);
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

  it("boolean", () => {
    expect(parseExpr(`true`)).toMatchInlineSnapshot(`
      {
        "text": "true",
        "type": "bool",
      }
    `);
    testExpr(`TRUE`);
    testExpr(`false`);
    testExpr(`FALSE`);
  });

  it("null", () => {
    expect(parseExpr(`null`)).toMatchInlineSnapshot(`
      {
        "text": "null",
        "type": "null",
      }
    `);
    testExpr(`NULL`);
  });

  it("number", () => {
    expect(parseExpr(`0`)).toMatchInlineSnapshot(`
      {
        "text": "0",
        "type": "number",
      }
    `);
    testExpr(`123`);
    testExpr(`0.15`);
    testExpr(`123e15`);
    testExpr(`1.23E+13`);
    testExpr(`0.107e-62`);
    testExpr(`-6`);
    testExpr(`+18`);
  });

  it("datetime", () => {
    expect(parseExpr(`TIME '10:05:58'`)).toMatchInlineSnapshot(`
      {
        "kw": {
          "text": "TIME",
          "type": "keyword",
        },
        "string": {
          "text": "'10:05:58'",
          "type": "string",
        },
        "type": "datetime",
      }
    `);
    testExpr(`TIME '20:15:00'`);
    testExpr(`DATE "1995-06-01"`);
    testExpr(`DATEtime '1995-06-01 20:15:00'`);
    testExpr(`timestamp "1995-06-01 20:15:00"`);
    testExpr(`DATETIME /* com1 */ '20:15:00'`);
  });

  dialect("mysql", () => {
    it("datetime with double-quoted string", () => {
      testExpr(`TIME "20:15:00"`);
      testExpr(`DATE "1995-06-01"`);
      testExpr(`DATEtime "1995-06-01 20:15:00"`);
      testExpr(`timestamp "1995-06-01 20:15:00"`);
    });
  });
});
