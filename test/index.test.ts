import { dialect, test } from "./test_utils";

describe("index", () => {
  describe("CREATE INDEX", () => {
    it("simple CREATE INDEX statement", () => {
      test("CREATE INDEX my_idx ON tbl (col1, col2)");
      test("CREATE INDEX schm.my_idx ON schm.tbl (col)");
      test("CREATE /*c1*/ INDEX /*c2*/ idx /*c3*/ ON /*c4*/ tbl /*c5*/ ( /*c6*/ col /*c7*/)");
    });

    it("supports UNIQUE index", () => {
      test("CREATE UNIQUE INDEX my_idx ON tbl (col)");
      test("CREATE /*c1*/ UNIQUE /*c2*/ INDEX my_idx ON tbl (col)");
    });

    dialect("mysql", () => {
      it("supports FULLTEXT & SPATIAL index", () => {
        test("CREATE FULLTEXT INDEX my_idx ON tbl (col)");
        test("CREATE SPATIAL INDEX my_idx ON tbl (col)");
      });
    });

    dialect("sqlite", () => {
      it("supports IF NOT EXISTS", () => {
        test("CREATE INDEX IF NOT EXISTS idx ON tbl (col)");
        test("CREATE INDEX /*c1*/ IF /*c2*/ NOT /*c3*/ EXISTS /*c4*/ idx ON tbl (col)");
      });

      it("supports WHERE clause", () => {
        test("CREATE INDEX idx ON tbl (col) WHERE x > 10");
        test("CREATE INDEX idx ON tbl (col) /*c1*/ WHERE /*c2*/ x > 10");
      });
    });
  });
});
