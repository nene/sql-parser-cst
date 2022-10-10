import { parse } from "../src/parser";

describe("expr", () => {
  function parseExpr(expr: string) {
    return parse(`SELECT ${expr}`).columns[0];
  }

  describe("operators", () => {
    it("parses simple addition", () => {
      expect(parseExpr(`5 + 7`)).toMatchSnapshot();
    });

    it("parses chain of addition and subtraction", () => {
      expect(parseExpr(`5 + 6 - 8`)).toMatchSnapshot();
    });

    it("parses simple multiplication", () => {
      expect(parseExpr(`7 * 8`)).toMatchSnapshot();
    });

    it("parses chain of multiplication and division", () => {
      expect(parseExpr(`2 * 7 / 3`)).toMatchSnapshot();
    });

    it("treats multiplication with higher precedence than addition", () => {
      expect(parseExpr(`6 + 7 * 3`)).toMatchSnapshot();
    });
  });
});
