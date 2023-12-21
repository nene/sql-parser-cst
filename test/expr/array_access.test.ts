import { dialect, parseExpr, testExpr, testExprWc } from "../test_utils";

describe("array access", () => {
  dialect(["bigquery", "postgresql"], () => {
    it("supports simple array subscript", () => {
      testExpr(`my_array[0]`);
      testExpr(`my_array[1+2]`);
      testExprWc(`my_array [ 8 ]`);
    });

    it("supports array subscript on qualified column name", () => {
      testExpr(`my_tbl.my_col[5]`);
    });

    it("supports nested array subscript", () => {
      testExpr(`my_arr[5][12]`);
    });

    it("supports mixed array and fieldname chain", () => {
      testExpr(`obj.items[5].vehicles[12]`);
    });

    // TODO: Is this a thing also in PostgreSQL?
    it("supports indexing with a string (e.g. in JSON object traversal)", () => {
      testExpr(`my_arr['field']`);
    });

    it("supports array subscript on ARRAY[] literal", () => {
      testExpr(`ARRAY[1, 2, 3, 4][2]`);
    });

    dialect("bigquery", () => {
      it("supports array subscript on array literal (without ARRAY keyword)", () => {
        testExpr(`[1, 2, 3, 4][2]`);
      });

      it("supports array subscript specifiers", () => {
        testExpr(`my_array[OFFSET(0)]`);
        testExpr(`my_array[SAFE_OFFSET(4-6)]`);
        testExpr(`my_array[ORDINAL(1)]`);
        testExpr(`my_array[SAFE_ORDINAL(1+2)]`);
        testExprWc(`my_array[ OFFSET ( 2 ) ]`);
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
                    "type": "number_literal",
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

    dialect("postgresql", () => {
      it("supports array slice operator", () => {
        testExpr("foo[5:10]");
        testExpr("foo[:10]");
        testExpr("foo[5:]");
        testExpr("foo[:]");
      });

      it("supports any expression inside array slice operator", () => {
        testExprWc("foo[ foo + 2 : 12 / col ]");
      });

      it("parses array slice operator", () => {
        expect(parseExpr("foo[5:10]")).toMatchInlineSnapshot(`
          {
            "object": {
              "name": "foo",
              "text": "foo",
              "type": "identifier",
            },
            "property": {
              "expr": {
                "from": {
                  "text": "5",
                  "type": "number_literal",
                  "value": 5,
                },
                "to": {
                  "text": "10",
                  "type": "number_literal",
                  "value": 10,
                },
                "type": "array_slice_specifier",
              },
              "type": "array_subscript",
            },
            "type": "member_expr",
          }
        `);
      });
    });
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("does not support array subscripts", () => {
      expect(() => parseExpr("my_array[0]")).toThrowError();
    });
  });
});
