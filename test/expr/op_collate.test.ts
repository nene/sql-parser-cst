import { parseExpr, testExpr } from "../test_utils";

describe("COLLATE operator", () => {
  it("supports COLLATE operator", () => {
    testExpr(`'foobar' COLLATE utf8`);
    testExpr(`my_col /*c1*/ COLLATE /*c2*/ nocase`);
  });

  it("parses COLLATE operator to syntax tree", () => {
    expect(parseExpr("my_col COLLATE utf8")).toMatchInlineSnapshot(`
      {
        "collateKw": {
          "text": "COLLATE",
          "type": "keyword",
        },
        "collation": {
          "text": "utf8",
          "type": "identifier",
        },
        "expr": {
          "column": {
            "text": "my_col",
            "type": "identifier",
          },
          "type": "column_ref",
        },
        "type": "collate_expr",
      }
    `);
  });
});
