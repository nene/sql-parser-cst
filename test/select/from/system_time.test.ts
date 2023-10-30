import { dialect, notDialect, test, testWc } from "../../test_utils";

describe("select FROM + FOR SYSTEM_TIME AS OF", () => {
  dialect("bigquery", () => {
    it("supports FOR SYSTEM_TIME AS OF", () => {
      testWc("SELECT * FROM my_table FOR SYSTEM_TIME AS OF my_timestamp");
    });

    it("supports FOR SYSTEM_TIME AS OF inside JOIN", () => {
      test("SELECT * FROM tbl1 FOR SYSTEM_TIME AS OF my_timestamp JOIN tbl2");
    });
  });

  notDialect("bigquery", () => {
    it("does not support FOR SYSTEM_TIME AS OF", () => {
      expect(() => test("SELECT * FROM tbl FOR SYSTEM_TIME AS OF my_timestamp")).toThrowError();
    });
  });
});
