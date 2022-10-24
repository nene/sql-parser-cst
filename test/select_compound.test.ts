import { test } from "./test_utils";

describe("compound select", () => {
  it("parses UNION [ALL|DISTINCT]", () => {
    test("SELECT 1 UNION SELECT 2");
    test("SELECT 1 UNION ALL SELECT 2");
    test("SELECT 1 UNION DISTINCT SELECT 2");
    test("SELECT 1 /*c1*/ UNION /*c2*/ DISTINCT /*c3*/ SELECT 2");
  });

  it("parses EXCEPT [ALL|DISTINCT]", () => {
    test("SELECT 1 EXCEPT SELECT 2");
    test("SELECT 1 EXCEPT ALL SELECT 2");
    test("SELECT 1 EXCEPT DISTINCT SELECT 2");
    test("SELECT 1 /*c1*/ EXCEPT /*c2*/ ALL /*c3*/ SELECT 2");
  });
});
