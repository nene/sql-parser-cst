import { dialect, test, testWc, withComments } from "../test_utils";

describe("alter table", () => {
  function testAlterWc(alter: string) {
    test(`ALTER TABLE t ${withComments(alter)}`);
  }

  it("supports basic ALTER TABLE", () => {
    testWc("ALTER TABLE schm.my_tbl RENAME TO new_name");
  });

  dialect(["bigquery", "postgresql"], () => {
    it("supports ALTER TABLE IF EXISTS", () => {
      testWc("ALTER TABLE IF EXISTS my_tbl RENAME TO new_name");
    });
  });

  dialect(["postgresql"], () => {
    it("supports ALTER TABLE [ONLY] name [*]", () => {
      testWc("ALTER TABLE ONLY my_tbl RENAME TO new_name");
      testWc("ALTER TABLE my_tbl * RENAME TO new_name");
    });
  });

  it("supports multiple alter actions", () => {
    testWc(`
      ALTER TABLE tbl
      ADD COLUMN col1 INT,
      DROP COLUMN col2
    `);
  });

  describe("rename table", () => {
    it("RENAME TO", () => {
      testAlterWc("RENAME TO new_name");
    });

    dialect(["mysql", "mariadb"], () => {
      it("supports RENAME AS", () => {
        testAlterWc("RENAME AS new_name");
      });
      it("supports plain RENAME", () => {
        testAlterWc("RENAME new_name");
      });
    });
  });

  describe("rename column", () => {
    it("RENAME COLUMN col1 TO col2", () => {
      testAlterWc("RENAME COLUMN col1 TO col2");
    });

    dialect(["sqlite", "postgresql"], () => {
      it("supports RENAME col1 TO col2", () => {
        testAlterWc("RENAME col1 TO col2");
      });
    });

    dialect("bigquery", () => {
      it("supports RENAME COLUMN IF EXISTS", () => {
        testAlterWc("RENAME COLUMN IF EXISTS col1 TO col2");
      });
    });
  });

  describe("add column", () => {
    it("supports ADD COLUMN", () => {
      testAlterWc("ADD COLUMN col1 INT NOT NULL");
    });

    dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
      it("supports plain ADD", () => {
        testAlterWc("ADD col1 INT");
      });
    });

    dialect(["bigquery", "postgresql"], () => {
      it("supports ADD COLUMN IF NOT EXISTS", () => {
        testAlterWc("ADD COLUMN IF NOT EXISTS col1 INT");
      });
    });
  });

  describe("drop column", () => {
    it("supports DROP COLUMN", () => {
      testAlterWc("DROP COLUMN col1");
    });

    dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
      it("supports plain DROP", () => {
        testAlterWc("DROP col1");
      });
    });

    dialect(["bigquery", "postgresql"], () => {
      it("supports DROP COLUMN IF EXISTS", () => {
        testAlterWc("DROP COLUMN IF EXISTS col1");
      });
    });

    dialect(["postgresql"], () => {
      it("supports DROP COLUMN [CASCADE | RESTRICT]", () => {
        testAlterWc("DROP COLUMN col1 CASCADE");
        testAlterWc("DROP COLUMN col2 RESTRICT");
      });
    });
  });

  describe("alter column", () => {
    dialect("bigquery", () => {
      it("supports ALTER COLUMN IF EXISTS", () => {
        testAlterWc("ALTER COLUMN IF EXISTS col1 DROP DEFAULT");
      });
    });

    dialect(["mysql", "mariadb", "bigquery", "postgresql"], () => {
      it("supports SET DEFAULT", () => {
        testAlterWc("ALTER COLUMN foo SET DEFAULT 125");
      });

      it("supports DROP DEFAULT", () => {
        testAlterWc("ALTER COLUMN foo DROP DEFAULT");
      });
    });

    dialect(["bigquery", "postgresql"], () => {
      it("supports DROP NOT NULL", () => {
        testAlterWc("ALTER COLUMN foo DROP NOT NULL");
      });
    });

    dialect("bigquery", () => {
      it("supports SET DATA TYPE", () => {
        testAlterWc("ALTER COLUMN foo SET DATA TYPE INT");
        testAlterWc("ALTER COLUMN foo SET DATA TYPE ARRAY<INT64>");
      });
    });

    dialect("bigquery", () => {
      it("supports SET OPTIONS", () => {
        testAlterWc("ALTER COLUMN foo SET OPTIONS ( description = 'Blah' )");
      });
    });
  });

  dialect("bigquery", () => {
    it("supports SET DEFAULT COLLATE", () => {
      testAlterWc("SET DEFAULT COLLATE 'und:ci'");
    });
  });

  dialect("bigquery", () => {
    it("supports SET OPTIONS (...)", () => {
      testAlterWc("SET OPTIONS (description='My lovely table')");
    });

    it("supports SET OPTIONS with all possible BigQuery table options", () => {
      testAlterWc(`
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
