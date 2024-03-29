import { dialect, testExprWc } from "../test_utils";

describe("binary operators", () => {
  ["&", ">>", "<<", "|"].forEach((op) => {
    it(`parses ${op} operator`, () => {
      testExprWc(`5 ${op} 7`);
    });
  });

  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("parses bitwise XOR operator", () => {
      testExprWc(`x ^ y`);
    });
  });

  it("parses unary bit inversion operator", () => {
    testExprWc(`x << ~y`);
  });

  dialect("postgresql", () => {
    it("parses bitwise XOR operator", () => {
      testExprWc(`x # y`);
    });
  });
});
