import { dialect, parseExpr, testExpr, testExprWc } from "../test_utils";

describe("string operators", () => {
  it("supports [NOT] LIKE operator", () => {
    testExprWc(`'foobar' LIKE 'foo%'`);
    testExprWc(`'foobar' NOT LIKE 'foo%'`);
  });

  dialect(["mysql", "sqlite"], () => {
    it("supports LIKE with ESCAPE", () => {
      testExprWc(`'foobar' LIKE 'percentage|%' ESCAPE '|'`);
      testExprWc(`'foobar' NOT LIKE 'foo^_bar' ESCAPE '^'`);
    });
  });

  dialect(["mysql", "sqlite"], () => {
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

  dialect("mysql", () => {
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

  dialect("mysql", () => {
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
  });

  dialect(["sqlite", "mysql"], () => {
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
