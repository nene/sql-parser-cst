import { dialect, test, testWc } from "../test_utils";

describe("function", () => {
  function testCreateFunction(body: string) {
    describe("CREATE FUNCTION", () => {
      it("supports basic CREATE FUNCTION", () => {
        testWc(`CREATE FUNCTION foo ( ) ${body}`);
        testWc(`CREATE FUNCTION foo.bar.baz ( ) ${body}`);
      });

      it("supports parameters", () => {
        testWc(`CREATE FUNCTION multiplicate ( x INT , y INT ) ${body}`);
      });
      dialect("postgresql", () => {
        it("supports IN, OUT, INOUT & VARIADIC parameters", () => {
          testWc(`
            CREATE FUNCTION multiplicate(
              IN x INT,
              OUT y INT,
              INOUT z INT,
              VARIADIC numbers INT[]
            )
            ${body}
          `);
        });

        it("supports optional parameter names", () => {
          testWc(`
            CREATE FUNCTION foo(INT, IN INT, OUT INT[])
            AS $$ SELECT ARRAY[$1, $2]; $$
          `);
        });

        it("supports default values", () => {
          testWc(`CREATE FUNCTION foo(IN x INT = 1, y INT DEFAULT 2, INT = 3) ${body}`);
        });
      });

      it("supports OR REPLACE", () => {
        testWc(`CREATE OR REPLACE FUNCTION foo() ${body}`);
      });

      it("supports RETURNS", () => {
        testWc(`CREATE FUNCTION foo() RETURNS INT ${body}`);
      });
      dialect("postgresql", () => {
        it("supports RETURNS TABLE", () => {
          testWc(`CREATE FUNCTION foo() RETURNS TABLE (x INT, y TEXT) ${body}`);
        });
      });

      dialect("bigquery", () => {
        it("supports TEMPORARY FUNCTION", () => {
          testWc("CREATE TEMP FUNCTION foo() AS (1)");
          testWc("CREATE TEMPORARY FUNCTION foo() AS (1)");
        });

        it("supports IF NOT EXISTS", () => {
          testWc("CREATE FUNCTION IF NOT EXISTS foo() AS (1)");
        });

        it("supports OPTIONS(..)", () => {
          testWc("CREATE FUNCTION foo() OPTIONS (description='hello') AS (1)");
          testWc("CREATE FUNCTION foo() AS (1) OPTIONS (description='my func')");
        });

        describe("JS functions", () => {
          it("supports LANGUAGE js", () => {
            testWc("CREATE FUNCTION foo() RETURNS INT LANGUAGE js AS 'return(x*y);'");
          });

          it("supports DETERMINISTIC / NOT DETERMINISTIC", () => {
            testWc(
              `CREATE FUNCTION foo() RETURNS STRING DETERMINISTIC LANGUAGE js AS 'return("");'`
            );
            testWc(
              `CREATE FUNCTION foo() RETURNS INT NOT DETERMINISTIC LANGUAGE js AS 'return(0);'`
            );
          });

          it("supports OPTIONS(..)", () => {
            testWc(
              "CREATE FUNCTION foo() RETURNS INT LANGUAGE js OPTIONS (foo=15) AS 'return(x*y);'"
            );
            testWc(
              "CREATE FUNCTION foo() RETURNS INT LANGUAGE js AS 'return(x*y);' OPTIONS(foo=2)"
            );
          });
        });

        describe("remote functions", () => {
          it("supports REMOTE WITH CONNECTION", () => {
            testWc("CREATE FUNCTION foo() RETURNS INT REMOTE WITH CONNECTION myconnection_id");
          });

          it("supports OPTIONS(..)", () => {
            testWc(`
              CREATE FUNCTION multiply()
              RETURNS INT REMOTE WITH CONNECTION myproj.us.myconnection
              OPTIONS(endpoint="https://example.com/multiply")
            `);
          });
        });

        describe("table functions", () => {
          it("supports CREATE TABLE FUNCTION", () => {
            testWc("CREATE TABLE FUNCTION foo() AS SELECT * FROM tbl");
            testWc("CREATE OR REPLACE TABLE FUNCTION foo() AS SELECT 1");
            testWc("CREATE TABLE FUNCTION IF NOT EXISTS foo() AS SELECT 1");
          });

          it("supports RETURNS TABLE <..>", () => {
            testWc("CREATE TABLE FUNCTION foo() RETURNS TABLE < col1 INT64 > AS SELECT 1");
            testWc(`
              CREATE TABLE FUNCTION foo()
              RETURNS TABLE< name STRING , age INT >
              AS SELECT 'John', 64
            `);
          });

          it("supports parameters with ANY TYPE", () => {
            testWc(`
              CREATE TABLE FUNCTION foo( p ANY TYPE )
              AS SELECT * FROM tbl WHERE col = p
            `);
          });

          it("supports OPTIONS(..)", () => {
            testWc(`
              CREATE TABLE FUNCTION doubleit(x INT)
              RETURNS TABLE<x INT64>
              OPTIONS(description='haha')
              AS SELECT x*2
            `);
          });
        });
      });

      dialect(["postgresql"], () => {
        describe("begin..end block", () => {
          it("supports BEGIN ATOMIC .. END block", () => {
            testWc(`
              CREATE FUNCTION foo() RETURNS INT
              BEGIN ATOMIC
                SELECT 1;
              END
            `);
          });

          it("supports RETURN inside begin..end block", () => {
            testWc(`
              CREATE FUNCTION foo() RETURNS INT
              BEGIN ATOMIC
                SELECT * INTO result FROM bar;
                RETURN result;
              END
            `);
          });
        });

        describe("functions in other languages", () => {
          it("supports LANGUAGE SQL", () => {
            testWc("CREATE FUNCTION foo() RETURNS INT LANGUAGE SQL AS 'SELECT 1'");
          });

          it("supports LANGUAGE PL/pgSQL", () => {
            testWc(`
              CREATE FUNCTION foo() RETURNS INT AS $$
                BEGIN
                  RETURN 1;
                END;
              $$ LANGUAGE plpgsql;
            `);
          });

          it("supports C functions from shared library file", () => {
            testWc(`
              CREATE FUNCTION add_one() RETURNS DOUBLE PRECISION
              AS 'DIRECTORY/funcs' , 'add_one_float8'
              LANGUAGE C;
            `);
          });
        });

        it("supports creating WINDOW functions", () => {
          // Currently PostgreSQL only supports creating WINDOW functions from C functions.
          testWc(`
            CREATE FUNCTION foo() RETURNS INT
            WINDOW AS 'DIRECTORY/win_funcs' , 'my_win_func'
            LANGUAGE C;
          `);
        });

        const testFunctionClauseWc = (clause: string) => {
          testWc(`CREATE FUNCTION foo() ${clause} RETURN 42`);
        };

        [
          "VOLATILE",
          "STABLE",
          "IMMUTABLE",
          "LEAKPROOF",
          "NOT LEAKPROOF",
          "CALLED ON NULL INPUT",
          "RETURNS NULL ON NULL INPUT",
          "STRICT",
          "PARALLEL UNSAFE",
          "PARALLEL RESTRICTED",
          "PARALLEL SAFE",
        ].forEach((attr) => {
          it(`supports function behavior attribute: ${attr}`, () => {
            testFunctionClauseWc(attr);
          });
        });

        it("supports security privilege clause", () => {
          testFunctionClauseWc("SECURITY DEFINER");
          testFunctionClauseWc("SECURITY INVOKER");
          testFunctionClauseWc("EXTERNAL SECURITY DEFINER");
          testFunctionClauseWc("EXTERNAL SECURITY INVOKER");
        });

        it("supports COST clause", () => {
          testFunctionClauseWc("COST 125");
        });

        it("supports ROWS clause", () => {
          testFunctionClauseWc("ROWS 5200");
        });

        it("supports SUPPORT clause", () => {
          testFunctionClauseWc("SUPPORT my_func");
          testFunctionClauseWc("SUPPORT schm.my_func");
        });
      });
    });
  }

  dialect("bigquery", () => {
    testCreateFunction("AS (1 * 2)");
  });
  dialect("postgresql", () => {
    testCreateFunction("RETURN 1 * 2");
  });

  dialect(["bigquery", "postgresql"], () => {
    describe("DROP FUNCTION", () => {
      it("supports basic DROP FUNCTION", () => {
        testWc("DROP FUNCTION foo");
        testWc("DROP FUNCTION foo.bar.baz");
      });

      it("supports IF EXISTS", () => {
        testWc("DROP FUNCTION IF EXISTS foo");
      });

      dialect(["bigquery"], () => {
        it("supports DROP TABlE FUNCTION", () => {
          testWc("DROP TABLE FUNCTION foo");
          testWc("DROP TABLE FUNCTION IF EXISTS foo.bar.baz");
        });
      });

      dialect(["postgresql"], () => {
        it("supports parameter list", () => {
          testWc("DROP FUNCTION foo ( )");
          testWc("DROP FUNCTION bar ( id INT, name VARCHAR(255) )");
        });

        it("supports CASCADE|RESTRICT", () => {
          testWc("DROP FUNCTION foo CASCADE");
          testWc("DROP FUNCTION bar() RESTRICT");
        });
      });
    });
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("does not support CREATE FUNCTION", () => {
      expect(() => test("CREATE FUNCTION foo() AS (1 + 2)")).toThrowError();
    });
  });
});
