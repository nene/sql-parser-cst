import { dialect, notDialect, parse, testExprWc } from "../test_utils";
import { isPostgresqlOtherOperator } from "../../src/utils/pgOperators";

describe("special PostgreSQL operators", () => {
  dialect("postgresql", () => {
    [
      "||/",
      "|/",
      "||",
      ">>",
      "<<",
      "!~~*",
      "~~*",
      "!~~",
      "~~",
      "!~*",
      "~*",
      "!~",
      "!",
      "@",
      "#",
      "&",
      "|",
      "`",
      // JSON
      "->>",
      "->",
      "#>>",
      "#>",
      // JSONB
      "@>",
      "<@",
      "?",
      "?|",
      "?&",
      "#-",
      "@?",
      "@@",
      // pgvector
      // https://github.com/pgvector/pgvector#vector-operators
      "<+>",
      "<->",
      "<#>",
      "<=>",
      "<~>",
      "<%>",
    ].forEach((op) => {
      it(`parses ${op} operator`, () => {
        testExprWc(`x ${op} y`);
      });
    });

    // Test the currently unused isPostgresqlOtherOperator() predicate
    describe("isPostgresqlOtherOperator()", () => {
      it("rejects standard operators", () => {
        expect(isPostgresqlOtherOperator("+")).toBe(false);
        expect(isPostgresqlOtherOperator("-")).toBe(false);
        expect(isPostgresqlOtherOperator("*")).toBe(false);
        expect(isPostgresqlOtherOperator("/")).toBe(false);
        expect(isPostgresqlOtherOperator("^")).toBe(false);
        expect(isPostgresqlOtherOperator("%")).toBe(false);
        expect(isPostgresqlOtherOperator(">")).toBe(false);
        expect(isPostgresqlOtherOperator("<")).toBe(false);
        expect(isPostgresqlOtherOperator("<>")).toBe(false);
        expect(isPostgresqlOtherOperator(">=")).toBe(false);
        expect(isPostgresqlOtherOperator("<=")).toBe(false);
        expect(isPostgresqlOtherOperator("!=")).toBe(false);
        expect(isPostgresqlOtherOperator("=")).toBe(false);
        expect(isPostgresqlOtherOperator("~")).toBe(false);
      });

      it("rejects operators containing -- or /*", () => {
        expect(isPostgresqlOtherOperator("--")).toBe(false);
        expect(isPostgresqlOtherOperator("/*")).toBe(false);
        expect(isPostgresqlOtherOperator("*/*")).toBe(false);
        expect(isPostgresqlOtherOperator("@--@")).toBe(false);
      });

      it("rejects operators ending with + or -", () => {
        expect(isPostgresqlOtherOperator("=+")).toBe(false);
        expect(isPostgresqlOtherOperator("</>-")).toBe(false);
      });

      it("allows operators ending with + or - when they also contain ~ ! @ # % ^ & | ` ?", () => {
        expect(isPostgresqlOtherOperator("!+")).toBe(true);
        expect(isPostgresqlOtherOperator("<%>-")).toBe(true);
      });

      it("allows the known weird operators", () => {
        expect(isPostgresqlOtherOperator("!~~*")).toBe(true);
        expect(isPostgresqlOtherOperator("||/")).toBe(true);
        expect(isPostgresqlOtherOperator("~*")).toBe(true);
        expect(isPostgresqlOtherOperator("?")).toBe(true);
      });
    });
  });

  notDialect("postgresql", () => {
    it("does not support weird Postgres operators", () => {
      expect(() => parse(`x ||/ y`)).toThrowError();
    });
  });
});
