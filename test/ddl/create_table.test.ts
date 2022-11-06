import { dialect, parse, preserveAll, show, test } from "../test_utils";

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

  it("parses CREATE TABLE with multiple column definitions", () => {
    test("CREATE TABLE foo (id INT, age SMALLINT)");
    test(
      "CREATE TABLE foo /*c1*/ (/*c2*/ id /*c3*/ INT /*c4*/, /*c5*/ age /*c6*/ SMALLINT /*c7*/)"
    );
  });

  describe("data types", () => {
    function testType(type: string) {
      const sql = `CREATE TABLE t (id ${type})`;
      expect(show(parse(sql, preserveAll))).toBe(sql);
    }

    it("numeric types", () => {
      testType("NUMERIC");
      testType("NUMERIC(3)");
      testType("NUMERIC(3, 4)");
      testType("FIXED");
      testType("FIXED(3)");
      testType("FIXED(3, 4)");
      testType("DECIMAL");
      testType("DECIMAL(3)");
      testType("DECIMAL(3, 4)");
      testType("DEC");
      testType("DEC(3)");
      testType("DEC(3, 4)");

      testType("INT");
      testType("INT(5)");
      testType("INTEGER");
      testType("INTEGER(5)");
      testType("TINYINT");
      testType("TINYINT(5)");
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
      testType("REAL");
      testType("REAL(10)");
      testType("REAL(10, 5)");
      testType("BIT");
      testType("BIT(5)");

      testType("DOUBLE PRECISION(10, 5)");
      testType("DOUBLE PRECISION /*c1*/(/*c2*/ 10 /*c3*/, /*c4*/ 5 /*c5*/)");
    });

    it("string types", () => {
      testType("VARCHAR");
      testType("NVARCHAR");
      testType("CHAR");
      testType("VARCHAR(100)");
      testType("NVARCHAR(100)");
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
      testType("BOOL");
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
      testType("YEAR");
      testType("YEAR(4)");
    });

    it("ENUM and SET types", () => {
      testType("ENUM('foo', 'bar', 'baz')");
      testType("SET('foo', 'bar', 'baz')");
    });
  });
});
