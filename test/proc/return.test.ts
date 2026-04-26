import { dialect, parse, testWc } from "../test_utils";

describe("RETURN", () => {
  dialect(["bigquery", "plpgsql"], () => {
    it("supports RETURN statement without value", () => {
      testWc(`RETURN`);
    });
  });

  dialect(["mysql", "mariadb", "plpgsql"], () => {
    it("supports RETURN statement with value", () => {
      testWc(`RETURN 5 + 5`);
    });

    it("supports RETURN with multiple values", () => {
      testWc(`RETURN (1, 2, 3)`);
    });
  });

  dialect(["plpgsql"], () => {
    it("supports RETURN NEXT", () => {
      testWc(`RETURN NEXT r + 1`);
    });

    it("supports RETURN QUERY", () => {
      testWc(`RETURN QUERY SELECT * FROM my_table`);
    });

    it("supports RETURN QUERY EXECUTE", () => {
      testWc(`RETURN QUERY EXECUTE 'SELECT * FROM tbl'`);
    });

    it("supports RETURN QUERY EXECUTE with USING clause", () => {
      testWc(`RETURN QUERY EXECUTE 'SELECT * FROM tbl' USING var1, var2`);
    });
  });

  dialect(["sqlite", "postgresql"], () => {
    it("does not support RETURN statement", () => {
      expect(() => parse("RETURN")).toThrow();
    });
  });
});
