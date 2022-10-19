import { parse } from "./test_utils";

describe("location", () => {
  it("includeRange:true adds location data to nodes", () => {
    expect(parse("SELECT 1", { includeRange: true })).toMatchInlineSnapshot(`
      [
        {
          "clauses": [
            {
              "columns": [
                {
                  "range": [
                    7,
                    8,
                  ],
                  "text": "1",
                  "type": "number",
                },
              ],
              "options": [],
              "selectKw": {
                "text": "SELECT",
                "type": "keyword",
              },
              "type": "select_clause",
            },
          ],
          "type": "select_statement",
        },
      ]
    `);
  });
});
