import { dialect, parseExpr, testExpr, testExprWc } from "../test_utils";

describe("type cast", () => {
  it("supports cast() function", () => {
    testExpr(`CAST(x AS INT)`);
    testExpr(`CAST(2 / 8 AS DECIMAL(3, 2))`);
    testExprWc(`CAST ( x AS INT )`);
  });

  dialect("bigquery", () => {
    it("supports SAFE_CAST", () => {
      testExpr(`SAFE_CAST(x AS INT)`);
    });

    it("supports CAST with FORMAT", () => {
      testExprWc(`CAST('86-11-08' AS DATE FORMAT 'YY-MM-DD')`);
      testExprWc(`CAST(1024 AS STRING FORMAT get_fmt(4))`);
    });

    it("supports CAST with FORMAT..AT TIME ZONE", () => {
      testExprWc(`CAST('12:11:08' AS TIME FORMAT 'HH:MI:SS' AT TIME ZONE 'Asia/Kolkata')`);
      testExprWc(`CAST(TIME '12:11:08' AS STRING FORMAT 'HH:MI:SS' AT TIME ZONE 'Asia/Kolkata')`);
    });
  });

  // To make sure we don't parse it as normal function call
  it("parses CAST() to syntax tree", () => {
    expect(parseExpr(`CAST(10 AS INT)`)).toMatchInlineSnapshot(`
      {
        "args": {
          "expr": {
            "asKw": {
              "name": "AS",
              "text": "AS",
              "type": "keyword",
            },
            "dataType": {
              "nameKw": {
                "name": "INT",
                "text": "INT",
                "type": "keyword",
              },
              "type": "named_data_type",
            },
            "expr": {
              "text": "10",
              "type": "number_literal",
              "value": 10,
            },
            "format": undefined,
            "type": "cast_arg",
          },
          "type": "paren_expr",
        },
        "castKw": {
          "name": "CAST",
          "text": "CAST",
          "type": "keyword",
        },
        "type": "cast_expr",
      }
    `);
  });

  dialect("postgresql", () => {
    it("supports :: cast operator", () => {
      testExprWc(`x :: INT`);
      testExprWc(`8 :: DECIMAL(3, 2)`);
    });

    it("supports function call syntax for type casts", () => {
      testExpr(`float8('12.33')`);
      testExpr(`text(12.5)`);
      testExpr(`"time"(12.5)`);
    });

    it("parses typename(..) type casts as function calls", () => {
      expect(parseExpr(`float8(10)`).type).toBe("func_call");
    });
  });
});
