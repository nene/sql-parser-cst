import { dialect, parse, testWc } from "../test_utils";

describe("LOOP", () => {
  dialect(["bigquery", "mysql"], () => {
    it("supports basic infinite LOOP", () => {
      testWc(`
        LOOP
          SET x = x + 1;
        END LOOP
      `);
    });

    it("supports begin label", () => {
      testWc(`
        my_label: LOOP
          SELECT 1;
        END LOOP
      `);
    });

    it("supports end label", () => {
      testWc(`
        my_label: LOOP
          SELECT 1;
        END LOOP my_label
      `);
    });
  });

  dialect("sqlite", () => {
    it("does not support LOOP statement", () => {
      expect(() => parse("LOOP SELECT 1; END LOOP")).toThrowError();
    });
  });
});
