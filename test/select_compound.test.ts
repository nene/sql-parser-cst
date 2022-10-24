import { test } from "./test_utils";

describe("compound select", () => {
  it("parses basic UNION", () => {
    test("SELECT 1 UNION SELECT 2");
  });

  it("parses UNION ALL|DISTINCT", () => {
    test("SELECT 1 UNION ALL SELECT 2");
    test("SELECT 1 UNION DISTINCT SELECT 2");
  });
});
