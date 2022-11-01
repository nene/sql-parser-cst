import { dialect, showPrecedence } from "../test_utils";

describe("operator precedence", () => {
  // starting with highest precedence and going towards lowest
  dialect("sqlite", () => {
    it("negation > COLLATE", () => {
      expect(showPrecedence(`-x COLLATE rtrim`)).toBe(`((- x) COLLATE rtrim)`);
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

    it("addition > comparison", () => {
      expect(showPrecedence(`5 + 2 > 3 + 1`)).toBe(`((5 + 2) > (3 + 1))`);
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

  dialect("mysql", () => {
    it("negation > multiplication", () => {
      expect(showPrecedence(`-x * y`)).toBe(`((- x) * y)`);
      expect(showPrecedence(`x * -y`)).toBe(`(x * (- y))`);
    });

    it("COLLATE > JSON", () => {
      expect(showPrecedence(`col COLLATE utf8 -> 'items[0]'`)).toBe(
        `((col COLLATE utf8) -> 'items[0]')`
      );
    });

    it("JSON > multiplication", () => {
      expect(showPrecedence(`col1 -> 'items[0]' * 10`)).toBe(`((col1 -> 'items[0]') * 10)`);
    });

    it("multiplication > addition", () => {
      expect(showPrecedence(`5 + 2 * 3`)).toBe(`(5 + (2 * 3))`);
    });

    it("addition > comparison", () => {
      expect(showPrecedence(`5 + 2 > 3 + 1`)).toBe(`((5 + 2) > (3 + 1))`);
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
  });
});
