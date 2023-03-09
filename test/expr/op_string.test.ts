import { dialect, parseExpr, testExpr, testExprWc } from "../test_utils";

describe("string operators", () => {
  it("supports [NOT] LIKE operator", () => {
    testExprWc(`'foobar' LIKE 'foo%'`);
    testExprWc(`'foobar' NOT LIKE 'foo%'`);
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("supports LIKE with ESCAPE", () => {
      testExprWc(`'foobar' LIKE 'percentage|%' ESCAPE '|'`);
      testExprWc(`'foobar' NOT LIKE 'foo^_bar' ESCAPE '^'`);
    });
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("supports [NOT] REGEXP operator", () => {
      testExprWc(`'foooo' REGEXP 'fo*'`);
      testExprWc(`'foooo' NOT REGEXP 'fo*'`);
    });
  });

  dialect("sqlite", () => {
    it("supports [NOT] GLOB operator", () => {
      testExprWc(`col GLOB 'fo*'`);
      testExprWc(`col NOT GLOB 'fo*'`);
    });
    it("supports [NOT] MATCH operator", () => {
      testExprWc(`col MATCH 'fo*'`);
      testExprWc(`col NOT MATCH 'fo*'`);
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports [NOT] RLIKE operator", () => {
      testExprWc(`'foooo' RLIKE 'fo*'`);
      testExprWc(`'foooo' NOT RLIKE 'fo*'`);
    });
  });

  dialect(["sqlite", "bigquery"], () => {
    it("treats || as concatenation operator", () => {
      testExprWc(`'hello' || '_' || 'world'`);
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports string-concatenation with space", () => {
      testExpr(`'foo' 'bar'`);
      testExpr(`'foo' "bar" 'baz'`);
      testExpr(`'foo' \n 'bar'`);
      testExpr(`'foo' /* comment */ 'bar'`);
    });

    it("does not parse string-concatenation with space as alias", () => {
      expect(parseExpr(`'foo' 'bar'`).type).toBe("binary_expr");
      expect(parseExpr(`'foo' "bar" 'baz'`).type).toBe("binary_expr");
      expect(parseExpr(`'foo' \n 'bar'`).type).toBe("binary_expr");
      expect(parseExpr(`'foo' /* comment */ 'bar'`).type).toBe("binary_expr");
    });

    it("parses string-concatenation with space as ''-operator", () => {
      expect(parseExpr(`'foo' 'bar'`)).toMatchInlineSnapshot(`
        {
          "left": {
            "text": "'foo'",
            "type": "string_literal",
            "value": "foo",
          },
          "operator": "",
          "right": {
            "text": "'bar'",
            "type": "string_literal",
            "value": "bar",
          },
          "type": "binary_expr",
        }
      `);
    });

    it("supports concatenation of string with charset with another string", () => {
      testExpr(`_utf8'foo' 'bar'`);
    });

    it("does not support concatenating of two strings with charset", () => {
      expect(() => parseExpr(`_utf8'foo' _utf8'bar'`)).toThrowError();
    });

    it("supports concatenation of natural charset string with plain string", () => {
      testExpr(`N'foo' 'bar'`);
      expect(parseExpr(`N'foo' 'bar'`).type).toBe("binary_expr");
    });

    it("does not support concatenating of two natural charset strings", () => {
      expect(() => parseExpr(`N'foo' N'bar'`)).toThrowError();
    });
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("supports JSON operators", () => {
      testExpr(`col->'items[0].id'`);
      testExprWc(`x -> 'op'`);

      testExpr(`col->>'items[0].id'`);
      testExprWc(`x ->> 'op'`);
    });

    it("supports chain of JSON operators", () => {
      testExpr(`col->'items'->'[0]'->'id'`);
    });
  });
});
