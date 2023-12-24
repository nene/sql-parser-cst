import { dialect, parseExpr, testExpr, testExprWc } from "../test_utils";

describe("string operators", () => {
  it("supports [NOT] LIKE operator", () => {
    testExprWc(`'foobar' LIKE 'foo%'`);
    testExprWc(`'foobar' NOT LIKE 'foo%'`);
  });

  dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
    it("supports LIKE with ESCAPE", () => {
      testExprWc(`'foobar' LIKE 'percentage|%' ESCAPE '|'`);
      testExprWc(`'foobar' NOT LIKE 'foo^_bar' ESCAPE '^'`);
    });
  });

  dialect("postgresql", () => {
    it("supports [NOT] ILIKE operator", () => {
      testExprWc(`'foobar' ILIKE 'foo%'`);
      testExprWc(`'foobar' NOT ILIKE 'foo%'`);
    });

    it("supports ILIKE with ESCAPE", () => {
      testExprWc(`'foobar' ILIKE 'percentage|%' ESCAPE '|'`);
      testExprWc(`'foobar' NOT ILIKE 'foo^_bar' ESCAPE '^'`);
    });

    it("supports [NOT] SIMILAR TO operator", () => {
      testExprWc(`'abc' SIMILAR TO '%(b|d)%'`);
      testExprWc(`'abc' NOT SIMILAR TO '%(b|d)%'`);
    });

    it("supports SIMILAR TO with ESCAPE", () => {
      testExprWc(`'foobar' SIMILAR TO 'percentage|%' ESCAPE '|'`);
      testExprWc(`'foobar' NOT SIMILAR TO 'foo^_bar' ESCAPE '^'`);
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

  dialect(["sqlite", "bigquery", "postgresql"], () => {
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

  dialect("postgresql", () => {
    it("supports ^@ starts-with operator", () => {
      testExprWc(`'hello' ^@ 'he'`);
    });

    it("supports IS [NOT] [form] NORMALIZED operator", () => {
      testExprWc(`'hello' IS NORMALIZED`);
      testExprWc(`'hello' IS NOT NORMALIZED`);

      testExprWc(`'hello' IS NFC NORMALIZED`);
      testExprWc(`'hello' IS NFD NORMALIZED`);
      testExprWc(`'hello' IS NFKC NORMALIZED`);
      testExprWc(`'hello' IS NFKD NORMALIZED`);

      testExprWc(`'hello' IS NOT NFC NORMALIZED`);
      testExprWc(`'hello' IS NOT NFD NORMALIZED`);
      testExprWc(`'hello' IS NOT NFKC NORMALIZED`);
      testExprWc(`'hello' IS NOT NFKD NORMALIZED`);
    });
  });
});
