import { DialectName } from "../../src/ParserOptions";
import { dialect, parse, preserveAll, show } from "../test_utils";

describe("data types", () => {
  function testType(type: string) {
    const sql = `CREATE TABLE t (id ${type})`;
    expect(show(parse(sql, preserveAll))).toBe(sql);
  }

  function testTypeWithLength(type: string) {
    testType(type);
    testType(`${type}(5)`);
  }

  function testTypesByDialect(
    rules: { type: string; lang: DialectName[] }[],
    testFn: (type: string) => void = testType
  ) {
    rules.forEach(({ type, lang }) => {
      dialect(["sqlite", ...lang], () => {
        it(`supports ${type}`, () => {
          testFn(type);
        });
      });
    });
  }

  describe("numeric types", () => {
    testTypesByDialect(
      [
        { type: "NUMERIC", lang: ["mysql", "bigquery"] },
        { type: "DECIMAL", lang: ["mysql", "bigquery"] },
        { type: "FIXED", lang: ["mysql"] },
        { type: "DEC", lang: ["mysql"] },
        { type: "BIGNUMERIC", lang: ["bigquery"] },
        { type: "BIGDECIMAL", lang: ["bigquery"] },
      ],
      (type) => {
        testType(type);
        testType(`${type}(3)`);
        testType(`${type}(3, 4)`);
      }
    );
  });

  describe("integer types", () => {
    testTypesByDialect(
      [
        { type: "INT", lang: ["mysql", "bigquery"] },
        { type: "INTEGER", lang: ["mysql", "bigquery"] },
        { type: "TINYINT", lang: ["mysql", "bigquery"] },
        { type: "SMALLINT", lang: ["mysql", "bigquery"] },
        { type: "BIGINT", lang: ["mysql", "bigquery"] },
        { type: "MEDIUMINT", lang: ["mysql"] },
        { type: "INT64", lang: ["bigquery"] },
        { type: "BYTEINT", lang: ["bigquery"] },
      ],
      testTypeWithLength
    );
  });

  describe("real types", () => {
    testTypesByDialect([
      { type: "FLOAT", lang: ["mysql"] },
      { type: "DOUBLE", lang: ["mysql"] },
      { type: "REAL", lang: ["mysql"] },
      { type: "DOUBLE PRECISION", lang: ["mysql"] },
      { type: "FLOAT64", lang: ["bigquery"] },
    ]);
  });

  describe("string types", () => {
    testTypesByDialect(
      [
        { type: "VARCHAR", lang: ["mysql"] },
        { type: "NVARCHAR", lang: ["mysql"] },
        { type: "CHAR", lang: ["mysql"] },
        { type: "NCHAR", lang: ["mysql"] },
        { type: "TEXT", lang: ["mysql"] },
        { type: "TINYTEXT", lang: ["mysql"] },
        { type: "MEDIUMTEXT", lang: ["mysql"] },
        { type: "LONGTEXT", lang: ["mysql"] },
        { type: "VARYING CHARACTER", lang: ["mysql"] },
        { type: "NATIVE CHARACTER", lang: ["mysql"] },
        { type: "LONGTEXT", lang: ["mysql"] },
        { type: "STRING", lang: ["bigquery"] },
      ],
      testTypeWithLength
    );
  });

  it("JSON type", () => {
    testType("JSON");
  });

  describe("boolean type", () => {
    testTypesByDialect([
      { type: "BOOL", lang: ["mysql", "bigquery"] },
      { type: "BOOLEAN", lang: ["mysql"] },
    ]);
  });

  describe("blob types", () => {
    testTypesByDialect(
      [
        { type: "BLOB", lang: ["mysql"] },
        { type: "TINYBLOB", lang: ["mysql"] },
        { type: "MEDIUMBLOB", lang: ["mysql"] },
        { type: "LONGBLOB", lang: ["mysql"] },
        { type: "BYTES", lang: ["bigquery"] },
      ],
      testTypeWithLength
    );
  });

  describe("binary types", () => {
    testTypesByDialect(
      [
        { type: "BIT", lang: ["mysql"] },
        { type: "BINARY", lang: ["mysql"] },
        { type: "VARBINARY", lang: ["mysql"] },
      ],
      testTypeWithLength
    );
  });

  describe("date types", () => {
    testTypesByDialect(
      [
        { type: "DATE", lang: ["mysql", "bigquery"] },
        { type: "DATETIME", lang: ["mysql", "bigquery"] },
        { type: "TIME", lang: ["mysql", "bigquery"] },
        { type: "TIMESTAMP", lang: ["mysql", "bigquery"] },
        { type: "YEAR", lang: ["mysql"] },
      ],
      testTypeWithLength
    );
  });

  dialect("mysql", () => {
    it("ENUM and SET types", () => {
      testType("ENUM('foo', 'bar', 'baz')");
      testType("SET('foo', 'bar', 'baz')");
    });
  });

  dialect("bigquery", () => {
    it("ARRAY type", () => {
      testType("ARRAY");
    });
    it("STRUCT type", () => {
      testType("STRUCT");
    });
    it("GEOGRAPHY type", () => {
      testType("GEOGRAPHY");
    });
    it("INTERVAL type", () => {
      testType("INTERVAL");
    });
  });

  dialect("sqlite", () => {
    it("ANY type", () => {
      testType("ANY");
    });

    // SQLite is super-loose when it comes to data types
    it("any sequence of strings is a valid data type", () => {
      testType("BLAH");
      testType("KINDOF INTEGER");
      testType("MY CUSTOM MADEUP DATATYPLIKE THINGIE");
    });
  });
});
