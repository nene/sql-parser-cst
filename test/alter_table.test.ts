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
});
