import { dialect, parseExpr, testExpr } from "../test_utils";

describe("date/time literal", () => {
  it("datetime", () => {
    expect(parseExpr(`TIME '10:05:58'`)).toMatchInlineSnapshot(`
      {
        "kw": {
          "name": "TIME",
          "text": "TIME",
          "type": "keyword",
        },
        "string": {
          "text": "'10:05:58'",
          "type": "string",
          "value": "10:05:58",
        },
        "type": "datetime",
      }
    `);
    testExpr(`TIME '20:15:00'`);
    testExpr(`DATE '1995-06-01'`);
    testExpr(`DATEtime '1995-06-01 20:15:00'`);
    testExpr(`timestamp '1995-06-01 20:15:00'`);
    testExpr(`DATETIME /* com1 */ '20:15:00'`);
  });

  dialect("mysql", () => {
    it("datetime with double-quoted string", () => {
      testExpr(`TIME "20:15:00"`);
      testExpr(`DATE "1995-06-01"`);
      testExpr(`DATEtime "1995-06-01 20:15:00"`);
      testExpr(`timestamp "1995-06-01 20:15:00"`);
    });
  });
});
