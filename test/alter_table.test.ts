import { dialect, show, parse, preserveAll, test } from "./test_utils";

describe("alter table", () => {
  function testAlter(alter: string) {
    const sql = `ALTER TABLE t ${alter}`;
    expect(show(parse(sql, preserveAll))).toBe(sql);
  }

  it("supports basic ALTER TABLE", () => {
    test("ALTER TABLE schm.my_tbl RENAME TO new_name");
    test("ALTER /*c1*/ TABLE /*c2*/ my_tbl /*c3*/ RENAME TO new_name");
  });

  it("supports multiple alter actions", () => {
    test("ALTER TABLE tbl ADD COLUMN col1 INT, DROP COLUMN col2");
  });

  describe("rename table", () => {
    it("RENAME TO", () => {
      testAlter("RENAME TO new_name");
      testAlter("RENAME /*c1*/ TO /*c2*/ new_name");
    });
    dialect("mysql", () => {
      it("supports RENAME AS and plain RENAME", () => {
        testAlter("RENAME new_name");
        testAlter("RENAME AS new_name");
      });
    });
  });

  describe("rename column", () => {
    it("RENAME COLUMN col1 TO col2", () => {
      testAlter("RENAME COLUMN col1 TO col2");
      testAlter("RENAME /*c1*/ COLUMN /*c2*/ col1 /*c3*/ TO /*c4*/ col2");
    });
    dialect("sqlite", () => {
      it("supports RENAME col1 TO col2", () => {
        testAlter("RENAME col1 TO col2");
      });
    });
    dialect("mysql", () => {
      it("supports RENAME COLUMN col1 AS col2", () => {
        testAlter("RENAME COLUMN col1 AS col2");
      });
    });
  });

  describe("add column", () => {
    it("ADD [COLUMN]", () => {
      testAlter("ADD COLUMN col1 INT NOT NULL");
      testAlter("ADD col1 INT");
      testAlter("ADD /*c1*/ COLUMN /*c2*/ col1 INT");
    });
  });

  describe("drop column", () => {
    it("DROP [COLUMN]", () => {
      testAlter("DROP COLUMN col1");
      testAlter("DROP col1");
      testAlter("DROP /*c1*/ COLUMN /*c2*/ col1");
    });
  });
});
