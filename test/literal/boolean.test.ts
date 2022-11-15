import { parseExpr, testExpr } from "../test_utils";

describe("boolean literal", () => {
  it("supports TRUE", () => {
    expect(parseExpr(`true`)).toMatchInlineSnapshot(`
      {
        "text": "true",
        "type": "boolean",
        "value": true,
      }
    `);
    testExpr(`TRUE`);
    testExpr(`false`);
  });

  it("supports FALSE", () => {
    expect(parseExpr(`false`)).toMatchInlineSnapshot(`
      {
        "text": "false",
        "type": "boolean",
        "value": false,
      }
    `);
    testExpr(`FALSE`);
    testExpr(`false`);
  });
});
