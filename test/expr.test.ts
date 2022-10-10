import { parse } from "../src/parser";

describe("expr", () => {
  function parseExpr(expr: string) {
    return parse(`SELECT ${expr}`).columns[0];
  }

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

    it("double-quoted string", () => {
      expect(parseExpr(`"hello"`)).toMatchSnapshot();
    });
    it("double-quoted string with escapes", () => {
      expect(parseExpr(`"hel\\"lo"`)).toMatchSnapshot();
      expect(parseExpr(`"hel""lo"`)).toMatchSnapshot();
    });
    it("double-quoted string with charset", () => {
      expect(parseExpr(`_latin1"hello"`)).toMatchSnapshot();
    });
    it("double-quoted string with charset and comments", () => {
      expect(
        parseExpr(`_latin1 -- comment1\n -- comment2\n 'hello'`)
      ).toMatchSnapshot();
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
    });

    it("datetime", () => {
      expect(parseExpr(`TIME '20:15:00'`)).toMatchSnapshot();
      expect(parseExpr(`DATE "1995-06-01"`)).toMatchSnapshot();
      expect(parseExpr(`DATEtime '1995-06-01 20:15:00'`)).toMatchSnapshot();
      expect(parseExpr(`timestamp "1995-06-01 20:15:00"`)).toMatchSnapshot();
    });

    it("datetime with comment", () => {
      expect(parseExpr(`DATETIME /* com1 */ '20:15:00'`)).toMatchSnapshot();
    });
  });
});
