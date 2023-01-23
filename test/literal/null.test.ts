import { parseExpr, testExpr } from "../test_utils";

describe("null literal", () => {
  it("null", () => {
    expect(parseExpr(`null`)).toMatchInlineSnapshot(`
      {
        "nullKw": {
          "name": "NULL",
          "text": "null",
          "type": "keyword",
        },
        "type": "null_literal",
        "value": null,
      }
    `);
    testExpr(`NULL`);
  });
});
