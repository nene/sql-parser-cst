import { dialect, testWc } from "./test_utils";

describe("vacuum", () => {
  dialect(["sqlite", "postgresql", "plpgsql"], () => {
    it("supports plain VACUUM statement", () => {
      testWc("VACUUM");
    });
  });

  dialect("sqlite", () => {
    it("supports VACUUM schema_name", () => {
      testWc("VACUUM my_schema");
    });

    it("supports VACUUM INTO file", () => {
      testWc("VACUUM INTO '/my/file.db'");
      testWc("VACUUM my_schema INTO '/my/file.db'");
    });
  });

  dialect(["postgresql", "plpgsql"], () => {
    it("supports VACUUM table_name", () => {
      testWc("VACUUM my_table");
    });

    it("supports VACUUM with multiple tables", () => {
      testWc("VACUUM tbl1, tbl2");
    });

    it("supports VACUUM table_name with inheritance modifiers", () => {
      testWc("VACUUM my_table *, ONLY my_table");
    });

    it("supports VACUUM table_name with columns", () => {
      testWc("VACUUM my_table (col1, col2), my_table * (col3)");
    });
  });

  dialect(["mysql", "mariadb", "bigquery", "postgresql", "plpgsql"], () => {
    it("does not support VACUUM statement", () => {
      expect(() => test("VACUUM")).toThrow();
    });
  });
});
