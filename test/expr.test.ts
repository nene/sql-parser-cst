import { parse } from "../src/parser";

describe("expr", () => {
  function parseExpr(expr: string) {
    return parse(`SELECT ${expr}`).columns[0];
  }

  describe("string", () => {
    it("single-quoted string", () => {
      expect(parseExpr(`'hello'`)).toMatchSnapshot();
    });

    it("double-quoted string", () => {
      expect(parseExpr(`"hello"`)).toMatchSnapshot();
    });

    it("hex literal", () => {
      expect(parseExpr(`0xAAFF11`)).toMatchSnapshot();
      expect(parseExpr(`_binary 0xAAFF11`)).toMatchSnapshot();
    });

    it("bit string", () => {
      expect(parseExpr(`b'011001'`)).toMatchSnapshot();
      expect(parseExpr(`_binary b'011001'`)).toMatchSnapshot();
    });

    it("hex string", () => {
      expect(parseExpr(`x'AFC123'`)).toMatchSnapshot();
      expect(parseExpr(`_binary x'AFC123'`)).toMatchSnapshot();
    });
  });
});
