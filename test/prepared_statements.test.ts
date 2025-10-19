import { dialect, parse, testWc, test } from "./test_utils";

describe("prepared statements", () => {
  dialect(["mysql", "mariadb"], () => {
    it("supports PREPARE .. FROM statement", () => {
      testWc(`PREPARE my_stmt FROM 'SELECT * FROM my_table WHERE id = ?'`);
      testWc(`PREPARE my_stmt FROM @sql_text`);
    });
  });

  dialect(["mysql", "mariadb", "postgresql"], () => {
    it("supports EXECUTE", () => {
      testWc(`EXECUTE my_stmt`);
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

  dialect(["postgresql"], () => {
    it("supports EXECUTE .. (arg1, arg2, ...)", () => {
      testWc(`EXECUTE my_stmt(1, 2, 3)`);
    });
  });

  dialect("bigquery", () => {
    it("supports EXECUTE IMMEDIATE", () => {
      testWc(`EXECUTE IMMEDIATE 'SELECT 1'`);
    });

    it("supports EXECUTE IMMEDIATE with more complex expression", () => {
      test(`EXECUTE IMMEDIATE 'SELECT 1' || ', 2'`);
    });

    it("supports USING with positional values", () => {
      testWc(`EXECUTE IMMEDIATE 'SELECT ?, ?' USING 1, 2`);
    });

    it("supports USING with labeled values", () => {
      testWc(`EXECUTE IMMEDIATE 'SELECT @a, @b' USING 1 as b , 2 as a`);
    });

    it("supports INTO with single variable", () => {
      testWc(`EXECUTE IMMEDIATE 'SELECT 1' INTO my_var`);
    });

    it("supports INTO with multiple variables", () => {
      testWc(`EXECUTE IMMEDIATE 'SELECT 1, 2' INTO var1, var2`);
    });

    it("supports INTO + USING", () => {
      test(`EXECUTE IMMEDIATE 'SELECT ?' INTO var1 USING 8`);
    });
  });

  dialect("sqlite", () => {
    it("does not support EXECUTE statement", () => {
      expect(() => parse(`EXECUTE my_stmt`)).toThrowError();
    });
  });
});
