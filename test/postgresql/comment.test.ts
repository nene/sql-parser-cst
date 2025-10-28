import { dialect, notDialect, parse, testWc } from "../test_utils";

describe("COMMENT ON", () => {
  dialect("postgresql", () => {
    it("supports COMMENT ON COLUMN", () => {
      testWc(`COMMENT ON COLUMN my_table.my_column IS 'This is a comment'`);
    });

    it("supports COMMENT ON SCHEMA", () => {
      testWc(`COMMENT ON SCHEMA my_schema IS 'This is a comment'`);
    });

    it("supports COMMENT ON TABLE", () => {
      testWc(`COMMENT ON TABLE sch.my_table IS 'This is a comment'`);
    });
  });

  notDialect("postgresql", () => {
    it("does not support COMMENT ON", () => {
      expect(() => parse(`COMMENT ON TABLE my_table IS 'This is a comment'`)).toThrow();
    });
  });
});
