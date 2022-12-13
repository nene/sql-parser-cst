import { dialect, parseExpr, testExpr } from "../test_utils";

describe("array", () => {
  dialect("bigquery", () => {
    it("supports empty array", () => {
      testExpr(`[]`);
      testExpr(`[ /* comment */ ]`);
    });

    it("supports untyped array", () => {
      testExpr(`[1, 2, 3]`);
      testExpr(`[/*c1*/ 1 /*c2*/,/*c3*/ 2 /*c4*/]`);
    });

    it("supports typed array", () => {
      testExpr(`ARRAY['a', 'b', 'c']`);
      testExpr(`ARRAY /*c1*/ []`);
    });

    it("supports typed array (with type params)", () => {
      testExpr(`ARRAY<INT64>[1, 2, 3]`);
      testExpr(`ARRAY /*c1*/ <INT64> /*c2*/ [1, 2]`);
    });

    it("parses typed array", () => {
      expect(parseExpr(`ARRAY<INT64>[1, 2]`)).toMatchInlineSnapshot(`
        {
          "dataType": {
            "nameKw": {
              "name": "ARRAY",
              "text": "ARRAY",
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
                    "type": "array_type_param",
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
            "type": "array_expr",
          },
          "type": "typed_expr",
        }
      `);
    });
  });

  dialect("mysql", () => {
    it("does not support arrays", () => {
      expect(() => parseExpr("[1, 2, 3]")).toThrowError();
    });
  });
  dialect("sqlite", () => {
    it("does not support arrays", () => {
      expect(parseExpr("[1, 2, 3]").type).toBe("identifier");
    });
  });
});
