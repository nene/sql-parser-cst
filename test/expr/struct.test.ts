import { dialect, parse, parseExpr, testExpr } from "../test_utils";

describe("struct", () => {
  dialect("bigquery", () => {
    it("supports untyped struct", () => {
      testExpr(`(25, 'foo', NULL)`);
      testExpr(`(/*c1*/ 1 /*c2*/,/*c3*/ 'foo' /*c4*/)`);
    });

    it("supports typed struct", () => {
      testExpr(`STRUCT('a', 'b')`);
      testExpr(`STRUCT /*c1*/ (18)`);
    });

    it("supports struct with named fields", () => {
      testExpr(`STRUCT(25 AS age, 'John' AS name)`);
      testExpr(`STRUCT(25 /*c1*/ AS /*c2*/ age /*c3*/,/*c4*/ 'John' /*c5*/)`);
    });

    it("supports typed struct (with type params)", () => {
      testExpr(`STRUCT<age INT64, name STRING>(50, 'foo')`);
      testExpr(`STRUCT /*c1*/ <INT64> /*c2*/ (2)`);
    });

    it("detects (1,2) as struct_expr", () => {
      expect(parseExpr("(1,2)").type).toBe("struct_expr");
    });

    it("detects (2) as ordinary parenthesized number", () => {
      expect(parseExpr("(2)").type).toBe("paren_expr");
    });

    it("parses typed struct", () => {
      expect(parseExpr(`STRUCT<id INT64>(1)`)).toMatchInlineSnapshot(`
        {
          "dataType": {
            "nameKw": {
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
                      "nameKw": {
                        "name": "INT64",
                        "text": "INT64",
                        "type": "keyword",
                      },
                      "type": "data_type",
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
            "type": "data_type",
          },
          "expr": {
            "expr": {
              "items": [
                {
                  "text": "1",
                  "type": "number",
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

  dialect(["mysql", "sqlite"], () => {
    it("does not support structs", () => {
      expect(parseExpr("STRUCT(1, 2, 3)").type).toBe("func_call");
    });
  });
});
