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

  it("supports subselect in parenthesis", () => {
    test("SELECT t.col FROM (SELECT x FROM tbl) AS t");
    test("SELECT t.col FROM (/*c1*/ SELECT x FROM tbl /*c2*/) /*c3*/ AS /*c4*/ t");
  });
});