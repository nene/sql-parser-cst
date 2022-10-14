import { parse, show } from "../src/parser";
import { test } from "./test_utils";

describe("create table", () => {
  it("parses simple CREATE TABLE statement", () => {
    test("CREATE TABLE foo (id INT)");
    test("CREATE TEMPORARY TABLE foo (id INT)");
    test("CREATE TABLE IF NOT EXISTS foo (id INT)");
    test(
      "create /*c1*/ temporary /*c2*/ table /*c3*/ if /*c4*/ not /*c5*/ exists /*c6*/ foo (id INT)"
    );
  });

  it("parses CREATE TABLE with multiple column definitions", () => {
    test("CREATE TABLE foo (id INT, age SMALLINT)");
    test(
      "CREATE TABLE foo /*c1*/ (/*c2*/ id /*c3*/ INT /*c4*/, /*c5*/ age /*c6*/ SMALLINT /*c7*/)"
    );
  });

  describe("column options", () => {
    it("parses multiple options after type", () => {
      test("CREATE TABLE foo (id INT /*c1*/ NOT /*c2*/ NULL /*c3*/ DEFAULT /*c4*/ 5 /*c5*/)");
    });

    function testOption(opt: string) {
      const sql = `CREATE TABLE t (id INT ${opt})`;
      expect(show(parse(sql))).toBe(sql);
    }

    it("NULL / NOT NULL", () => {
      testOption("NULL");
      testOption("NOT NULL");
      testOption("NOT /*c2*/ NULL");
    });

    it("DEFAULT", () => {
      testOption("DEFAULT 10");
      testOption("DEFAULT 5 + 6 > 0 AND true");
      testOption("DEFAULT /*c1*/ 10");
    });

    it("AUTO_INCREMENT", () => {
      testOption("AUTO_INCREMENT");
      testOption("AUTO_increment");
    });
  });
});
