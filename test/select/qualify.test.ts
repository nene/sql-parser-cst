import { dialect, testClauseWc } from "../test_utils";

describe("select QUALIFY", () => {
  dialect("bigquery", () => {
    it("parses qualify clause", () => {
      testClauseWc("QUALIFY x > 3");
      testClauseWc("Qualify x < 81");
    });
  });

  dialect(["mysql", "sqlite"], () => {
    it("ignore empty testsuite", () => {
      expect(true).toBeTruthy();
    });
  });
});
