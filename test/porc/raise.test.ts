import { dialect, parse, test, testWc } from "../test_utils";

describe("RAISE", () => {
  dialect(["bigquery"], () => {
    it("supports RAISE statement", () => {
      test(`RAISE`);
    });

    it("supports USING MESSAGE", () => {
      testWc(`RAISE USING MESSAGE = 'AnError!'`);
    });
  });

  dialect(["sqlite", "mysql"], () => {
    it("does not support RAISE statement", () => {
      expect(() => parse("RAISE")).toThrowError();
    });
  });
});
