import { dialect, notDialect, test, testWc } from "../../test_utils";

describe("select FROM + TABLESAMPLE", () => {
  dialect("bigquery", () => {
    it("supports TABLESAMPLE SYSTEM", () => {
      testWc("SELECT * FROM my_table TABLESAMPLE SYSTEM ( 10 PERCENT )");
    });

    it("supports TABLESAMPLE SYSTEM inside JOIN", () => {
      test("SELECT * FROM tbl1 TABLESAMPLE SYSTEM (1 percent) JOIN tbl2");
    });
  });

  dialect("postgresql", () => {
    it("supports TABLESAMPLE SYSTEM", () => {
      testWc("SELECT * FROM my_table TABLESAMPLE SYSTEM ( 10 )");
    });

    it("supports TABLESAMPLE BERNOULLI", () => {
      testWc("SELECT * FROM my_table TABLESAMPLE BERNOULLI (25)");
    });

    it("supports TABLESAMPLE with custom sampling function", () => {
      testWc("SELECT * FROM my_table TABLESAMPLE my_sampler (1, 2, 'hello')");
    });

    it("supports REPEATABLE clause", () => {
      testWc("SELECT * FROM my_table TABLESAMPLE SYSTEM (10) REPEATABLE (123)");
      testWc("SELECT * FROM my_table TABLESAMPLE SYSTEM (10) REPEATABLE (5 + 15)");
    });
  });

  notDialect(["bigquery", "postgresql"], () => {
    it("does not support TABLESAMPLE", () => {
      expect(() => test("SELECT * FROM tbl TABLESAMPLE SYSTEM (5 PERCENT)")).toThrowError();
    });
  });
});
