import { dialect, notDialect, parse, showPrecedence, testExprWc } from "../test_utils";

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
  });

  notDialect(["postgresql", "plpgsql"], () => {
    it("does not support weird Postgres operators", () => {
      expect(() => parse(`x ||/ y`)).toThrow();
    });
  });
});
