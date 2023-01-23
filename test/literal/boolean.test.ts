import { parseExpr, testExpr } from "../test_utils";

describe("boolean literal", () => {
  it("supports TRUE", () => {
    expect(parseExpr(`true`)).toMatchInlineSnapshot(`
      {
        "type": "boolean_literal",
        "value": true,
        "valueKw": {
          "name": "TRUE",
          "text": "true",
          "type": "keyword",
        },
      }
    `);
    testExpr(`TRUE`);
    testExpr(`false`);
  });

  it("supports FALSE", () => {
    expect(parseExpr(`false`)).toMatchInlineSnapshot(`
      {
        "type": "boolean_literal",
        "value": false,
        "valueKw": {
          "name": "FALSE",
          "text": "false",
          "type": "keyword",
        },
      }
    `);
    testExpr(`FALSE`);
    testExpr(`false`);
  });
});
