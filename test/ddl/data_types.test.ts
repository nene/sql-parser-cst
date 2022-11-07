import { dialect, parse, preserveAll, show } from "../test_utils";

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
  });

  it("integer types", () => {
    testType("INT");
    testType("INT(5)");
    testType("INTEGER");
    testType("INTEGER(5)");
    testType("TINYINT");
    testType("TINYINT(5)");
    testType("SMALLINT");
    testType("SMALLINT(5)");
    testType("MEDIUMINT");
    testType("MEDIUMINT(5)");
    testType("BIGINT");
    testType("BIGINT(10)");
    testType("INT2");
    testType("INT8");
  });

  it("real types", () => {
    testType("FLOAT");
    testType("FLOAT(10)");
    testType("FLOAT(10, 5)");
    testType("DOUBLE");
    testType("DOUBLE(10)");
    testType("DOUBLE(10, 5)");
    testType("REAL");
    testType("REAL(10)");
    testType("REAL(10, 5)");
    testType("DOUBLE PRECISION(10, 5)");
    testType("DOUBLE PRECISION /*c1*/(/*c2*/ 10 /*c3*/, /*c4*/ 5 /*c5*/)");
  });

  it("string types", () => {
    testType("VARCHAR");
    testType("VARCHAR(100)");
    testType("NVARCHAR");
    testType("NVARCHAR(100)");
    testType("CHAR");
    testType("CHAR(15)");
    testType("NCHAR");
    testType("NCHAR(15)");
    testType("TEXT");
    testType("TEXT(100)");
    testType("TINYTEXT");
    testType("MEDIUMTEXT");
    testType("LONGTEXT");
    testType("VARYING CHARACTER");
    testType("VARYING CHARACTER(100)");
    testType("NATIVE CHARACTER");
    testType("NATIVE CHARACTER(100)");
    testType("CLOB");
    testType("CLOB(100)");
    testType("CHAR /*c1*/(/*c2*/ 123 /*c3*/)");
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
    testType("BIT");
    testType("BIT(5)");
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

  dialect("sqlite", () => {
    it("ANY type", () => {
      testType("ANY");
    });
  });
});
