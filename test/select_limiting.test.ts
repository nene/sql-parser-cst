import { test } from "./test_utils";

describe("select limiting", () => {
  it("parses basic LIMIT clause", () => {
    test("SELECT c FROM t LIMIT 25");
    test("SELECT c FROM t LIMIT /*c*/ 25");
  });

  it("parses LIMIT offset,count clause", () => {
    test("SELECT c FROM t LIMIT 100, 25");
    test("SELECT c FROM t LIMIT /*c1*/ 100 /*c2*/ , /*c3*/ 25");
  });

  it("parses LIMIT..OFFSET clause", () => {
    test("SELECT c FROM t LIMIT 25 OFFSET 100");
    test("SELECT c FROM t LIMIT /*c1*/ 25 /*c2*/ OFFSET /*c3*/ 100");
  });
});
