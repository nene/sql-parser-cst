import { dialect, test } from "./test_utils";

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
});
