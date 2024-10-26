import { dialect, notDialect, parseExpr, testExpr, testExprWc } from "../test_utils";

describe("struct", () => {
  dialect("bigquery", () => {
    it("supports untyped struct", () => {
      testExprWc(`( 25 , 'foo' , NULL )`);
    });

    it("supports typed struct", () => {
      testExpr(`STRUCT('a', 'b')`);
      testExprWc(`STRUCT (18)`);
    });

    it("supports struct with named fields", () => {
      testExprWc(`STRUCT(25 AS age, 'John' AS name)`);
    });

    it("supports typed struct (with type params)", () => {
      testExpr(`STRUCT<age INT64, name STRING>(50, 'foo')`);
      testExprWc(`STRUCT <INT64> (2)`);
    });

    // Regression test for #17
    it("detects (1,2) as struct_expr", () => {
      expect(parseExpr("(1,2)")).toMatchInlineSnapshot(`
        {
          "expr": {
            "items": [
              {
                "text": "1",
                "type": "number_literal",
                "value": 1,
              },
              {
                "text": "2",
                "type": "number_literal",
                "value": 2,
              },
            ],
            "type": "list_expr",
          },
          "type": "struct_expr",
        }
      `);
    });

    it("detects (2) as ordinary parenthesized number", () => {
      expect(parseExpr("(2)").type).toBe("paren_expr");
    });

    it("parses typed struct", () => {
      expect(parseExpr(`STRUCT<id INT64>(1)`)).toMatchInlineSnapshot(`
        {
          "dataType": {
            "name": {
              "name": "STRUCT",
              "text": "STRUCT",
              "type": "keyword",
            },
            "params": {
              "params": {
                "items": [
                  {
                    "constraints": [],
                    "dataType": {
                      "name": {
                        "name": "INT64",
                        "text": "INT64",
                        "type": "keyword",
                      },
                      "type": "named_data_type",
                    },
                    "name": {
                      "name": "id",
                      "text": "id",
                      "type": "identifier",
                    },
                    "type": "struct_type_param",
                  },
                ],
                "type": "list_expr",
              },
              "type": "generic_type_params",
            },
            "type": "named_data_type",
          },
          "expr": {
            "expr": {
              "items": [
                {
                  "text": "1",
                  "type": "number_literal",
                  "value": 1,
                },
              ],
              "type": "list_expr",
            },
            "type": "struct_expr",
          },
          "type": "typed_expr",
        }
      `);
    });
  });

  notDialect("bigquery", () => {
    it("does not support structs", () => {
      expect(parseExpr("STRUCT(1, 2, 3)").type).toBe("func_call");
    });
  });
});
