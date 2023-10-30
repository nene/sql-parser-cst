import { dialect, notDialect, parseExpr, testExpr } from "../test_utils";

// Note that this is different from INTERVAL expression supported by MySQL and BigQuery
describe("INTERVAL literal", () => {
  dialect("postgresql", () => {
    it("supports INTERVAL literal", () => {
      testExpr(`INTERVAL '1 year 25 days'`);
    });

    it("parses INTERVAL literal", () => {
      expect(parseExpr(`INTERVAL '1 year'`)).toMatchInlineSnapshot(`
        {
          "intervalKw": {
            "name": "INTERVAL",
            "text": "INTERVAL",
            "type": "keyword",
          },
          "string": {
            "text": "'1 year'",
            "type": "string_literal",
            "value": "1 year",
          },
          "type": "interval_literal",
        }
      `);
    });

    it("supports INTERVAL literal with various PostgreSQL string types", () => {
      testExpr(`INTERVAL U&'1 day'`);
      testExpr(`INTERVAL E'1 day'`);
      testExpr("INTERVAL $$1 day$$");
    });
  });

  notDialect("postgresql", () => {
    it("does not support INTERVAL literals", () => {
      expect(() => testExpr(`(INTERVAL '1 day')`)).toThrowError();
    });
  });
});
