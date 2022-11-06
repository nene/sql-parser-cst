import { dialect, test } from "../test_utils";

describe("create table", () => {
  it("parses simple CREATE TABLE statement", () => {
    test("CREATE TABLE foo (id INT)");
    test("CREATE TEMPORARY TABLE foo (id INT)");
    test("CREATE TABLE IF NOT EXISTS foo (id INT)");
    test(
      "create /*c1*/ temporary /*c2*/ table /*c3*/ if /*c4*/ not /*c5*/ exists /*c6*/ foo (id INT)"
    );
  });

  dialect("sqlite", () => {
    it("supports CREATE TEMP TABLE", () => {
      test("CREATE TEMP TABLE foo (id INT)");
    });
  });

  dialect("sqlite", () => {
    it("supports columns without type", () => {
      test("CREATE TEMP TABLE foo (id, name)");
      test("CREATE TEMP TABLE foo (id NOT NULL)");
    });
  });

  it("parses CREATE TABLE with multiple column definitions", () => {
    test("CREATE TABLE foo (id INT, age SMALLINT)");
    test(
      "CREATE TABLE foo /*c1*/ (/*c2*/ id /*c3*/ INT /*c4*/, /*c5*/ age /*c6*/ SMALLINT /*c7*/)"
    );
  });
});
