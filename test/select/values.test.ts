import { dialect, test, testWc } from "../test_utils";

describe("VALUES clause/statement", () => {
  dialect("sqlite", () => {
    it("parses separate VALUES statement", () => {
      testWc("VALUES (1, 'Hello', TRUE, NULL)");
      testWc("VALUES (1, 'Hello'), (2, 'World')");
    });

    it("parses UNION of VALUES", () => {
      testWc("VALUES (1, 2) UNION VALUES (3, 4)");
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("parses separate VALUES statement with row-constructor list", () => {
      testWc("VALUES ROW(1, 'Hello', TRUE, NULL)");
      testWc("VALUES ROW (1, 'Hello'), ROW (2, 'World')");
    });

    it("parses UNION of VALUES", () => {
      testWc("VALUES ROW(1, 2) UNION VALUES ROW(3, 4)");
    });
  });

  dialect("bigquery", () => {
    it("does not support a separate VALUES statement", () => {
      expect(() => test("VALUES (1, 2)")).toThrowError();
    });
  });

  dialect("postgresql", () => {
    it("TODO:postgres", () => {
      expect(true).toBe(true);
    });
  });
});
