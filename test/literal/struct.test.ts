import { dialect, parseExpr, testExpr } from "../test_utils";

describe("struct literal", () => {
  dialect("bigquery", () => {
    it("supports untyped struct", () => {
      testExpr(`(25, 'foo', NULL)`);
      testExpr(`(/*c1*/ 1 /*c2*/,/*c3*/ 'foo' /*c4*/)`);
    });

    it("supports typed struct", () => {
      testExpr(`STRUCT('a', 'b')`);
      testExpr(`STRUCT /*c1*/ (18)`);
    });

    it("supports typed struct (with type params)", () => {
      testExpr(`STRUCT<age INT64, name STRING>(50, 'foo')`);
      testExpr(`STRUCT /*c1*/ <INT64> /*c2*/ (2)`);
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
                    "expr1": {
                      "name": "id",
                      "text": "id",
                      "type": "identifier",
                    },
                    "expr2": {
                      "nameKw": {
                        "name": "INT64",
                        "text": "INT64",
                        "type": "keyword",
                      },
                      "type": "data_type",
                    },
                    "type": "pair_expr",
                  },
                ],
                "type": "list_expr",
              },
              "type": "generic_type_params",
            },
            "type": "data_type",
          },
          "struct": {
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
            "type": "paren_expr",
          },
          "type": "typed_struct",
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
