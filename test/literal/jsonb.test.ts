import { dialect, notDialect, parseExpr, testExpr } from "../test_utils";

describe("JSONB literal", () => {
  dialect("postgresql", () => {
    it("supports JSONB literal", () => {
      testExpr(`JSONB '{"foo": 10, bar: [1, 2, 3]}'`);
    });

    it("parses JSONB literal", () => {
      expect(parseExpr(`JSONB '{"key": "value"}'`)).toMatchInlineSnapshot(`
        {
          "jsonbKw": {
            "name": "JSONB",
            "text": "JSONB",
            "type": "keyword",
          },
          "string": {
            "text": "'{"key": "value"}'",
            "type": "string_literal",
            "value": "{"key": "value"}",
          },
          "type": "jsonb_literal",
        }
      `);
    });

    it("supports JSONB literal with various PostgreSQL string types", () => {
      testExpr(`JSONB U&'{}'`);
      testExpr(`JSONB E'{}'`);
      testExpr("JSONB $${}$$");
    });
  });

  notDialect("postgresql", () => {
    it("does not support JSONB literals", () => {
      expect(() => testExpr(`(JSONB '{}')`)).toThrowError();
    });
  });
});
