import { dialect, parseExpr, testExprWc } from "../test_utils";

describe("array", () => {
  dialect("bigquery", () => {
    it("supports empty array", () => {
      testExprWc(`[]`);
      testExprWc(`[ ]`);
    });

    it("supports untyped array", () => {
      testExprWc(`[ 1 , 2 , 3 ]`);
    });

    it("supports typed array", () => {
      testExprWc(`ARRAY ['a', 'b', 'c']`);
    });

    it("supports typed array (with type params)", () => {
      testExprWc(`ARRAY < INT64 > [1, 2, 3]`);
    });

    it("parses typed array", () => {
      expect(parseExpr(`ARRAY<INT64>[1, 2]`)).toMatchInlineSnapshot(`
        {
          "dataType": {
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
                      "type": "data_type_name",
                    },
                    "type": "array_type_param",
                  },
                ],
                "type": "list_expr",
              },
              "type": "generic_type_params",
            },
            "type": "parametric_data_type",
            "typeKw": {
              "name": "ARRAY",
              "text": "ARRAY",
              "type": "keyword",
            },
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

  dialect("postgresql", () => {
    it("supports ARRAY[]", () => {
      testExprWc(`ARRAY ['a', 'b', 'c']`);
    });

    it("supports empty ARRAY[]", () => {
      testExprWc(`ARRAY[]`);
    });

    it("supports ARRAY() constructor", () => {
      testExprWc(`ARRAY(SELECT row from tbl)`);
    });

    it("parses array literal", () => {
      expect(parseExpr(`ARRAY[1, 2]`)).toMatchInlineSnapshot(`
        {
          "arrayKw": {
            "name": "ARRAY",
            "text": "ARRAY",
            "type": "keyword",
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
          "type": "array_literal_expr",
        }
      `);
    });
  });

  dialect(["mysql", "mariadb"], () => {
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
