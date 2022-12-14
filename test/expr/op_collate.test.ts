import { dialect, parseExpr, testExpr } from "../test_utils";

describe("COLLATE operator", () => {
  dialect(["sqlite", "mysql"], () => {
    it("supports COLLATE operator", () => {
      testExpr(`'foobar' COLLATE utf8`);
      testExpr(`my_col /*c1*/ COLLATE /*c2*/ nocase`);
    });

    it("parses COLLATE operator to syntax tree", () => {
      expect(parseExpr("my_col COLLATE utf8")).toMatchInlineSnapshot(`
        {
          "left": {
            "name": "my_col",
            "text": "my_col",
            "type": "identifier",
          },
          "operator": {
            "name": "COLLATE",
            "text": "COLLATE",
            "type": "keyword",
          },
          "right": {
            "name": "utf8",
            "text": "utf8",
            "type": "identifier",
          },
          "type": "binary_expr",
        }
      `);
    });
  });

  dialect("bigquery", () => {
    it("does not support COLLATE operator", () => {
      expect(() => testExpr(`'foobar' COLLATE utf8`)).toThrowError();
    });
  });
});
