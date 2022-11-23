import { dialect, parseExpr, testExpr } from "../test_utils";

describe("JSON literal", () => {
  dialect("bigquery", () => {
    it("supports JSON literal with all kinds of strings", () => {
      testExpr(`JSON "{}"`);
      testExpr(`JSON '{"foo": 10, bar: [1, 2, 3]}'`);
      testExpr(`json '''[1, 2, 3]'''`);
      testExpr(`JSON /*c1*/ """{ "scores": [1, 2, 3] }"""`);
    });

    it("parses JSON literal", () => {
      expect(parseExpr(`JSON '{"key": "value"}'`)).toMatchInlineSnapshot(`
        {
          "jsonKw": {
            "name": "JSON",
            "text": "JSON",
            "type": "keyword",
          },
          "string": {
            "text": "'{"key": "value"}'",
            "type": "string",
            "value": "{"key": "value"}",
          },
          "type": "json",
        }
      `);
    });
  });

  // For the non-BigQuery case
  it("ignore empty testsuite", () => {
    expect(true).toBeTruthy();
  });
});
