import { dialect, testWc } from "./test_utils";

describe("vacuum", () => {
  dialect("sqlite", () => {
    it("supports plain VACUUM statement", () => {
      testWc("VACUUM");
    });

    it("supports VACUUM schema_name", () => {
      testWc("VACUUM my_schema");
    });

    it("supports VACUUM INTO file", () => {
      testWc("VACUUM INTO '/my/file.db'");
      testWc("VACUUM my_schema INTO '/my/file.db'");
    });
  });

  dialect(["mysql", "mariadb", "bigquery", "postgresql", "plpgsql"], () => {
    it("does not support VACUUM statement", () => {
      expect(() => test("VACUUM")).toThrow();
    });
  });
});
