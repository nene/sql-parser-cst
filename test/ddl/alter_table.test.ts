import { dialect, show, parse, includeAll, test } from "../test_utils";

describe("alter table", () => {
  function testAlter(alter: string) {
    const sql = `ALTER TABLE t ${alter}`;
    expect(show(parse(sql, includeAll))).toBe(sql);
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

  describe("alter column", () => {
    dialect("bigquery", () => {
      it("supports ALTER COLUMN IF EXISTS", () => {
        testAlter("ALTER COLUMN IF EXISTS col1 DROP DEFAULT");
        testAlter("ALTER COLUMN /*c1*/ IF /*c2*/ EXISTS /*c3*/ col1 DROP DEFAULT");
      });
    });

    dialect(["bigquery", "mysql"], () => {
      it("supports SET DEFAULT", () => {
        testAlter("ALTER COLUMN foo SET DEFAULT 125");
        testAlter("ALTER /*c1*/ COLUMN /*c2*/ foo /*c3*/ SET /*c4*/ DEFAULT /*c5*/ 125");
      });

      it("supports DROP DEFAULT", () => {
        testAlter("ALTER COLUMN foo DROP DEFAULT");
        testAlter("ALTER /*c1*/ COLUMN /*c2*/ foo /*c3*/ DROP /*c4*/ DEFAULT");
      });
    });

    dialect("bigquery", () => {
      it("supports DROP NOT NULL", () => {
        testAlter("ALTER COLUMN foo DROP NOT NULL");
        testAlter("ALTER COLUMN foo /*c1*/ DROP /*c2*/ NOT /*c3*/ NULL");
      });
    });

    dialect("bigquery", () => {
      it("supports SET DATA TYPE", () => {
        testAlter("ALTER COLUMN foo SET DATA TYPE INT");
        testAlter("ALTER COLUMN foo SET DATA TYPE ARRAY<INT64>");
        testAlter("ALTER COLUMN foo /*c1*/ SET /*c2*/ DATA /*c3*/ TYPE /*c4*/ STRING");
      });
    });

    dialect("bigquery", () => {
      it("supports SET OPTIONS", () => {
        testAlter("ALTER COLUMN foo SET OPTIONS ( description = 'Blah' )");
        testAlter("ALTER COLUMN foo /*c1*/ SET /*c2*/ OPTIONS /*c3*/ ( description = NULL )");
      });
    });
  });

  dialect("bigquery", () => {
    it("supports SET DEFAULT COLLATE", () => {
      testAlter("SET DEFAULT COLLATE 'und:ci'");
      testAlter("SET /*c1*/ DEFAULT /*c2*/ COLLATE /*c3*/ ''");
    });
  });

  dialect("bigquery", () => {
    it("supports SET OPTIONS (...)", () => {
      testAlter("SET OPTIONS (description='My lovely table')");
      testAlter("SET /*c1*/ OPTIONS /*c2*/ (/*c3*/ friendly_name /*c4*/ = /*c5*/ 'Bobby' /*c4*/)");
    });

    it("supports SET OPTIONS with all possible BigQuery table options", () => {
      testAlter(`
        SET OPTIONS (
          expiration_timestamp=NULL,
          partition_expiration_days=128,
          require_partition_filter=true,
          kms_key_name='blah',
          friendly_name='Little bobby tables',
          description="Robert'); DROP TABLE Students;--",
          labels = [("org_unit", "development")]
        )
      `);
    });
  });
});
