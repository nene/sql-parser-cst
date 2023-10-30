import { dialect, test, testWc } from "../test_utils";

describe("VALUES clause/statement", () => {
  dialect(["sqlite", "postgresql"], () => {
    it("parses separate VALUES statement", () => {
      testWc("VALUES (1, 'Hello', TRUE, NULL)");
      testWc("VALUES (1, 'Hello'), (2, 'World')");
    });

    it("parses UNION of VALUES", () => {
      testWc("VALUES (1, 2) UNION VALUES (3, 4)");
    });
  });

  // The following should be also valid in SQLite according to documentation,
  // but in practice it produces a syntax error.
  dialect("postgresql", () => {
    it("supports VALUES followed by ORDER BY", () => {
      testWc("VALUES (1, 2), (3, 4) ORDER BY 2");
    });

    it("supports VALUES followed by LIMIT", () => {
      testWc("VALUES (1, 2), (3, 4) LIMIT 1");
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
});
