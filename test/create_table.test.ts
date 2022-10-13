import { parse, show } from "../src/parser";

describe("create table", () => {
  function test(sql: string) {
    expect(show(parse(sql))).toBe(sql);
  }

  it("parses simple CREATE TABLE statement", () => {
    test("CREATE TABLE foo");
    test("CREATE TEMPORARY TABLE foo");
    test("CREATE TABLE IF NOT EXISTS foo");
    test(
      "CREATE /*c1*/ TEMPORARY /*c1*/ TABLE /*c1*/ IF NOT EXISTS /*c1*/ foo"
    );
  });
});
