import { dialect, notDialect, parse, showPrecedence, testExprWc } from "../test_utils";
import { isPostgresqlOtherOperator } from "../../src/utils/pgOperators";

describe("special PostgreSQL operators", () => {
  dialect(["postgresql", "plpgsql"], () => {
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
      // Others
      // discovered by running in Supabase:
      // SELECT DISTINCT oprname FROM pg_operator WHERE length(oprname) >= 2 ORDER BY oprname;
      "!!",
      "##",
      "&&",
      "&<",
      "&>",
      "*<",
      "*<=",
      "*<>",
      "*=",
      "*>",
      "*>=",
      "-|-",
      "<<=",
      "<<|",
      "<^",
      ">>=",
      ">^",
      "?#",
      "?-",
      "?-|",
      "?||",
      "@-@",
      "@@@",
      "^@",
      "|&>",
      "|>>",
      "~<=~",
      "~<~",
      "~=",
      "~>=~",
      "~>~",
    ].forEach((op) => {
      it(`parses ${op} operator`, () => {
        testExprWc(`x ${op} y`);
      });
    });

    describe("when operator ends with - or +", () => {
      it("parses as single operator when the operator contains ~!@#%^&|`?", () => {
        // Actual operators from PostgreSQL
        // jsonb #- text[]: delete the field or array element at the specified path
        expect(showPrecedence(`x#-y`)).toBe(`(x #- y)`);
        // ?- line: is line horizontal?
        // line ?- line: are lines horizontally aligned?
        expect(showPrecedence(`x?-y`)).toBe(`(x ?- y)`);
        // anyrange -|- anyrange: are the ranges adjacent?
        expect(showPrecedence(`x-|-y`)).toBe(`(x -|- y)`);

        // Synthetic cases of possible operators
        expect(showPrecedence(`x*~-y`)).toBe(`(x *~- y)`);
        expect(showPrecedence(`x*!-y`)).toBe(`(x *!- y)`);
        expect(showPrecedence(`x*@-y`)).toBe(`(x *@- y)`);
        expect(showPrecedence(`x*#-y`)).toBe(`(x *#- y)`);
        expect(showPrecedence(`x*%-y`)).toBe(`(x *%- y)`);
        expect(showPrecedence(`x*^-y`)).toBe(`(x *^- y)`);
        expect(showPrecedence(`x*&-y`)).toBe(`(x *&- y)`);
        expect(showPrecedence(`x*|-y`)).toBe(`(x *|- y)`);
        expect(showPrecedence("x*`-y")).toBe("(x *`- y)");
        expect(showPrecedence(`x*?-y`)).toBe(`(x *?- y)`);

        expect(showPrecedence(`x*~+y`)).toBe(`(x *~+ y)`);
        expect(showPrecedence(`x*!+y`)).toBe(`(x *!+ y)`);
        expect(showPrecedence(`x*@+y`)).toBe(`(x *@+ y)`);
        expect(showPrecedence(`x*#+y`)).toBe(`(x *#+ y)`);
        expect(showPrecedence(`x*%+y`)).toBe(`(x *%+ y)`);
        expect(showPrecedence(`x*^+y`)).toBe(`(x *^+ y)`);
        expect(showPrecedence(`x*&+y`)).toBe(`(x *&+ y)`);
        expect(showPrecedence(`x*|+y`)).toBe(`(x *|+ y)`);
        expect(showPrecedence("x*`+y")).toBe("(x *`+ y)");
        expect(showPrecedence(`x*?+y`)).toBe(`(x *?+ y)`);
      });

      it("parses as multiple operators when the operator does not contain ~!@#%^&|`?", () => {
        expect(showPrecedence(`x->-y`)).toBe(`(x -> (- y))`);
        expect(showPrecedence(`x->+y`)).toBe(`(x -> (+ y))`);
        expect(showPrecedence(`x->>-1`)).toBe(`(x ->> (- 1))`);
        expect(showPrecedence(`x<-1`)).toBe(`(x < (- 1))`);
        expect(showPrecedence(`x>-1`)).toBe(`(x > (- 1))`);
        expect(showPrecedence(`x=-1`)).toBe(`(x = (- 1))`);
        expect(showPrecedence(`x<>-1`)).toBe(`(x <> (- 1))`);
        expect(showPrecedence(`x<=-1`)).toBe(`(x <= (- 1))`);
        expect(showPrecedence(`x>=-1`)).toBe(`(x >= (- 1))`);
        expect(showPrecedence(`x*-1`)).toBe(`(x * (- 1))`);
        expect(showPrecedence(`x/-1`)).toBe(`(x / (- 1))`);
        expect(showPrecedence(`x+-1`)).toBe(`(x + (- 1))`);
        expect(showPrecedence(`x-+1`)).toBe(`(x - (+ 1))`);
        expect(showPrecedence(`x<<-1`)).toBe(`(x << (- 1))`);
        expect(showPrecedence(`x>>-1`)).toBe(`(x >> (- 1))`);
        expect(showPrecedence(`x<<=-1`)).toBe(`(x <<= (- 1))`);
        expect(showPrecedence(`x<->-1`)).toBe(`(x <-> (- 1))`);
        expect(showPrecedence(`x=+1`)).toBe(`(x = (+ 1))`);
      });
    });

    // Separately test the isPostgresqlOtherOperator() predicate
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
      });

      // ~ ! @ # & | ` ?
      it("allows for single-letter operators", () => {
        expect(isPostgresqlOtherOperator("~")).toBe(true);
        expect(isPostgresqlOtherOperator("!")).toBe(true);
        expect(isPostgresqlOtherOperator("@")).toBe(true);
        expect(isPostgresqlOtherOperator("#")).toBe(true);
        expect(isPostgresqlOtherOperator("&")).toBe(true);
        expect(isPostgresqlOtherOperator("|")).toBe(true);
        expect(isPostgresqlOtherOperator("`")).toBe(true);
        expect(isPostgresqlOtherOperator("?")).toBe(true);
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

  notDialect(["postgresql", "plpgsql"], () => {
    it("does not support weird Postgres operators", () => {
      expect(() => parse(`x ||/ y`)).toThrow();
    });
  });
});
