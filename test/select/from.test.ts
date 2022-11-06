import { test } from "../test_utils";

describe("select FROM", () => {
  it("supports basic syntax", () => {
    test("SELECT col FROM tbl");
    test("SELECT col from tbl");
    test("SELECT /*c1*/ col /*c2*/ FROM /*c3*/ tbl");
  });

  it("supports table alias", () => {
    test("SELECT t.col FROM my_db.my_long_table_name AS t");
    test("SELECT t.col FROM my_db.my_long_table_name t");
    test("SELECT t.col FROM db.tbl /*c1*/ AS /*c2*/ t");
  });

  it("supports table name in parenthesis", () => {
    test("SELECT col FROM (tbl)");
    test("SELECT t.col FROM (db.tbl) AS t");
    test("SELECT t.col FROM (db.tbl) t");
    test("SELECT t.col FROM (/*c1*/ db.tbl /*c2*/) /*c3*/ AS /*c4*/ t");
  });

  it("supports aliased table name in parenthesis", () => {
    test("SELECT t.col FROM (db.tbl AS t)");
    test("SELECT t.col FROM (db.tbl t)");
  });

  it("supports multi-nested table name in parenthesis", () => {
    test("SELECT t.col FROM (((tbl) AS t) AS t1) AS t2");
  });

  it("supports subselect in parenthesis", () => {
    test("SELECT t.col FROM (SELECT x FROM tbl) AS t");
    test("SELECT t.col FROM (/*c1*/ SELECT x FROM tbl /*c2*/) /*c3*/ AS /*c4*/ t");
  });

  it("supports comma-joined tables in parenthesis", () => {
    test("SELECT t.col FROM (tbl1, tbl2) AS t");
  });

  it("supports joined tables in parenthesis", () => {
    test("SELECT t.col FROM (tbl1 JOIN tbl2) AS t");
  });

  describe("table functions", () => {
    it("supports table-valued functions", () => {
      test("SELECT * FROM generate_series(5, 10)");
    });
    it("supports schema-scoped table-valued functions", () => {
      test("SELECT * FROM my_schema.my_func(5, 10)");
    });
    it("supports combining table-functions with joins", () => {
      test("SELECT * FROM func1(5, 10) JOIN func2(8)");
    });
  });
});
