import { dialect, notDialect, test, testWc } from "../../test_utils";

describe("select FROM + UNNEST", () => {
  dialect("bigquery", () => {
    it("supports UNNEST of array literal", () => {
      test("SELECT * FROM UNNEST([1,2,3])");
      test("SELECT * FROM UNNEST(ARRAY[1,2,3])");
      testWc("SELECT * FROM UNNEST ( [1] )");
    });

    it("supports UNNEST of array path", () => {
      test("SELECT * FROM UNNEST(my_tbl.array_col)");
    });

    it("supports UNNEST of long array path", () => {
      test("SELECT * FROM UNNEST(my_tbl.some.long.path.to.array)");
    });

    it("supports UNNEST with alias", () => {
      test("SELECT * FROM UNNEST(tbl.foo) AS blah");
    });

    it("supports UNNEST .. WITH OFFSET", () => {
      test("SELECT * FROM UNNEST([1,2,3]) WITH OFFSET");
    });

    it("supports UNNEST+alias .. WITH OFFSET", () => {
      test("SELECT * FROM UNNEST([1,2,3]) AS my_numbers WITH OFFSET");
      test("SELECT * FROM UNNEST([1,2,3]) my_numbers WITH OFFSET");
    });

    it("supports UNNEST .. WITH OFFSET+alias", () => {
      testWc("SELECT * FROM UNNEST([1,2,3]) WITH OFFSET AS my_numbers");
      testWc("SELECT * FROM UNNEST([1,2,3]) WITH OFFSET my_numbers");
    });

    it("supports UNNEST comma-joined with other tables", () => {
      test("SELECT * FROM tbl1, UNNEST(tbl.foo), tbl2");
    });

    it("supports implicit unnest", () => {
      test("SELECT * FROM kind_of.really.long.expression.here.that.evaluates.to.table");
    });

    it("supports implicit unnest WITH OFFSET", () => {
      test("SELECT * FROM foo.bar.baz WITH OFFSET");
      test("SELECT * FROM foo.bar.baz AS b WITH OFFSET");
      test("SELECT * FROM foo.bar.baz AS b WITH OFFSET AS x");
    });
  });

  notDialect("bigquery", () => {
    it("treats UNNEST() as function call", () => {
      test("SELECT * FROM UNNEST(foo.bar)");
    });
  });
});
