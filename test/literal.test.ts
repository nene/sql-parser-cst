import { dialect, parseExpr, testExpr } from "./test_utils";

describe("literal", () => {
  it("single-quoted string", () => {
    expect(parseExpr(`'hello'`)).toMatchSnapshot();
  });
  it("single-quoted string with escapes", () => {
    expect(parseExpr(`'hel\\'lo'`)).toMatchSnapshot();
    expect(parseExpr(`'hel''lo'`)).toMatchSnapshot();
  });
  it("single-quoted string with charset", () => {
    expect(parseExpr(`_binary 'hello'`)).toMatchSnapshot();
  });
  it("single-quoted string with charset and comment", () => {
    expect(parseExpr(`_latin1 /* comment */ 'hello'`)).toMatchSnapshot();
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
    expect(parseExpr(`0xAAFF11`)).toMatchSnapshot();
  });
  it("hex literal with charset", () => {
    expect(parseExpr(`_utf8 0xAAFF11`)).toMatchSnapshot();
  });

  it("bit string", () => {
    expect(parseExpr(`b'011001'`)).toMatchSnapshot();
  });
  it("bit string with charset", () => {
    expect(parseExpr(`_big5 b'011001'`)).toMatchSnapshot();
  });

  it("hex string", () => {
    expect(parseExpr(`x'AFC123'`)).toMatchSnapshot();
  });
  it("hex string with charset", () => {
    expect(parseExpr(`_utf16le X'AFC123'`)).toMatchSnapshot();
  });

  it("natural character set string", () => {
    expect(parseExpr(`N'hello'`)).toMatchSnapshot();
  });
  it("natural character set string with escapes", () => {
    expect(parseExpr(`n'hel\\'lo'`)).toMatchSnapshot();
    expect(parseExpr(`N'hel''lo'`)).toMatchSnapshot();
  });

  it("boolean", () => {
    expect(parseExpr(`true`)).toMatchSnapshot();
    expect(parseExpr(`TRUE`)).toMatchSnapshot();
    expect(parseExpr(`false`)).toMatchSnapshot();
    expect(parseExpr(`FALSE`)).toMatchSnapshot();
  });

  it("null", () => {
    expect(parseExpr(`null`)).toMatchSnapshot();
    expect(parseExpr(`NULL`)).toMatchSnapshot();
  });

  it("number", () => {
    expect(parseExpr(`0`)).toMatchSnapshot();
    expect(parseExpr(`123`)).toMatchSnapshot();
    expect(parseExpr(`0.15`)).toMatchSnapshot();
    expect(parseExpr(`123e15`)).toMatchSnapshot();
    expect(parseExpr(`1.23E+13`)).toMatchSnapshot();
    expect(parseExpr(`0.107e-62`)).toMatchSnapshot();
    expect(parseExpr(`-6`)).toMatchSnapshot();
    expect(parseExpr(`+18`)).toMatchSnapshot();
  });

  it("datetime", () => {
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
