import { parseExpr, showPrecedence, testExpr } from "../test_utils";

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

  it("requires space around keyword operators", () => {
    // this gets parsed as an identifier
    expect(parseExpr(`8DIV4`)).toMatchInlineSnapshot(`
      {
        "column": {
          "name": "8DIV4",
          "text": "8DIV4",
          "type": "identifier",
        },
        "type": "column_ref",
      }
    `);
  });
});
