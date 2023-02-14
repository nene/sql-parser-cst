import { parseAstExpr } from "./ast_test_utils";
import { dialect } from "../test_utils";

describe("literal", () => {
  it("parses string", () => {
    expect(parseAstExpr("'Hello'")).toMatchInlineSnapshot(`
      {
        "type": "string_literal",
        "value": "Hello",
      }
    `);
  });

  it("parses number", () => {
    expect(parseAstExpr("12.5")).toMatchInlineSnapshot(`
      {
        "type": "number_literal",
        "value": 12.5,
      }
    `);
  });

  it("parses blob", () => {
    expect(parseAstExpr(`x'3132332D414243'`)).toMatchInlineSnapshot(`
      {
        "type": "blob_literal",
        "value": [
          49,
          50,
          51,
          45,
          65,
          66,
          67,
        ],
      }
    `);
  });

  it("parses boolean", () => {
    expect(parseAstExpr("TRUE")).toMatchInlineSnapshot(`
      {
        "type": "boolean_literal",
        "value": true,
      }
    `);
  });

  it("parses null", () => {
    expect(parseAstExpr("NULL")).toMatchInlineSnapshot(`
      {
        "type": "null_literal",
        "value": null,
      }
    `);
  });

  dialect(["bigquery", "mysql"], () => {
    it("parses date", () => {
      expect(parseAstExpr("DATE '1987-02-17'")).toMatchInlineSnapshot(`
        {
          "type": "date_literal",
          "value": "1987-02-17",
        }
      `);
    });

    it("parses time", () => {
      expect(parseAstExpr("TIME '12:30:11'")).toMatchInlineSnapshot(`
        {
          "type": "time_literal",
          "value": "12:30:11",
        }
      `);
    });

    it("parses datetime", () => {
      expect(parseAstExpr("DATETIME '1987-02-17 12:30:11'")).toMatchInlineSnapshot(`
        {
          "type": "datetime_literal",
          "value": "1987-02-17 12:30:11",
        }
      `);
    });

    it("parses timestamp", () => {
      expect(parseAstExpr("TIMESTAMP '1987-02-17 12:30:11 America/Los_Angeles'"))
        .toMatchInlineSnapshot(`
        {
          "type": "timestamp_literal",
          "value": "1987-02-17 12:30:11 America/Los_Angeles",
        }
      `);
    });
  });

  dialect(["bigquery"], () => {
    it("parses json", () => {
      expect(parseAstExpr(`JSON '{"foo": 10}'`)).toMatchInlineSnapshot(`
        {
          "type": "json_literal",
          "value": "{"foo": 10}",
        }
      `);
    });

    it("parses numeric", () => {
      expect(parseAstExpr(`NUMERIC '123465'`)).toMatchInlineSnapshot(`
        {
          "type": "numeric_literal",
          "value": "123465",
        }
      `);
    });

    it("parses bignumeric", () => {
      expect(parseAstExpr(`BIGNUMERIC '123456789'`)).toMatchInlineSnapshot(`
        {
          "type": "bignumeric_literal",
          "value": "123456789",
        }
      `);
    });
  });
});
