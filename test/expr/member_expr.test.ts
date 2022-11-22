import { dialect, parseExpr, testExpr } from "../test_utils";

describe("member_expr", () => {
  dialect("bigquery", () => {
    it("supports simple array subscript", () => {
      testExpr(`my_array[0]`);
      testExpr(`my_array[1+2]`);
      testExpr(`my_array /*c1*/ [ /*c1*/ 8 /*c1*/]`);
    });

    it("supports array subscript specifiers", () => {
      testExpr(`my_array[OFFSET(0)]`);
      testExpr(`my_array[SAFE_OFFSET(4-6)]`);
      testExpr(`my_array[ORDINAL(1)]`);
      testExpr(`my_array[SAFE_ORDINAL(1+2)]`);
      testExpr(`my_array[/*c1*/ OFFSET /*c2*/ (/*c3*/ 2 /*c4*/) /*c5*/]`);
    });

    it("supports array subscript on array literal", () => {
      testExpr(`[1, 2, 3, 4][2]`);
    });

    it("supports array subscript on qualified column name", () => {
      testExpr(`my_tbl.my_col[5]`);
    });

    it("supports nested array subscript", () => {
      testExpr(`my_arr[5][12]`);
    });

    // to ensure we don't parse it to plain function call
    it("parses array subscript specifiers", () => {
      expect(parseExpr(`my_array[OFFSET(0)]`)).toMatchInlineSnapshot(`
        {
          "object": {
            "name": "my_array",
            "text": "my_array",
            "type": "identifier",
          },
          "property": {
            "expr": {
              "args": {
                "expr": {
                  "text": "0",
                  "type": "number",
                  "value": 0,
                },
                "type": "paren_expr",
              },
              "specifierKw": {
                "name": "OFFSET",
                "text": "OFFSET",
                "type": "keyword",
              },
              "type": "array_subscript_specifier",
            },
            "type": "array_subscript",
          },
          "type": "member_expr",
        }
      `);
    });
  });

  dialect(["mysql", "sqlite"], () => {
    it("does not support array subscripts", () => {
      expect(() => parseExpr("my_array[0]")).toThrowError();
    });
  });
});
