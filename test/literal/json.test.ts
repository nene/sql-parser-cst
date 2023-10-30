import { dialect, notDialect, parseExpr, testExpr } from "../test_utils";

describe("JSON literal", () => {
  dialect(["bigquery", "postgresql"], () => {
    it("supports JSON literal", () => {
      testExpr(`JSON '{"foo": 10, bar: [1, 2, 3]}'`);
    });

    it("parses JSON literal", () => {
      expect(parseExpr(`JSON '{"key": "value"}'`)).toMatchInlineSnapshot(`
        {
          "jsonKw": {
            "name": "JSON",
            "text": "JSON",
            "type": "keyword",
          },
          "string": {
            "text": "'{"key": "value"}'",
            "type": "string_literal",
            "value": "{"key": "value"}",
          },
          "type": "json_literal",
        }
      `);
    });
  });

  dialect("bigquery", () => {
    it("supports JSON literal with various BigQuery string types", () => {
      testExpr(`JSON "{}"`);
      testExpr(`json '''[1, 2, 3]'''`);
      testExpr(`JSON /*c1*/ """{ "scores": [1, 2, 3] }"""`);
    });
  });

  dialect("postgresql", () => {
    it("supports JSON literal with various PostgreSQL string types", () => {
      testExpr(`JSON U&'{}'`);
      testExpr(`JSON E'{}'`);
      testExpr("JSON $${}$$");
    });
  });

  notDialect(["bigquery", "postgresql"], () => {
    it("does not support JSON literals", () => {
      expect(() => testExpr(`(JSON '{}')`)).toThrowError();
    });
  });
});
