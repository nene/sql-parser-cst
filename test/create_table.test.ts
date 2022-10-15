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

  describe("data types", () => {
    function testType(type: string) {
      const sql = `CREATE TABLE t (id ${type})`;
      expect(show(parse(sql))).toBe(sql);
    }

    it("numeric types", () => {
      testType("NUMERIC");
      testType("DECIMAL");
      testType("DECIMAL(3)");
      testType("DECIMAL(3, 4)");
      testType("INT");
      testType("INTEGER");
      testType("SMALLINT");
      testType("SMALLINT(5)");
      testType("BIGINT");
      testType("BIGINT(10)");
      testType("FLOAT");
      testType("FLOAT(10)");
      testType("FLOAT(10, 5)");
      testType("DOUBLE");
      testType("DOUBLE(10)");
      testType("DOUBLE(10, 5)");
      testType("BIT");
      testType("BIT(5)");

      testType("DOUBLE /*c1*/(/*c2*/ 10 /*c3*/, /*c4*/ 5 /*c5*/)");
    });

    it("string types", () => {
      testType("VARCHAR");
      testType("CHAR");
      testType("VARCHAR(100)");
      testType("CHAR(15)");
      testType("CHAR /*c1*/(/*c2*/ 123 /*c3*/)");
    });

    it("text types", () => {
      testType("TEXT");
      testType("TEXT(100)");
      testType("TINYTEXT");
      testType("MEDIUMTEXT");
      testType("LONGTEXT");
    });

    it("JSON type", () => {
      testType("JSON");
    });

    it("boolean type", () => {
      testType("BOOLEAN");
    });

    it("blob types", () => {
      testType("BLOB");
      testType("BLOB(255)");
      testType("TINYBLOB");
      testType("MEDIUMBLOB");
      testType("LONGBLOB");
    });

    it("binary types", () => {
      testType("BINARY");
      testType("VARBINARY");
      testType("BINARY(100)");
      testType("VARBINARY(200)");
    });

    it("date types", () => {
      testType("DATE");
      testType("TIME");
      testType("DATETIME");
      testType("TIMESTAMP");
      testType("TIME(4)");
      testType("DATETIME(5)");
      testType("TIMESTAMP(6)");
    });

    it("ENUM and SET types", () => {
      testType("ENUM('foo', 'bar', 'baz')");
      testType("SET('foo', 'bar', 'baz')");
    });
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
      testOption("DEFAULT (5 + 6 > 0 AND true)");
      testOption("DEFAULT /*c1*/ 10");
    });

    it("AUTO_INCREMENT", () => {
      testOption("AUTO_INCREMENT");
      testOption("AUTO_increment");
    });

    it("UNIQUE KEY / PRIMARY KEY", () => {
      testOption("KEY");
      testOption("UNIQUE");
      testOption("UNIQUE KEY");
      testOption("PRIMARY KEY");
      testOption("UNIQUE /*c*/ KEY");
      testOption("PRIMARY /*c*/ KEY");
    });

    it("COMMENT", () => {
      testOption("COMMENT 'Hello, world!'");
      testOption("COMMENT = 'My comment'");
      testOption("COMMENT /*c*/ 'Hi'");
      testOption("COMMENT /*c1*/ = /*c2*/ 'Hi'");
    });
  });
});
