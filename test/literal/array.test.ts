import { dialect, parseExpr, testExpr } from "../test_utils";

describe("array literal", () => {
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
          "array": {
            "expr": {
              "items": [
                {
                  "text": "1",
                  "type": "number",
                  "value": 1,
                },
                {
                  "text": "2",
                  "type": "number",
                  "value": 2,
                },
              ],
              "type": "list_expr",
            },
            "type": "array",
          },
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
                    "nameKw": {
                      "name": "INT64",
                      "text": "INT64",
                      "type": "keyword",
                    },
                    "type": "data_type",
                  },
                ],
                "type": "list_expr",
              },
              "type": "generic_type_params",
            },
            "type": "data_type",
          },
          "type": "typed_array",
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
      expect(parseExpr("[1, 2, 3]").type).toBe("column_ref");
    });
  });
});
