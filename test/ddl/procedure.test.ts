import { dialect, test, testWc } from "../test_utils";

describe("procedure", () => {
  function testCreateProcedure(BEGIN: string) {
    describe("CREATE PROCEDURE", () => {
      it("supports basic CREATE PROCEDURE", () => {
        testWc(`
          CREATE PROCEDURE foo.bar.baz ( )
          ${BEGIN}
            SELECT 1;
          END
        `);
      });

      it("supports multiple statements in procedure body", () => {
        test(`
          CREATE PROCEDURE tmp_table_query()
          ${BEGIN}
            CREATE TEMP TABLE entries (id INT, name STRING);
            INSERT INTO entries VALUES (1, 'John');
            INSERT INTO entries VALUES (2, 'Mary');
            SELECT * FROM entries;
            DROP TABLE entries;
          END
        `);
      });

      it("supports parameters", () => {
        testWc(`CREATE PROCEDURE multiplicate ( x INT , y INT ) ${BEGIN} SELECT 1; END`);
      });

      it("supports IN/OUT/INOUT parameters", () => {
        testWc(`
          CREATE PROCEDURE multiplicate(
            IN x INT,
            INOUT y INT,
            OUT result INT
          )
          ${BEGIN}
            SELECT x*y;
          END
        `);
      });
      dialect("postgresql", () => {
        it("supports VARIADIC parameters", () => {
          testWc(`
            CREATE PROCEDURE first(
              VARIADIC numbers INT[]
            )
            ${BEGIN}
              SELECT numbers[1];
            END
          `);
        });

        it("supports optional parameter names", () => {
          testWc(`
            CREATE PROCEDURE foo(INT, IN INT, OUT INT, OUT INT)
            AS $$ SELECT $1, $2; $$
          `);
        });

        it("supports default values", () => {
          testWc(`CREATE PROCEDURE foo(x INT = 1, OUT y INT DEFAULT 2) ${BEGIN} SELECT 1; END`);
        });
      });

      it("supports OR REPLACE", () => {
        testWc(`CREATE OR REPLACE PROCEDURE foo() ${BEGIN} SELECT 1; END`);
      });

      dialect(["bigquery"], () => {
        it("supports IF NOT EXISTS", () => {
          testWc("CREATE PROCEDURE IF NOT EXISTS foo() BEGIN SELECT 1; END");
        });

        it("supports OPTIONS(..)", () => {
          testWc("CREATE PROCEDURE foo() OPTIONS (description='hello') BEGIN SELECT 1; END");
        });

        it("supports procedural language statements in procedure body", () => {
          test(`
            CREATE PROCEDURE blah()
            BEGIN
              DECLARE x INT;
              SET x = 0;
            END
          `);
        });

        describe("Apache Spark procedure", () => {
          it("supports loading procedure from PySpark file", () => {
            testWc(`
              CREATE PROCEDURE my_bq_project.my_dataset.spark_proc()
              WITH CONNECTION \`my-project-id.us.my-connection\`
              OPTIONS(engine="SPARK", main_file_uri="gs://my-bucket/my-pyspark-main.py")
              LANGUAGE PYTHON
            `);
          });

          it("supports inline Python procedure", () => {
            test(`
              CREATE PROCEDURE my_proc()
              WITH CONNECTION \`my-project-id.us.my-connection\`
              OPTIONS(engine="SPARK")
              LANGUAGE PYTHON AS R"""
                from pyspark.sql import SparkSession

                # Load data from BigQuery.
                words = spark.read.format("bigquery") \
                  .option("table", "bigquery-public-data:samples.shakespeare") \
                  .load()
              """
            `);
          });
        });
      });

      dialect(["postgresql"], () => {
        describe("procedures in other languages", () => {
          it("supports LANGUAGE SQL", () => {
            testWc("CREATE PROCEDURE foo() AS 'SELECT 1' LANGUAGE SQL");
          });

          it("supports procedures in PL/pgSQL", () => {
            test(`
              CREATE PROCEDURE my_proc()
              LANGUAGE plpgsql
              AS $$
              BEGIN
                SELECT 1;
              END;
              $$
            `);
          });

          it("supports C procedures from shared library file", () => {
            testWc("CREATE PROCEDURE foo() LANGUAGE C AS 'mylib', 'myfunc'");
          });
        });

        const testProcedureClauseWc = (clause: string) => {
          testWc(`CREATE PROCEDURE foo() ${clause} AS 'SELECT 1'`);
        };

        it("supports security privilege clause", () => {
          testProcedureClauseWc("SECURITY DEFINER");
          testProcedureClauseWc("SECURITY INVOKER");
          testProcedureClauseWc("EXTERNAL SECURITY DEFINER");
          testProcedureClauseWc("EXTERNAL SECURITY INVOKER");
        });

        it("supports TRANSFORM clause", () => {
          testProcedureClauseWc("TRANSFORM FOR TYPE INT");
          testProcedureClauseWc("TRANSFORM FOR TYPE character varying, FOR TYPE decimal(3, 5)");
        });

        it("supports SET clause for parameters", () => {
          // See CREATE FUNCTION tests for more tests of this clause.
          testProcedureClauseWc("SET search_path = 'foo', bar, baz");
        });

        it("supports SET .. FROM CURRENT clause", () => {
          testProcedureClauseWc("SET search_path FROM CURRENT");
        });
      });
    });

    describe("DROP PROCEDURE", () => {
      it("supports basic DROP PROCEDURE", () => {
        testWc("DROP PROCEDURE foo");
        testWc("DROP PROCEDURE foo.bar.baz");
      });

      it("supports IF EXISTS", () => {
        testWc("DROP PROCEDURE IF EXISTS foo");
      });

      dialect(["postgresql"], () => {
        it("supports parameter list", () => {
          testWc("DROP PROCEDURE foo ( )");
          testWc("DROP PROCEDURE bar ( id INT, name VARCHAR(255) )");
        });

        it("supports multiple procedures", () => {
          testWc("DROP PROCEDURE foo, bar");
        });

        it("supports multiple procedures with parameter lists", () => {
          testWc("DROP PROCEDURE foo (a, b), bar (c)");
        });

        it("supports CASCADE|RESTRICT", () => {
          testWc("DROP PROCEDURE foo CASCADE");
          testWc("DROP PROCEDURE bar() RESTRICT");
        });
      });
    });
  }

  dialect("bigquery", () => {
    testCreateProcedure("BEGIN");
  });
  dialect("postgresql", () => {
    testCreateProcedure("BEGIN ATOMIC");
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("does not support CREATE PROCEDURE", () => {
      expect(() => test("CREATE PROCEDURE foo() BEGIN SELECT 1; END")).toThrowError();
    });
  });
});
