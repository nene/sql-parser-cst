import { dialect, parseExpr, showPrecedence, testExpr, testExprWc } from "../test_utils";

// General tests for operators
describe("operators", () => {
  it("parses chain of operators", () => {
    testExpr(`5 + 6 - 8`);
    testExpr(`2 * 7 / 3`);
    testExpr(`6 + 7 * 3 - 16 / 2`);
  });

  it("requires no space around punctuation-based operators", () => {
    testExpr(`8+4`);
  });

  it("associates same level binary operators to left", () => {
    expect(showPrecedence(`5 + 2 - 1 + 3`)).toBe(`(((5 + 2) - 1) + 3)`);
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("requires space around keyword operators", () => {
      // this does not get parsed as AND expression
      expect(parseExpr(`8AND4`).type).toBe("identifier");
    });
  });

  dialect(["bigquery", "postgresql"], () => {
    it("requires space around keyword operators", () => {
      // In BigQuery & PostgreSQL identifiers can't start with number (as in above test)
      expect(() => parseExpr(`8AND4`)).toThrowError();
    });
  });

  dialect(["postgresql"], () => {
    it("supports OPERATOR(..) syntax", () => {
      testExprWc(`5 OPERATOR(+) 6`);
      testExprWc(`5 OPERATOR ( ~|// ) 6`);
    });

    it("supports OPERATOR(..) syntax for prefix operators", () => {
      testExprWc(`OPERATOR(~) 6`);
      testExprWc(`OPERATOR(-) 6`);
    });

    it("supports namespaced OPERATOR() syntax", () => {
      testExprWc(`8 OPERATOR(foo.>>) 6`);
      testExprWc(`OPERATOR( my . schematic . + ) 6`);
    });
  });
});
