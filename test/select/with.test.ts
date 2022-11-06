import { dialect, test } from "../test_utils";

describe("select WITH", () => {
  it("parses basic syntax", () => {
    test("WITH child AS (SELECT * FROM person WHERE age < 15) SELECT child.name");
    test("WITH /*c1*/ child /*c2*/ AS /*c3*/ (/*c4*/ SELECT 1 /*c5*/) /*c6*/ SELECT child.name");
  });

  it("parses recursive syntax", () => {
    test("WITH RECURSIVE child AS (SELECT 1) SELECT child.name");
    test("WITH /*c1*/ RECURSIVE /*c2*/ child AS (SELECT 1) SELECT child.name");
  });

  it("parses column names list", () => {
    test("WITH child (age, name) AS (SELECT * FROM person WHERE age < 15) SELECT child.name");
    test(
      "WITH child /*c1*/ (/*c2*/ age /*c3*/, /*c4*/ name /*c5*/) /*c6*/ AS (SELECT 1) SELECT child.name"
    );
  });

  it("parses multiple cte-s", () => {
    test("WITH t1 AS (SELECT 1), t2 AS (SELECT 2) SELECT t1.name");
    test("WITH t1 AS (SELECT 1) /*c1*/, /*c2*/ t2 AS (SELECT 2) SELECT t1.name");
  });

  dialect("sqlite", () => {
    it("supports MATERIALIZED & NOT MATERIALIZED options", () => {
      test("WITH t1 AS MATERIALIZED (SELECT 1) SELECT t1.name");
      test("WITH t1 AS NOT MATERIALIZED (SELECT 1) SELECT t1.name");
      test("WITH t1 AS /*c1*/ NOT /*c2*/ MATERIALIZED /*c3*/ (SELECT 1) SELECT t1.name");
    });
  });
});
