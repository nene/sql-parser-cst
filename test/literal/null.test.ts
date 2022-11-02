import { parseExpr, testExpr } from "../test_utils";

describe("null literal", () => {
  it("null", () => {
    expect(parseExpr(`null`)).toMatchInlineSnapshot(`
      {
        "text": "null",
        "type": "null",
      }
    `);
    testExpr(`NULL`);
  });
});
