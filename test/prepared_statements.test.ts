import { dialect, parse, testWc, test, includeAll, parseStmt } from "./test_utils";

describe("prepared statements", () => {
  dialect(["mysql", "mariadb"], () => {
    it("supports PREPARE .. FROM statement", () => {
      testWc(`PREPARE my_stmt FROM 'SELECT * FROM my_table WHERE id = ?'`);
      testWc(`PREPARE my_stmt FROM @sql_text`);
    });
  });

  dialect(["postgresql", "plpgsql"], () => {
    it("supports PREPARE .. AS statement", () => {
      testWc(`PREPARE my_stmt AS SELECT * FROM my_table WHERE id = $1`, {
        paramTypes: ["$nr"],
        ...includeAll,
      });
      testWc(`PREPARE my_stmt AS UPDATE foo SET bar = $1`, { paramTypes: ["$nr"], ...includeAll });
      testWc(`PREPARE my_stmt AS DELETE FROM foo WHERE id = $1`, {
        paramTypes: ["$nr"],
        ...includeAll,
      });
      testWc(`PREPARE my_stmt AS INSERT INTO foo (bar) VALUES ($1)`, {
        paramTypes: ["$nr"],
        ...includeAll,
      });
      testWc(`PREPARE my_stmt AS MERGE INTO foo USING bar ON x = $1 WHEN MATCHED THEN DELETE`, {
        paramTypes: ["$nr"],
        ...includeAll,
      });
      testWc(`PREPARE my_stmt AS VALUES ($1), ($2), ($3)`, { paramTypes: ["$nr"], ...includeAll });
    });

    it("supports PREPARE .. AS with parameters", () => {
      testWc(`PREPARE my_stmt(INT, TEXT) AS SELECT $1, $2`, { paramTypes: ["$nr"], ...includeAll });
    });
  });

  dialect(["mysql", "mariadb", "postgresql", "plpgsql"], () => {
    it("supports EXECUTE", () => {
      testWc(`EXECUTE my_stmt`);
    });
  });

  dialect(["mysql", "mariadb", "postgresql", "plpgsql"], () => {
    it("supports DEALLOCATE PREPARE", () => {
      testWc(`DEALLOCATE PREPARE my_stmt`);
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports DROP PREPARE", () => {
      testWc(`DROP PREPARE my_stmt`);
    });
  });

  dialect(["postgresql", "plpgsql"], () => {
    it("supports DEALLOCATE", () => {
      testWc(`DEALLOCATE my_stmt`);
    });
    it("supports DEALLOCATE ALL", () => {
      testWc(`DEALLOCATE ALL`);
    });
  });

  dialect(["mysql"], () => {
    it("supports EXECUTE .. USING with variables", () => {
      testWc(`EXECUTE my_stmt USING @foo, @bar`);
    });
  });

  dialect(["mariadb"], () => {
    it("supports EXECUTE .. USING with expressions", () => {
      testWc(`EXECUTE my_stmt USING 1, @foo, 'hello'`);
    });
  });

  // This syntax has different meaning in PostgreSQL and PL/pgSQL
  // - in PostgreSQL it's passing parameters to the prepared statement `my_stmt`
  // - in PL/pgSQL it's a plain function call `my_stmt(1, 2, 3)` which returns a string that's executed
  dialect(["postgresql", "plpgsql"], () => {
    it("supports EXECUTE .. (arg1, arg2, ...)", () => {
      testWc(`EXECUTE my_stmt(1, 2, 3)`);
    });

    dialect("postgresql", () => {
      it("parses as execute_stmt", () => {
        expect(parseStmt(`EXECUTE my_stmt(1, 2, 3)`).type).toBe("execute_stmt");
      });
    });

    dialect("plpgsql", () => {
      it("parses as execute_immediate_stmt", () => {
        expect(parseStmt(`EXECUTE my_stmt(1, 2, 3)`).type).toBe("execute_immediate_stmt");
      });
    });
  });

  function testExecuteImmediate(stmt: string) {
    it(`supports ${stmt}`, () => {
      testWc(`${stmt} 'SELECT 1'`);
    });

    it(`supports ${stmt} with more complex expression`, () => {
      test(`${stmt} 'SELECT 1' || ', 2'`);
    });

    it("supports USING with positional values", () => {
      testWc(`${stmt} 'SELECT ?, ?' USING 1, 2`);
    });

    it("supports USING with labeled values", () => {
      testWc(`${stmt} 'SELECT @a, @b' USING 1 as b , 2 as a`);
    });

    it("supports INTO with single variable", () => {
      testWc(`${stmt} 'SELECT 1' INTO my_var`);
    });

    it("supports INTO with multiple variables", () => {
      testWc(`${stmt} 'SELECT 1, 2' INTO var1, var2`);
    });

    it("supports INTO + USING", () => {
      test(`${stmt} 'SELECT ?' INTO var1 USING 8`);
    });
  }

  dialect("bigquery", () => {
    testExecuteImmediate("EXECUTE IMMEDIATE");
  });

  dialect("plpgsql", () => {
    testExecuteImmediate("EXECUTE");

    it("supports INTO STRICT", () => {
      testWc(`EXECUTE 'SELECT 1' INTO STRICT my_var`);
    });
  });

  dialect(["sqlite", "bigquery"], () => {
    it("does not support PREPARE statement", () => {
      expect(() => parse(`PREPARE my_stmt FROM 'foo'`)).toThrow();
    });

    it("does not support DEALLOCATE statement", () => {
      expect(() => parse(`DEALLOCATE my_stmt`)).toThrow();
    });

    it("does not support EXECUTE statement", () => {
      expect(() => parse(`EXECUTE my_stmt`)).toThrow();
    });
  });
});
