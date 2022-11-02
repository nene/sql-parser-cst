import { parseExpr, testExpr } from "../test_utils";

describe("boolean literal", () => {
  it("boolean", () => {
    expect(parseExpr(`true`)).toMatchInlineSnapshot(`
      {
        "text": "true",
        "type": "boolean",
      }
    `);
    testExpr(`TRUE`);
    testExpr(`false`);
    testExpr(`FALSE`);
  });
});
