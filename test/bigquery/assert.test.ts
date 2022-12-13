import { dialect, testWc } from "../test_utils";

describe("BigQuery assert", () => {
  dialect("bigquery", () => {
    describe("ASSERT", () => {
      it("supports basic ASSERT", () => {
        testWc("ASSERT 3 + 5 > 4");
      });

      it("supports ASSERT with a message", () => {
        testWc(
          "ASSERT ((SELECT count(*) FROM tbl) > 10) AS 'Table must contain at least 10 rows!'"
        );
      });
    });
  });

  it("ignore empty testsuite", () => {
    expect(true).toBeTruthy();
  });
});
