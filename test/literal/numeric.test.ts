import { dialect, parseExpr, testExpr } from "../test_utils";

describe("NUMERIC & BIGNUMERIC literals", () => {
  dialect("bigquery", () => {
    it("supports NUMERIC literal", () => {
      testExpr(`NUMERIC "123"`);
      testExpr(`NUMERIC /*c1*/ """123.45"""`);
    });

    it("supports BIGNUMERIC literal", () => {
      testExpr(`BIGNUMERIC '9999'`);
      testExpr(`BIGNUMERIC /*c1*/ '''1.23456e05'''`);
    });

    it("parses NUMERIC literal", () => {
      expect(parseExpr(`NUMERIC '256'`)).toMatchInlineSnapshot(`
        {
          "numericKw": {
            "name": "NUMERIC",
            "text": "NUMERIC",
            "type": "keyword",
          },
          "string": {
            "text": "'256'",
            "type": "string",
            "value": "256",
          },
          "type": "numeric",
        }
      `);
    });

    it("parses BIGNUMERIC literal", () => {
      expect(parseExpr(`BIGNUMERIC '256'`)).toMatchInlineSnapshot(`
        {
          "numericKw": {
            "name": "BIGNUMERIC",
            "text": "BIGNUMERIC",
            "type": "keyword",
          },
          "string": {
            "text": "'256'",
            "type": "string",
            "value": "256",
          },
          "type": "numeric",
        }
      `);
    });
  });

  // For the non-BigQuery case
  it("ignore empty testsuite", () => {
    expect(true).toBeTruthy();
  });
});
