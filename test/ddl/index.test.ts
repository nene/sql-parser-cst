import { dialect, testWc } from "../test_utils";

describe("index", () => {
  describe("CREATE INDEX", () => {
    it("simple CREATE INDEX statement", () => {
      testWc("CREATE INDEX my_idx ON tbl ( col1 , col2 )");
      testWc("CREATE INDEX schm.my_idx ON schm.tbl (col)");
    });

    it("supports UNIQUE index", () => {
      testWc("CREATE UNIQUE INDEX my_idx ON tbl (col)");
    });

    dialect("mysql", () => {
      it("supports FULLTEXT & SPATIAL index", () => {
        testWc("CREATE FULLTEXT INDEX my_idx ON tbl (col)");
        testWc("CREATE SPATIAL INDEX my_idx ON tbl (col)");
      });
    });

    dialect("sqlite", () => {
      it("supports IF NOT EXISTS", () => {
        testWc("CREATE INDEX IF NOT EXISTS idx ON tbl (col)");
      });

      it("supports WHERE clause", () => {
        testWc("CREATE INDEX idx ON tbl (col) WHERE x > 10");
      });
    });

    dialect("sqlite", () => {
      it("supports ASC/DESC in columns list", () => {
        testWc("CREATE INDEX my_idx ON tbl (id ASC, name DESC)");
      });
      it("supports COLLATE in columns list", () => {
        testWc("CREATE INDEX my_idx ON tbl (name COLLATE utf8)");
      });
    });
  });

  describe("DROP INDEX", () => {
    dialect("sqlite", () => {
      it("supports DROP INDEX name", () => {
        testWc("DROP INDEX my_idx");
        testWc("DROP INDEX schm.my_idx");
      });

      it("supports IF EXISTS", () => {
        testWc("DROP INDEX IF EXISTS my_idx");
      });
    });

    dialect("mysql", () => {
      it("supports DROP INDEX name ON table", () => {
        testWc("DROP INDEX my_idx ON tbl");
        testWc("DROP INDEX idx ON schm.tbl");
      });
    });
  });
});
