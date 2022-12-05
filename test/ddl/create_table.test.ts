import { dialect, test } from "../test_utils";

describe("create table", () => {
  it("supports simple CREATE TABLE statement", () => {
    test("CREATE TABLE foo (id INT)");
    test("CREATE /*c1*/ TABLE /*c2*/ foo /*c3*/ (id INT)");
  });

  it("supports CREATE TABLE with multiple column definitions", () => {
    test("CREATE TABLE foo (id INT, age SMALLINT)");
    test(
      "CREATE TABLE foo /*c1*/ (/*c2*/ id /*c3*/ INT /*c4*/, /*c5*/ age /*c6*/ SMALLINT /*c7*/)"
    );
  });

  dialect("sqlite", () => {
    it("supports columns without type", () => {
      test("CREATE TEMP TABLE foo (id, name)");
      test("CREATE TEMP TABLE foo (id NOT NULL)");
    });
  });

  it("supports CREATE TEMPORARY TABLE", () => {
    test("CREATE TEMPORARY TABLE foo (id INT)");
    test("CREATE /*c1*/ TEMPORARY /*c2*/ TABLE foo (id INT)");
  });

  dialect(["sqlite", "bigquery"], () => {
    it("supports CREATE TEMP TABLE", () => {
      test("CREATE TEMP TABLE foo (id INT)");
    });
  });

  it("supports IF NOT EXISTS", () => {
    test("CREATE TABLE IF NOT EXISTS foo (id INT)");
    test("create table /*c3*/ if /*c4*/ not /*c5*/ exists /*c6*/ foo (id INT)");
  });

  dialect("bigquery", () => {
    it("supports OR REPLACE", () => {
      test("CREATE OR REPLACE TABLE foo (id INT)");
      test("CREATE OR REPLACE TEMPORARY TABLE foo (id INT)");
      test("CREATE /*c1*/ OR /*c2*/ REPLACE /*c3*/ TABLE foo (id INT)");
    });
  });

  describe("CREATE TABLE AS", () => {
    it("supports CREATE TABLE ... AS select", () => {
      test("CREATE TABLE foo AS SELECT 1");
    });

    it("supports CREATE TABLE ... AS (select)", () => {
      test("CREATE TABLE foo AS (SELECT 1)");
    });

    dialect("mysql", () => {
      it("supports CREATE TABLE ...(defs) AS select", () => {
        test("CREATE TABLE foo (id INT) AS SELECT 1");
      });
    });
  });
});
