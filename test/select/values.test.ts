import { dialect, test } from "../test_utils";

describe("VALUES clause/statement", () => {
  dialect("sqlite", () => {
    it("parses separate VALUES statement", () => {
      test("VALUES (1, 'Hello', TRUE, NULL)");
      test("VALUES (1, 'Hello'), (2, 'World')");
      test("VALUES /*c1*/ (1) /*c2*/,/*c3*/ (2)");
    });

    it("parses UNION of VALUES", () => {
      test("VALUES (1, 2) UNION VALUES (3, 4)");
      test("VALUES (1) /*c1*/ UNION /*c2*/ VALUES (2)");
    });
  });

  dialect("mysql", () => {
    it("parses separate VALUES statement with row-constructor list", () => {
      test("VALUES ROW(1, 'Hello', TRUE, NULL)");
      test("VALUES ROW(1, 'Hello'), ROW(2, 'World')");
      test("VALUES /*c1*/ ROW /*c*/(1) /*c2*/,/*c3*/ ROW /*cc*/(2)");
    });

    it("parses UNION of VALUES", () => {
      test("VALUES ROW(1, 2) UNION VALUES ROW(3, 4)");
      test("VALUES ROW(1) /*c1*/ UNION /*c2*/ VALUES ROW(2)");
    });
  });

  dialect("bigquery", () => {
    it("does not support a separate VALUES statement", () => {
      expect(() => test("VALUES (1, 2)")).toThrowError();
    });
  });
});
