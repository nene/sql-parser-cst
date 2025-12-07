import { dialect, parse, parseExpr, show, test } from "./test_utils";

describe("whitespace", () => {
  it("by default does not include any whitespace to syntax tree", () => {
    expect(parseExpr("1 /*com*/ + \n\n 2")).toMatchInlineSnapshot(`
      {
        "left": {
          "text": "1",
          "type": "number_literal",
          "value": 1,
        },
        "operator": "+",
        "right": {
          "text": "2",
          "type": "number_literal",
          "value": 2,
        },
        "type": "binary_expr",
      }
    `);
  });

  it("includeNewlines:true adds line feeds to syntax tree", () => {
    expect(parseExpr("1 /*com*/ + \n\n 2", { includeNewlines: true })).toMatchInlineSnapshot(`
      {
        "left": {
          "text": "1",
          "type": "number_literal",
          "value": 1,
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
          "type": "number_literal",
          "value": 2,
        },
        "type": "binary_expr",
      }
    `);
  });

  it("includeSpaces:true adds horizontal spaces to syntax tree", () => {
    expect(parseExpr("1 /*com*/ + \n\n 2", { includeSpaces: true })).toMatchInlineSnapshot(`
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
          "type": "number_literal",
          "value": 1,
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
          "type": "number_literal",
          "value": 2,
        },
        "type": "binary_expr",
      }
    `);
  });

  it("includeComments:true adds comments to syntax tree", () => {
    expect(parseExpr("1 /*com*/ + \n\n 2", { includeComments: true })).toMatchInlineSnapshot(`
      {
        "left": {
          "text": "1",
          "trailing": [
            {
              "text": "/*com*/",
              "type": "block_comment",
            },
          ],
          "type": "number_literal",
          "value": 1,
        },
        "operator": "+",
        "right": {
          "text": "2",
          "type": "number_literal",
          "value": 2,
        },
        "type": "binary_expr",
      }
    `);
  });

  it("includeComments/includeSpaces/includeNewlines combined include all whitespace to syntax tree", () => {
    expect(
      parseExpr("1 /*com*/ + \n\n 2", {
        includeComments: true,
        includeSpaces: true,
        includeNewlines: true,
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
          "type": "number_literal",
          "value": 1,
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
          "type": "number_literal",
          "value": 2,
        },
        "type": "binary_expr",
      }
    `);
  });

  describe("comments", () => {
    it("parses line comments", () => {
      test("SELECT 1 + -- comment 1\n -- comment 2\n 2");
    });

    dialect(["bigquery", "sqlite", "mysql", "mariadb"], () => {
      it("parses hash comments", () => {
        test("SELECT 1 + # comment 1\n # comment 2\n 2");
      });
    });
    dialect(["postgresql"], () => {
      it("does not support hash comments", () => {
        expect(() => test("SELECT 1 + # comment 1\n # comment 2\n 2")).toThrowError();
      });
    });

    it("parses block comments", () => {
      test("SELECT 1 + /* comment 1 */ /* comment 2 */ 2");
    });

    dialect("postgresql", () => {
      it("parses nested block-comments", () => {
        test("SELECT 1 + /* com1 /*com2*/ com3 */ 2");
      });
    });

    it("discards comments when includeComments option is not set", () => {
      expect(
        show(
          parse("SELECT 1 + /* comment 1 */ /* comment 2 */ 2", {
            includeNewlines: true,
            includeSpaces: true,
          })
        )
      ).toBe("SELECT 1 +   2");
    });
  });

  describe("conditional comments", () => {
    it("ignores code between sql-parser-cst comments as one single comment", () => {
      test(
        "SELECT 1; /* sql-parser-cst-disable */ RANDOM STUFF /* sql-parser-cst-enable */ SELECT 1;"
      );
    });

    it("handles whitespace variation in sql-parser-cst comments", () => {
      test("/*   sql-parser-cst-disable  */ RANDOM STUFF /*   sql-parser-cst-enable   */");
      test("/*sql-parser-cst-disable*/ RANDOM STUFF /*sql-parser-cst-enable*/");
    });

    it("handles comments inside in sql-parser-cst comments", () => {
      test("/* sql-parser-cst-disable */ RANDOM /* foo */ STUFF /* sql-parser-cst-enable */");
    });

    it("parses everything between sql-parser-cst comments as one single comment", () => {
      expect(
        parse("/* sql-parser-cst-disable */ RANDOM STUFF /* sql-parser-cst-enable */", {
          includeComments: true,
        })
      ).toMatchInlineSnapshot(`
        {
          "leading": [
            {
              "text": "/* sql-parser-cst-disable */ RANDOM STUFF /* sql-parser-cst-enable */",
              "type": "block_comment",
            },
          ],
          "statements": [
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
