import { dialect, test } from "./test_utils";

describe("select WINDOW", () => {
  dialect("sqlite", () => {
    it("supports named window definition", () => {
      test("SELECT col FROM t WINDOW my_win AS (ORDER BY col1)");
      test(
        "SELECT col FROM t WINDOW /*c1*/ my_win /*c2*/ AS /*c3*/ (/*c4*/ ORDER /*c5*/ BY /*c6*/ col1 /*c7*/)"
      );
    });

    it("supports multiple named window definitions", () => {
      test("SELECT col FROM t WINDOW win1 AS (basewin1), win2 AS (basewin2)");
    });
  });
});
