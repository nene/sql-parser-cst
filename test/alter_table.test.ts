import { dialect, test } from "./test_utils";

describe("alter table", () => {
  it("RENAME TO", () => {
    test("ALTER TABLE my_tbl RENAME TO new_name");
    test("ALTER TABLE schm.my_tbl RENAME TO new_name");
    test("ALTER /*c1*/ TABLE /*c2*/ my_tbl /*c3*/ RENAME /*c4*/ TO /*c5*/ new_name");
  });

  dialect("mysql", () => {
    it("supports RENAME AS and plain RENAME", () => {
      test("ALTER TABLE my_tbl RENAME new_name");
      test("ALTER TABLE my_tbl RENAME AS new_name");
    });
  });

  it("RENAME COLUMN col1 TO col2", () => {
    test("ALTER TABLE my_tbl RENAME COLUMN col1 TO col2");
    test("ALTER TABLE my_tbl RENAME /*c1*/ COLUMN /*c2*/ col1 /*c3*/ TO /*c4*/ col2");
  });
  dialect("sqlite", () => {
    it("supports RENAME col1 TO col2", () => {
      test("ALTER TABLE my_tbl RENAME col1 TO col2");
    });
  });
  dialect("mysql", () => {
    it("supports RENAME COLUMN col1 AS col2", () => {
      test("ALTER TABLE my_tbl RENAME COLUMN col1 AS col2");
    });
  });
});
