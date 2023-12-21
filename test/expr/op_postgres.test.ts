import { dialect, notDialect, parse, testExprWc } from "../test_utils";

describe("special PostgreSQL operators", () => {
  dialect("postgresql", () => {
    [
      "||/",
      "|/",
      ">>",
      "<<",
      "!~~*",
      "~~*",
      "!~~",
      "~~",
      "!~*",
      "~*",
      "!~",
      "~",
      "!",
      "@",
      "#",
      "&",
      "|",
      "`",
      "?",
    ].forEach((op) => {
      it(`parses ${op} operator`, () => {
        testExprWc(`x ${op} y`);
      });
    });
  });

  notDialect("postgresql", () => {
    it("does not support weird Postgres operators", () => {
      expect(() => parse(`x ||/ y`)).toThrowError();
    });
  });
});
