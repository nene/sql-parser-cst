import { dialect, show, parse, preserveAll, test } from "../test_utils";

describe("alter table", () => {
  function testAlter(alter: string) {
    const sql = `ALTER TABLE t ${alter}`;
    expect(show(parse(sql, preserveAll))).toBe(sql);
  }

  it("supports basic ALTER TABLE", () => {
    test("ALTER TABLE schm.my_tbl RENAME TO new_name");
    test("ALTER /*c1*/ TABLE /*c2*/ my_tbl /*c3*/ RENAME TO new_name");
  });

  dialect("bigquery", () => {
    it("supports ALTER TABLE IF EXISTS", () => {
      test("ALTER TABLE IF EXISTS my_tbl RENAME TO new_name");
      test("ALTER TABLE /*c1*/ IF /*c2*/ EXISTS /*c3*/ my_tbl RENAME TO new_name");
    });
  });

  it("supports multiple alter actions", () => {
    test(`
      ALTER TABLE tbl
      ADD COLUMN col1 INT,
      DROP COLUMN col2
    `);
  });

  describe("rename table", () => {
    it("RENAME TO", () => {
      testAlter("RENAME TO new_name");
      testAlter("RENAME /*c1*/ TO /*c2*/ new_name");
    });

    dialect("mysql", () => {
      it("supports RENAME AS", () => {
        testAlter("RENAME AS new_name");
      });
      it("supports plain RENAME", () => {
        testAlter("RENAME new_name");
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

    dialect("bigquery", () => {
      it("supports RENAME COLUMN IF EXISTS", () => {
        testAlter("RENAME COLUMN IF EXISTS col1 TO col2");
        testAlter("RENAME COLUMN /*c1*/ IF /*c2*/ EXISTS /*c3*/ col1 TO col2");
      });
    });
  });

  describe("add column", () => {
    it("supports ADD COLUMN", () => {
      testAlter("ADD COLUMN col1 INT NOT NULL");
      testAlter("ADD /*c1*/ COLUMN /*c2*/ col1 INT");
    });

    dialect(["mysql", "sqlite"], () => {
      it("supports plain ADD", () => {
        testAlter("ADD col1 INT");
      });
    });

    dialect("bigquery", () => {
      it("supports ADD COLUMN IF NOT EXISTS", () => {
        testAlter("ADD COLUMN IF NOT EXISTS col1 INT");
        testAlter("ADD COLUMN /*c1*/ IF /*c2*/ NOT /*c3*/ EXISTS /*c4*/ col1 INT");
      });
    });
  });

  describe("drop column", () => {
    it("supports DROP COLUMN", () => {
      testAlter("DROP COLUMN col1");
      testAlter("DROP /*c1*/ COLUMN /*c2*/ col1");
    });

    dialect(["mysql", "sqlite"], () => {
      it("supports plain DROP", () => {
        testAlter("DROP col1");
      });
    });

    dialect("bigquery", () => {
      it("supports DROP COLUMN IF EXISTS", () => {
        testAlter("DROP COLUMN IF EXISTS col1");
        testAlter("DROP COLUMN /*c1*/ IF /*c2*/ EXISTS /*c3*/ col1");
      });
    });
  });
});
