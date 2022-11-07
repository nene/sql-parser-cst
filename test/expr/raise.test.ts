import { dialect, parseExpr, testExpr } from "../test_utils";

describe("raise function", () => {
  dialect("sqlite", () => {
    it("supports RAISE(IGNORE)", () => {
      testExpr(`RAISE(IGNORE)`);
      testExpr(`RAISE /*c1*/ (/*c1*/ IGNORE /*c1*/)`);
    });

    it("supports RAISE() with error message", () => {
      testExpr(`RAISE(ROLLBACK, 'My error')`);
      testExpr(`RAISE(ABORT, 'My error')`);
      testExpr(`RAISE(FAIL, 'My error')`);
      testExpr(`RAISE(FAIL /*c1*/,/*c2*/ 'My error')`);
    });

    it("parses RAISE() as raise_expr", () => {
      expect(parseExpr(`RAISE(IGNORE)`).type).toBe("raise_expr");
    });
  });

  dialect("mysql", () => {
    it("supports ordinary function named RAISE()", () => {
      testExpr(`RAISE(FAIL, 'blah')`);
    });

    it("parses RAISE() as ordinary function call", () => {
      expect(parseExpr(`RAISE(FAIL, 'blah')`).type).toBe("func_call");
    });
  });
});
