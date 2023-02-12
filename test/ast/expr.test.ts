import { parseAstExpr } from "./ast_test_utils";

describe("select", () => {
  it("parses binary expr", () => {
    expect(parseAstExpr("'hello' + 1")).toMatchInlineSnapshot(`
      {
        "left": {
          "type": "string_literal",
          "value": "hello",
        },
        "operator": "+",
        "right": {
          "type": "string_literal",
          "value": "hello",
        },
        "type": "binary_expr",
      }
    `);
  });
});
