import { dialect, showPrecedence } from "../test_utils";

describe("operator precedence", () => {
  // starting with highest precedence and going towards lowest
  dialect("sqlite", () => {
    it("member_expr > negation", () => {
      expect(showPrecedence(`-tbl.col`)).toBe(`(- tbl.col)`);
    });

    it("negation > COLLATE", () => {
      expect(showPrecedence(`-x COLLATE rtrim`)).toBe(`((- x) COLLATE rtrim)`);
      expect(showPrecedence(`+x COLLATE rtrim`)).toBe(`((+ x) COLLATE rtrim)`);
      expect(showPrecedence(`~x COLLATE rtrim`)).toBe(`((~ x) COLLATE rtrim)`);
    });

    it("COLLATE > JSON", () => {
      expect(showPrecedence(`col COLLATE utf8 -> 'items[0]'`)).toBe(
        `((col COLLATE utf8) -> 'items[0]')`
      );
    });
    it("COLLATE > concatenation", () => {
      expect(showPrecedence(`x COLLATE binary || y COLLATE nocase`)).toBe(
        `((x COLLATE binary) || (y COLLATE nocase))`
      );
    });

    it("concatenation and JSON operators have same precedence", () => {
      expect(showPrecedence(`col1 || col2 -> 'field' || ' jr.'`)).toBe(
        `(((col1 || col2) -> 'field') || ' jr.')`
      );
    });

    it("JSON > multiplication", () => {
      expect(showPrecedence(`col1 -> 'items[0]' * 10`)).toBe(`((col1 -> 'items[0]') * 10)`);
    });
    it("concatenation > multiplication", () => {
      expect(showPrecedence(`2 * y || z`)).toBe(`(2 * (y || z))`);
    });

    it("multiplication > addition", () => {
      expect(showPrecedence(`5 + 2 * 3`)).toBe(`(5 + (2 * 3))`);
    });

    it("addition > bitwise operators", () => {
      expect(showPrecedence(`5 + 2 & 3 + 1`)).toBe(`((5 + 2) & (3 + 1))`);
      expect(showPrecedence(`5 + 2 | 3 - 1`)).toBe(`((5 + 2) | (3 - 1))`);
      expect(showPrecedence(`5 + 2 << 3 - 1`)).toBe(`((5 + 2) << (3 - 1))`);
      expect(showPrecedence(`5 + 2 >> 3 - 1`)).toBe(`((5 + 2) >> (3 - 1))`);
    });

    it("bitwise operators > comparison", () => {
      expect(showPrecedence(`5 | 2 > 3 >> 1`)).toBe(`((5 | 2) > (3 >> 1))`);
      expect(showPrecedence(`5 <= 2 & 3`)).toBe(`(5 <= (2 & 3))`);
      expect(showPrecedence(`5 >= 2 << 3`)).toBe(`(5 >= (2 << 3))`);
    });

    it("comparison > NOT", () => {
      expect(showPrecedence(`NOT x > 1`)).toBe(`(NOT (x > 1))`);
    });

    it("NOT > AND", () => {
      expect(showPrecedence(`NOT false AND true`)).toBe(`((NOT false) AND true)`);
    });

    it("AND > OR", () => {
      expect(showPrecedence(`true OR false AND true`)).toBe(`(true OR (false AND true))`);
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("member_expr > negation", () => {
      expect(showPrecedence(`-tbl.col`)).toBe(`(- tbl.col)`);
    });

    // TODO: ! has higher precedence than unary -

    it("negation > multiplication", () => {
      expect(showPrecedence(`-x * y`)).toBe(`((- x) * y)`);
      expect(showPrecedence(`x * +y`)).toBe(`(x * (+ y))`);
      expect(showPrecedence(`~x * y`)).toBe(`((~ x) * y)`);

      expect(showPrecedence(`!x * y`)).toBe(`((! x) * y)`);
    });

    dialect("mysql", () => {
      it("COLLATE > JSON", () => {
        expect(showPrecedence(`col COLLATE utf8 -> 'items[0]'`)).toBe(
          `((col COLLATE utf8) -> 'items[0]')`
        );
      });

      it("JSON > bitwise XOR (^)", () => {
        expect(showPrecedence(`col1 -> 'items[0]' ^ 10`)).toBe(`((col1 -> 'items[0]') ^ 10)`);
      });
    });

    it("bitwise XOR (^) > multiplication", () => {
      expect(showPrecedence(`1 ^ 0 * 10 ^ 8`)).toBe(`((1 ^ 0) * (10 ^ 8))`);
    });

    it("multiplication > addition", () => {
      expect(showPrecedence(`5 + 2 * 3`)).toBe(`(5 + (2 * 3))`);
    });

    it("addition > bit shift", () => {
      expect(showPrecedence(`5 + 2 >> 3 + 1`)).toBe(`((5 + 2) >> (3 + 1))`);
      expect(showPrecedence(`5 + 2 << 3 - 1`)).toBe(`((5 + 2) << (3 - 1))`);
    });

    it("bit shift > bitwise AND", () => {
      expect(showPrecedence(`5 >> 2 & 3 << 1`)).toBe(`((5 >> 2) & (3 << 1))`);
    });

    it("bitwise AND > bitwise OR", () => {
      expect(showPrecedence(`5 & 2 | 3 & 1`)).toBe(`((5 & 2) | (3 & 1))`);
    });

    it("bitwise OR > comparison", () => {
      expect(showPrecedence(`5 | 2 > 3 | 1`)).toBe(`((5 | 2) > (3 | 1))`);
    });

    it("comparison > NOT", () => {
      expect(showPrecedence(`NOT x > 1`)).toBe(`(NOT (x > 1))`);
    });

    it("NOT > AND", () => {
      expect(showPrecedence(`NOT false AND true`)).toBe(`((NOT false) AND true)`);
    });

    it("AND > XOR", () => {
      expect(showPrecedence(`true XOR false AND true XOR false`)).toBe(
        `((true XOR (false AND true)) XOR false)`
      );
    });

    it("XOR > OR", () => {
      expect(showPrecedence(`true OR false XOR true OR false`)).toBe(
        `((true OR (false XOR true)) OR false)`
      );
    });

    it("&& > ||", () => {
      expect(showPrecedence(`true || false && true`)).toBe(`(true || (false && true))`);
    });

    it("&& and AND have same precedence", () => {
      expect(showPrecedence(`true AND false && true AND false`)).toBe(
        `(((true AND false) && true) AND false)`
      );
    });

    it("|| and OR have same precedence", () => {
      expect(showPrecedence(`true OR false || true OR false`)).toBe(
        `(((true OR false) || true) OR false)`
      );
    });

    it("OR > :=", () => {
      expect(showPrecedence(`@foo OR @bar := true OR false`)).toBe(
        `((@foo OR @bar) := (true OR false))`
      );
    });

    it(":= operator is right-associative", () => {
      expect(showPrecedence(`@x := @y := @z`)).toBe(`(@x := (@y := @z))`);
    });
  });

  dialect("bigquery", () => {
    it("member_expr > negation", () => {
      expect(showPrecedence(`-x[1]`)).toBe(`(- x[1])`);
      expect(showPrecedence(`-tbl.col`)).toBe(`(- tbl.col)`);
    });

    it("negation > multiplication", () => {
      expect(showPrecedence(`-x * y`)).toBe(`((- x) * y)`);
      expect(showPrecedence(`x * +y`)).toBe(`(x * (+ y))`);
      expect(showPrecedence(`~x * y`)).toBe(`((~ x) * y)`);
    });

    it("concatenation and multiplication operators have same precedence", () => {
      expect(showPrecedence(`col1 || col2 * col3 || col4`)).toBe(
        `(((col1 || col2) * col3) || col4)`
      );
    });

    it("multiplication > addition", () => {
      expect(showPrecedence(`5 + 2 * 3`)).toBe(`(5 + (2 * 3))`);
    });

    it("addition > bit shift", () => {
      expect(showPrecedence(`5 + 2 >> 3 + 1`)).toBe(`((5 + 2) >> (3 + 1))`);
      expect(showPrecedence(`5 + 2 << 3 - 1`)).toBe(`((5 + 2) << (3 - 1))`);
    });

    it("bit shift > bitwise AND", () => {
      expect(showPrecedence(`5 >> 2 & 3 << 1`)).toBe(`((5 >> 2) & (3 << 1))`);
    });

    it("bitwise AND > bitwise XOR", () => {
      expect(showPrecedence(`5 & 2 ^ 3 & 1`)).toBe(`((5 & 2) ^ (3 & 1))`);
    });

    it("bitwise XOR > bitwise OR", () => {
      expect(showPrecedence(`5 ^ 2 | 3 ^ 1`)).toBe(`((5 ^ 2) | (3 ^ 1))`);
    });

    it("bitwise OR > comparison", () => {
      expect(showPrecedence(`5 | 2 > 3 | 1`)).toBe(`((5 | 2) > (3 | 1))`);
    });

    it("comparison > NOT", () => {
      expect(showPrecedence(`NOT x > 1`)).toBe(`(NOT (x > 1))`);
    });

    it("NOT > AND", () => {
      expect(showPrecedence(`NOT false AND true`)).toBe(`((NOT false) AND true)`);
    });

    it("AND > OR", () => {
      expect(showPrecedence(`true OR false AND true`)).toBe(`(true OR (false AND true))`);
    });
  });

  dialect("postgresql", () => {
    // TODO: . > :: > [] > unary +/-
    it("member_expr > negation", () => {
      expect(showPrecedence(`-tbl.col`)).toBe(`(- tbl.col)`);
    });

    // The precedence of COLLATE & AT TIME ZONE is not documented in the PostgreSQL docs.
    // My experiments show that they have higher precedence as negation, but lower than exponentiation.
    // See: https://stackoverflow.com/questions/73535534/what-is-the-precedence-of-the-collate-operator/77726451#77726451

    it("negation > COLLATE", () => {
      expect(showPrecedence(`-col COLLATE "POSIX"`)).toBe(`((- col) COLLATE "POSIX")`);
      expect(showPrecedence(`+'2' COLLATE "C"`)).toBe(`((+ '2') COLLATE "C")`);
    });

    it("COLLATE > AT TIME ZONE", () => {
      expect(showPrecedence(`foo AT TIME ZONE 'UTC' COLLATE "POSIX"`)).toBe(
        `(foo AT TIME ZONE ('UTC' COLLATE "POSIX"))`
      );
    });

    it("AT TIME ZONE > exponent", () => {
      expect(showPrecedence(`foo ^ bar AT TIME ZONE 'UTC'`)).toBe(
        `(foo ^ (bar AT TIME ZONE 'UTC'))`
      );
    });

    it("exponent > multiplication", () => {
      expect(showPrecedence(`x ^ y * a ^ b`)).toBe(`((x ^ y) * (a ^ b))`);
    });

    it("multiplication > addition", () => {
      expect(showPrecedence(`5 + 2 * 3`)).toBe(`(5 + (2 * 3))`);
    });

    it("addition > any other operator", () => {
      expect(showPrecedence(`5 + 2 & 3`)).toBe(`((5 + 2) & 3)`);
      expect(showPrecedence(`5 + 2 >> 3`)).toBe(`((5 + 2) >> 3)`);
    });

    it("these other operators have the same precedence", () => {
      expect(showPrecedence(`a | b & c >> d`)).toBe(`(((a | b) & c) >> d)`);
      expect(showPrecedence(`a >> b & c | d`)).toBe(`(((a >> b) & c) | d)`);
      expect(showPrecedence(`a |/ b @ c !~~ d`)).toBe(`(((a |/ b) @ c) !~~ d)`);
      expect(showPrecedence(`a | b ~ c & d`)).toBe(`(((a | b) ~ c) & d)`);
    });

    // Technically all these other operators should have the same precedence.
    // But probably doesn't matter in practice.
    // More important to have them working as both unary and binary.
    it("unary ~ has higher precedence than binary ~", () => {
      expect(showPrecedence(`~a ~ b`)).toBe(`((~ a) ~ b)`);
      expect(showPrecedence(`a ~ ~ ~b`)).toBe(`(a ~ (~ (~ b)))`);
    });
    it("unary ~ has lower precedence than addition", () => {
      expect(showPrecedence(`~a + b`)).toBe(`(~ (a + b))`);
    });

    it("any other operator > range containment", () => {
      expect(showPrecedence(`5 >> 2 IN col1`)).toBe(`((5 >> 2) IN col1)`);
      expect(showPrecedence(`5 | 2 LIKE col1 | col2`)).toBe(`((5 | 2) LIKE (col1 | col2))`);
      expect(showPrecedence(`5 & 2 BETWEEN a & b AND c & d`)).toBe(
        `((5 & 2) BETWEEN (a & b) AND (c & d))`
      );
    });

    it("OPERATOR() syntax makes all operators have the same precedence as 'any other operator'", () => {
      expect(showPrecedence(`x OPERATOR(+) y OPERATOR(*) z`)).toBe(
        `((x OPERATOR(+) y) OPERATOR(*) z)`
      );
      expect(showPrecedence(`x OPERATOR(+) y + z`)).toBe(`(x OPERATOR(+) (y + z))`);
    });

    it("range containment > comparison", () => {
      expect(showPrecedence(`x IN y > a IN b`)).toBe(`((x IN y) > (a IN b))`);
    });

    it("comparison > IS", () => {
      expect(showPrecedence(`x > y IS NULL`)).toBe(`((x > y) IS NULL)`);
    });

    it("IS > NOT", () => {
      expect(showPrecedence(`NOT x IS NULL`)).toBe(`(NOT (x IS NULL))`);
    });

    it("NOT > AND", () => {
      expect(showPrecedence(`NOT false AND true`)).toBe(`((NOT false) AND true)`);
    });

    it("AND > OR", () => {
      expect(showPrecedence(`true OR false AND true`)).toBe(`(true OR (false AND true))`);
    });
  });
});
