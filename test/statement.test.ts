import { parse, test } from "./test_utils";

describe("statement", () => {
  it("parses multiple statements", () => {
    test(`
      CREATE TABLE foo (id INT);
      INSERT INTO foo VALUES (1);
      SELECT * FROM foo
    `);
  });

  it("parses statement with trailing semicolon", () => {
    test("SELECT 1;");
  });

  it("parses empty statements", () => {
    test("; ; ;");
    expect(parse(";/*com*/;", { includeComments: true })).toMatchInlineSnapshot(`
      {
        "statements": [
          {
            "type": "empty",
          },
          {
            "leading": [
              {
                "text": "/*com*/",
                "type": "block_comment",
              },
            ],
            "type": "empty",
          },
          {
            "type": "empty",
          },
        ],
        "type": "program",
      }
    `);
  });
});
