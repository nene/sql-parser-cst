import { dialect, testWc } from "../test_utils";

describe("select WITH", () => {
  it("parses basic syntax", () => {
    testWc("WITH child AS ( SELECT * FROM person WHERE age < 15 ) SELECT child.name");
  });

  it("parses recursive syntax", () => {
    testWc("WITH RECURSIVE child AS (SELECT 1) SELECT child.name");
  });

  it("parses column names list", () => {
    testWc("WITH child (age, name) AS (SELECT * FROM person WHERE age < 15) SELECT child.name");
  });

  it("parses multiple cte-s", () => {
    testWc("WITH t1 AS (SELECT 1), t2 AS (SELECT 2) SELECT t1.name");
  });

  dialect(["sqlite", "postgresql"], () => {
    it("supports MATERIALIZED & NOT MATERIALIZED options", () => {
      testWc("WITH t1 AS MATERIALIZED (SELECT 1) SELECT t1.name");
      testWc("WITH t1 AS NOT MATERIALIZED (SELECT 1) SELECT t1.name");
    });
  });
});
