import { parse, parseExpr, show, test } from "./test_utils";

describe("whitespace", () => {
  it("by default does not include any whitespace to syntax tree", () => {
    expect(parseExpr("1 /*com*/ + \n\n 2")).toMatchInlineSnapshot(`
      {
        "left": {
          "text": "1",
          "type": "number",
        },
        "operator": "+",
        "right": {
          "text": "2",
          "type": "number",
        },
        "type": "binary_expr",
      }
    `);
  });

  it("preserveNewline:true adds line feeds to syntax tree", () => {
    expect(parseExpr("1 /*com*/ + \n\n 2", { preserveNewlines: true })).toMatchInlineSnapshot(`
      {
        "left": {
          "text": "1",
          "type": "number",
        },
        "operator": "+",
        "right": {
          "leading": [
            {
              "text": "
      ",
              "type": "newline",
            },
            {
              "text": "
      ",
              "type": "newline",
            },
          ],
          "text": "2",
          "type": "number",
        },
        "type": "binary_expr",
      }
    `);
  });

  it("preserveSpaces:true adds horizontal spaces to syntax tree", () => {
    expect(parseExpr("1 /*com*/ + \n\n 2", { preserveSpaces: true })).toMatchInlineSnapshot(`
      {
        "left": {
          "text": "1",
          "trailing": [
            {
              "text": " ",
              "type": "space",
            },
            {
              "text": " ",
              "type": "space",
            },
          ],
          "type": "number",
        },
        "operator": "+",
        "right": {
          "leading": [
            {
              "text": " ",
              "type": "space",
            },
            {
              "text": " ",
              "type": "space",
            },
          ],
          "text": "2",
          "type": "number",
        },
        "type": "binary_expr",
      }
    `);
  });

  it("preserveComments:true adds comments to syntax tree", () => {
    expect(parseExpr("1 /*com*/ + \n\n 2", { preserveComments: true })).toMatchInlineSnapshot(`
      {
        "left": {
          "text": "1",
          "trailing": [
            {
              "text": "/*com*/",
              "type": "block_comment",
            },
          ],
          "type": "number",
        },
        "operator": "+",
        "right": {
          "text": "2",
          "type": "number",
        },
        "type": "binary_expr",
      }
    `);
  });

  it("preserveComments/preserveSpaces/preserveNewlines combined include all whitespace to syntax tree", () => {
    expect(
      parseExpr("1 /*com*/ + \n\n 2", {
        preserveComments: true,
        preserveSpaces: true,
        preserveNewlines: true,
      })
    ).toMatchInlineSnapshot(`
      {
        "left": {
          "text": "1",
          "trailing": [
            {
              "text": " ",
              "type": "space",
            },
            {
              "text": "/*com*/",
              "type": "block_comment",
            },
            {
              "text": " ",
              "type": "space",
            },
          ],
          "type": "number",
        },
        "operator": "+",
        "right": {
          "leading": [
            {
              "text": " ",
              "type": "space",
            },
            {
              "text": "
      ",
              "type": "newline",
            },
            {
              "text": "
      ",
              "type": "newline",
            },
            {
              "text": " ",
              "type": "space",
            },
          ],
          "text": "2",
          "type": "number",
        },
        "type": "binary_expr",
      }
    `);
  });

  describe("comments", () => {
    it("parses line comments", () => {
      test("SELECT 1 + -- comment 1\n -- comment 2\n 2");
    });

    it("parses hash comments", () => {
      test("SELECT 1 + # comment 1\n # comment 2\n 2");
    });

    it("parses block comments", () => {
      test("SELECT 1 + /* comment 1 */ /* comment 2 */ 2");
    });

    it("discards comments when preserveComments option is not set", () => {
      expect(
        show(
          parse("SELECT 1 + /* comment 1 */ /* comment 2 */ 2", {
            preserveNewlines: true,
            preserveSpaces: true,
          })
        )
      ).toBe("SELECT 1 +   2");
    });
  });
});
