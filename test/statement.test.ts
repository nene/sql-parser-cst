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

  describe("with acceptUnsupportedGrammar:true", () => {
    it("does not produce a syntax error", () => {
      test("INSERT TODAYS PUZZLE 123;", { acceptUnsupportedGrammar: true });
    });

    it("parses the code into unsupported_grammar_stmt nodes", () => {
      expect(parse("INSERT TODAYS PUZZLE 123; WHOOPSIE DAISY;", { acceptUnsupportedGrammar: true }))
        .toMatchInlineSnapshot(`
        {
          "statements": [
            {
              "text": "INSERT TODAYS PUZZLE 123",
              "type": "unsupported_grammar_stmt",
            },
            {
              "text": "WHOOPSIE DAISY",
              "type": "unsupported_grammar_stmt",
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
});
