import { dialect, testExprWc } from "../test_utils";

describe("logic operators", () => {
  dialect(["mysql", "sqlite"], () => {
    it("parses unary ! operator", () => {
      testExprWc(`!x OR y`);
      testExprWc(`!!!false`);
      testExprWc(`! true`);
    });
  });

  it("parses NOT operator", () => {
    testExprWc(`NOT x > y`);
    testExprWc(`NOT NOT true`);
  });

  it("parses AND operator", () => {
    testExprWc(`x > 1 AND false`);
    testExprWc(`c < 2 AND y = 2 AND 3 > 2`);
  });

  dialect("mysql", () => {
    it("parses XOR operator", () => {
      testExprWc(`true XOR false`);
      testExprWc(`x != 3 XOR y > 2 XOR z <> 4`);
    });
  });

  it("parses OR operator", () => {
    testExprWc(`true OR false`);
    testExprWc(`x != 3 OR y > 2 OR z <> 4`);
  });

  dialect("mysql", () => {
    it("parses && as equivalent to AND", () => {
      testExprWc(`x > 1 && false`);
      testExprWc(`c < 2 && y = 2 && 3 > 2`);
    });

    it("parses || as equivalent to OR", () => {
      testExprWc(`true || false`);
      testExprWc(`x != 3 || y > 2 || z <> 4`);
    });
  });
});
