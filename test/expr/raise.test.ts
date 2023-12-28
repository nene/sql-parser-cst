import { dialect, notDialect, parseExpr, testExpr, testExprWc } from "../test_utils";

describe("raise function", () => {
  dialect("sqlite", () => {
    it("supports RAISE(IGNORE)", () => {
      testExprWc(`RAISE ( IGNORE )`);
    });

    it("supports RAISE() with error message", () => {
      testExprWc(`RAISE(ROLLBACK, 'My error')`);
      testExprWc(`RAISE(ABORT, 'My error')`);
      testExprWc(`RAISE(FAIL, 'My error')`);
    });

    it("parses RAISE() as raise_expr containing raise_expr_type", () => {
      expect(parseExpr(`RAISE(IGNORE)`)).toMatchInlineSnapshot(`
        {
          "args": {
            "expr": {
              "items": [
                {
                  "type": "raise_expr_type",
                  "typeKw": {
                    "name": "IGNORE",
                    "text": "IGNORE",
                    "type": "keyword",
                  },
                },
              ],
              "type": "list_expr",
            },
            "type": "paren_expr",
          },
          "raiseKw": {
            "name": "RAISE",
            "text": "RAISE",
            "type": "keyword",
          },
          "type": "raise_expr",
        }
      `);
    });
  });

  notDialect("sqlite", () => {
    it("supports ordinary function named RAISE()", () => {
      testExpr(`RAISE(FAIL, 'blah')`);
    });

    it("parses RAISE() as ordinary function call", () => {
      expect(parseExpr(`RAISE(FAIL, 'blah')`).type).toBe("func_call");
    });
  });
});
