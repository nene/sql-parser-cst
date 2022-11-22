import { dialect, testClause } from "../test_utils";

describe("select QUALIFY", () => {
  dialect("bigquery", () => {
    it("parses qualify clause", () => {
      testClause("QUALIFY x > 3");
      testClause("/*c1*/ Qualify /*c2*/ x < 81");
    });
  });

  dialect(["mysql", "sqlite"], () => {
    it("ignore empty testsuite", () => {
      expect(true).toBeTruthy();
    });
  });
});
