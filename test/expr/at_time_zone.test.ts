import { dialect, notDialect, parseExpr, testExprWc } from "../test_utils";

describe("AT TIME ZONE operator", () => {
  dialect("postgresql", () => {
    it("supports AT TIME ZONE operator", () => {
      testExprWc(`col AT TIME ZONE 'America/Chicago'`);
      testExprWc(`TIME '22:30:00' AT TIME ZONE ('America' || '/' || 'Chicago')`);
      testExprWc(`col AT TIME ZONE 'America/Chicago' AT TIME ZONE 'UTC'`);
    });

    it("parses AT TIME ZONE operator as BinaryExpr", () => {
      expect(parseExpr(`TIME '22:30:00' AT TIME ZONE 'UTC'`)).toMatchInlineSnapshot(`
        {
          "left": {
            "string": {
              "text": "'22:30:00'",
              "type": "string_literal",
              "value": "22:30:00",
            },
            "timeKw": {
              "name": "TIME",
              "text": "TIME",
              "type": "keyword",
            },
            "type": "time_literal",
          },
          "operator": [
            {
              "name": "AT",
              "text": "AT",
              "type": "keyword",
            },
            {
              "name": "TIME",
              "text": "TIME",
              "type": "keyword",
            },
            {
              "name": "ZONE",
              "text": "ZONE",
              "type": "keyword",
            },
          ],
          "right": {
            "text": "'UTC'",
            "type": "string_literal",
            "value": "UTC",
          },
          "type": "binary_expr",
        }
      `);
    });
  });

  notDialect("postgresql", () => {
    it("does not support AT TIME ZONE operator", () => {
      expect(() => parseExpr(`col AT TIME ZONE 'UTC'`)).toThrowError();
    });
  });
});
