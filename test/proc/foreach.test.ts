import { dialect, parse, testWc } from "../test_utils";

describe("FOREACH", () => {
  dialect(["plpgsql"], () => {
    it("supports basic FOREACH .. IN ARRAY", () => {
      testWc(`
        FOREACH x IN ARRAY my_array LOOP
          SELECT x;
        END LOOP
      `);
    });

    it("supports begin & end label", () => {
      testWc(`
        <<my_label>> FOREACH x IN ARRAY my_array LOOP
          SELECT 1;
        END LOOP my_label
      `);
    });

    it("supports SLICE", () => {
      testWc(`
        FOREACH x SLICE 2 IN ARRAY my_array LOOP
          SELECT x;
        END LOOP
      `);
    });
  });

  dialect(["bigquery", "mysql", "mariadb", "sqlite", "postgresql"], () => {
    it("does not support FOREACH statement", () => {
      expect(() => parse("FOREACH x IN ARRAY my_array LOOP SELECT x; END LOOP")).toThrow();
    });
  });
});
