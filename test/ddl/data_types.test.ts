import { DialectName } from "../../src/ParserOptions";
import { dialect, parseExpr, test, withComments } from "../test_utils";

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
        { type: "NUMERIC", lang: ["mysql", "bigquery", "postgresql", "plpgsql"] },
        { type: "DECIMAL", lang: ["mysql", "bigquery", "postgresql", "plpgsql"] },
        { type: "FIXED", lang: ["mysql"] },
        { type: "DEC", lang: ["mysql", "postgresql", "plpgsql"] },
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
        { type: "INT", lang: ["mysql", "bigquery", "postgresql", "plpgsql"] },
        { type: "INTEGER", lang: ["mysql", "bigquery", "postgresql", "plpgsql"] },
        { type: "TINYINT", lang: ["mysql", "bigquery"] },
        { type: "SMALLINT", lang: ["mysql", "bigquery", "postgresql", "plpgsql"] },
        { type: "BIGINT", lang: ["mysql", "bigquery", "postgresql", "plpgsql"] },
        { type: "MEDIUMINT", lang: ["mysql"] },
        { type: "INT64", lang: ["bigquery"] },
        { type: "BYTEINT", lang: ["bigquery"] },
        { type: "INT2", lang: ["postgresql", "plpgsql"] },
        { type: "INT4", lang: ["postgresql", "plpgsql"] },
        { type: "INT8", lang: ["postgresql", "plpgsql"] },
        { type: "SMALLSERIAL", lang: ["postgresql", "plpgsql"] },
        { type: "SERIAL", lang: ["postgresql", "plpgsql"] },
        { type: "BIGSERIAL", lang: ["postgresql", "plpgsql"] },
        { type: "SERIAL2", lang: ["postgresql", "plpgsql"] },
        { type: "SERIAL4", lang: ["postgresql", "plpgsql"] },
        { type: "SERIAL8", lang: ["postgresql", "plpgsql"] },
      ],
      testTypeWithLength
    );
  });

  describe("real types", () => {
    testTypesByDialect([
      { type: "FLOAT", lang: ["mysql"] },
      { type: "DOUBLE", lang: ["mysql"] },
      { type: "REAL", lang: ["mysql", "postgresql", "plpgsql"] },
      { type: "DOUBLE PRECISION", lang: ["mysql", "postgresql", "plpgsql"] },
      { type: "FLOAT64", lang: ["bigquery"] },
      { type: "FLOAT4", lang: ["postgresql", "plpgsql"] },
      { type: "FLOAT8", lang: ["postgresql", "plpgsql"] },
    ]);
  });

  describe("string types", () => {
    testTypesByDialect(
      [
        { type: "VARCHAR", lang: ["mysql", "postgresql", "plpgsql"] },
        { type: "NVARCHAR", lang: ["mysql"] },
        { type: "CHAR", lang: ["mysql", "postgresql", "plpgsql"] },
        { type: "CHARACTER", lang: ["postgresql", "plpgsql"] },
        { type: "TEXT", lang: ["mysql", "postgresql", "plpgsql"] },
        { type: "TINYTEXT", lang: ["mysql"] },
        { type: "MEDIUMTEXT", lang: ["mysql"] },
        { type: "LONGTEXT", lang: ["mysql"] },
        { type: "VARYING CHARACTER", lang: ["mysql"] },
        { type: "CHARACTER VARYING", lang: ["postgresql", "plpgsql"] },
        { type: "CHAR VARYING", lang: ["postgresql", "plpgsql"] },
        { type: "NATIVE CHARACTER", lang: ["mysql"] },
        { type: "NCHAR", lang: ["postgresql", "plpgsql", "mysql"] },
        { type: "NATIONAL CHAR", lang: ["postgresql", "plpgsql"] },
        { type: "NATIONAL CHARACTER", lang: ["postgresql", "plpgsql"] },
        { type: "NCHAR VARYING", lang: ["postgresql", "plpgsql"] },
        { type: "NATIONAL CHAR VARYING", lang: ["postgresql", "plpgsql"] },
        { type: "NATIONAL CHARACTER VARYING", lang: ["postgresql", "plpgsql"] },
        { type: "LONGTEXT", lang: ["mysql"] },
        { type: "STRING", lang: ["bigquery"] },
      ],
      testTypeWithLength
    );
  });

  it("JSON type", () => {
    testType("JSON");
  });

  dialect(["postgresql", "plpgsql"], () => {
    it("JSONB type", () => {
      testType("JSONB");
    });
  });

  describe("boolean type", () => {
    testTypesByDialect([
      { type: "BOOL", lang: ["mysql", "bigquery", "postgresql", "plpgsql"] },
      { type: "BOOLEAN", lang: ["mysql", "postgresql", "plpgsql"] },
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
        { type: "BYTEA", lang: ["postgresql", "plpgsql"] },
      ],
      testTypeWithLength
    );
  });

  describe("binary types", () => {
    testTypesByDialect(
      [
        { type: "BIT", lang: ["mysql", "postgresql", "plpgsql"] },
        { type: "BIT VARYING", lang: ["postgresql", "plpgsql"] },
        { type: "VARBIT", lang: ["postgresql", "plpgsql"] },
        { type: "BINARY", lang: ["mysql"] },
        { type: "VARBINARY", lang: ["mysql"] },
      ],
      testTypeWithLength
    );
  });

  describe("date types", () => {
    testTypesByDialect(
      [
        { type: "DATE", lang: ["mysql", "bigquery", "postgresql", "plpgsql"] },
        { type: "DATETIME", lang: ["mysql", "bigquery"] },
        { type: "TIME", lang: ["mysql", "bigquery", "postgresql", "plpgsql"] },
        { type: "TIMESTAMP", lang: ["mysql", "bigquery", "postgresql", "plpgsql"] },
        { type: "YEAR", lang: ["mysql"] },
        { type: "TIMETZ", lang: ["postgresql", "plpgsql"] },
        { type: "TIMESTAMPTZ", lang: ["postgresql", "plpgsql"] },
      ],
      testTypeWithLength
    );

    dialect(["postgresql", "plpgsql"], () => {
      it("supports TIME & TIMESTAMP WITH TIME ZONE", () => {
        testType("TIME WITH TIME ZONE");
        testType("TIMESTAMP WITH TIME ZONE");
      });

      it("supports TIME & TIMESTAMP WITHOUT TIME ZONE", () => {
        testType("TIME WITHOUT TIME ZONE");
        testType("TIMESTAMP WITHOUT TIME ZONE");
      });

      it("supports parameterized TIME & TIMESTAMP WITH/WITHOUT TIME ZONE", () => {
        testType("TIME (10) WITHOUT TIME ZONE");
        testType("TIMESTAMP (8) WITH TIME ZONE");
      });
    });
  });

  describe("interval type", () => {
    dialect(["bigquery", "postgresql", "plpgsql"], () => {
      it("supports INTERVAL", () => {
        testType("INTERVAL");
      });
    });

    dialect(["postgresql", "plpgsql"], () => {
      it("supports restricted INTERVAL type", () => {
        testType("INTERVAL");
        testType("INTERVAL YEAR");
        testType("INTERVAL MONTH");
        testType("INTERVAL DAY");
        testType("INTERVAL HOUR");
        testType("INTERVAL MINUTE");
        testTypeWithLength("INTERVAL SECOND");
        testType("INTERVAL YEAR TO MONTH");
        testType("INTERVAL DAY TO HOUR");
        testType("INTERVAL DAY TO MINUTE");
        testTypeWithLength("INTERVAL DAY TO SECOND");
        testType("INTERVAL HOUR TO MINUTE");
        testTypeWithLength("INTERVAL HOUR TO SECOND");
        testTypeWithLength("INTERVAL MINUTE TO SECOND");
      });
    });
  });

  dialect(["mysql", "mariadb"], () => {
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

  dialect(["postgresql", "plpgsql"], () => {
    it("supports array types", () => {
      testType("INT[]");
      testTypeWc("INT [ ]");
    });

    it("supports array types with bounds", () => {
      testType("INT[5]");
      testTypeWc("INT [ 10 ]");
    });

    it("supports multi-dimensional array types", () => {
      testType("INT[][]");
      testTypeWc("INT [ ] [ ]");
      testTypeWc("INT [ 5 ] [ 6 ]");
    });
  });

  dialect(["postgresql", "plpgsql"], () => {
    describe("postgres-specific data types", () => {
      [
        "BOX",
        "CIDR",
        "CIRCLE",
        "INET",
        "LINE",
        "LSEG",
        "MACADDR",
        "MACADDR8",
        "MONEY",
        "PATH",
        "PG_LSN",
        "PG_SNAPSHOT",
        "POINT",
        "POLYGON",
        "TSQUERY",
        "TSVECTOR",
        "TXID_SNAPSHOT",
        "UUID",
        "XML",
        // range types
        "int4range",
        "int8range",
        "numrange",
        "tsrange",
        "tstzrange",
        "daterange",
        // multirange types
        "int4multirange",
        "int8multirange",
        "nummultirange",
        "tsmultirange",
        "tstzmultirange",
        "datemultirange",
        // object identifer types
        "oid",
        "regclass",
        "regcollation",
        "regconfig",
        "regdictionary",
        "regnamespace",
        "regoper",
        "regoperator",
        "regproc",
        "regprocedure",
        "regrole",
        "regtype",
      ].forEach((type) => {
        it(`supports ${type}`, () => {
          testType(type);
        });
      });
    });

    it("supports custom data types", () => {
      testType("COMPLEX");
      testType("MY_CUSTOM_TYPE");
    });

    it("supports SETOF types", () => {
      testType("SETOF INT");
      testType("SETOF VARCHAR (100)");
    });

    it("supports schema-qualified types", () => {
      testType("public.my_type");
    });

    it("supports geometry types", () => {
      testType("GEOMETRY");
      testType("GEOMETRY(POLYGON, 3395)");
      testType("GEOMETRY(POINT, 4326)");
      testType("GEOMETRY(LINESTRINGZM, 4269)");
    });

    it("parses custom data types as identifiers", () => {
      expect(parseExpr(`foo :: GEOMETRY`)).toMatchInlineSnapshot(`
        {
          "left": {
            "name": "foo",
            "text": "foo",
            "type": "identifier",
          },
          "operator": "::",
          "right": {
            "name": "GEOMETRY",
            "text": "GEOMETRY",
            "type": "identifier",
          },
          "type": "cast_operator_expr",
        }
      `);
    });

    it("parses builtin data types as keywords", () => {
      expect(parseExpr(`foo :: Character`)).toMatchInlineSnapshot(`
        {
          "left": {
            "name": "foo",
            "text": "foo",
            "type": "identifier",
          },
          "operator": "::",
          "right": {
            "name": {
              "name": "CHARACTER",
              "text": "Character",
              "type": "keyword",
            },
            "type": "data_type_name",
          },
          "type": "cast_operator_expr",
        }
      `);
    });
  });
});
