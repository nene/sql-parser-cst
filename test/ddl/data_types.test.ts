import { DialectName } from "../../src/ParserOptions";
import { dialect, test, withComments } from "../test_utils";

describe("data types", () => {
  function testType(type: string) {
    test(`CREATE TABLE t (id ${withComments(type)})`);
  }

  function testTypeWc(type: string) {
    testType(withComments(type));
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
    describe("ARRAY and STRUCT types", () => {
      it("basic ARRAY type", () => {
        testType("ARRAY");
      });
      it("basic STRUCT type", () => {
        testType("STRUCT");
      });

      it("parameterized ARRAY type", () => {
        testType("ARRAY<INT64>");
        testType("ARRAY<BYTES(5)>");
        testTypeWc("ARRAY < INT64 >");
      });

      it("nested parameterized ARRAY type", () => {
        testType("ARRAY<ARRAY<STRING>>");
      });

      it("parameterized STRUCT type (unnamed parameter)", () => {
        testType("STRUCT<INT64>");
        testType("STRUCT<BYTES(5)>");
        testTypeWc("STRUCT < INT64 >");
      });

      it("parameterized STRUCT type (named parameters)", () => {
        testType("STRUCT<x INT64, y INT64>");
        testType("STRUCT<name STRING(15)>");
        testTypeWc("STRUCT < name STRING >");
      });

      it("nested parameterized STRUCT type", () => {
        testType("STRUCT<x STRUCT<name STRING>>");
      });

      it("nested STRUCTs and ARRAYs", () => {
        testType("ARRAY<STRUCT<x ARRAY<INT64>>>");
      });

      describe("array element constraints", () => {
        it("not-nullable ARRAY", () => {
          testType("ARRAY<INT64 NOT NULL>");
        });

        it("string array with collation", () => {
          testType("ARRAY<STRING COLLATE 'und:ci'>");
        });
      });

      describe("struct field constraints", () => {
        it("not-nullable STRUCT", () => {
          testType("STRUCT<name STRING NOT NULL>");
        });

        it("struct field with collation", () => {
          testType("STRUCT<name STRING COLLATE 'und:ci'>");
        });

        it("struct field with default", () => {
          testType("STRUCT<name STRING DEFAULT 'unknown'>");
        });

        it("struct field with options", () => {
          testType("STRUCT<name STRING OPTIONS(description='a string field')>");
        });

        it("struct field with multiple constraints", () => {
          testType("STRUCT<id INT NOT NULL OPTIONS(description='GUID') DEFAULT 1>");
        });
      });
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
