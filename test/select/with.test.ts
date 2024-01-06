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

  dialect("postgresql", () => {
    it("supports SEARCH BREATH FIRST clause", () => {
      testWc(`
        WITH RECURSIVE tree AS (
          SELECT 1
        ) SEARCH BREADTH FIRST BY col1, col2 SET ordercol
        SELECT * FROM tree ORDER BY ordercol
      `);
    });

    it("supports SEARCH DEPTH FIRST clause", () => {
      testWc(`
        WITH RECURSIVE tree AS (
          SELECT 1
        ) SEARCH DEPTH FIRST BY col1 SET ordercol
        SELECT * FROM tree ORDER BY ordercol
      `);
    });

    it("supports CYCLE clause", () => {
      testWc(`
        WITH RECURSIVE search_graph AS (
          SELECT 1
        ) CYCLE col1, col2 SET is_cycle USING path_col
        SELECT * FROM search_graph
      `);
    });

    it("supports CYCLE clause with TO..DEFAULT", () => {
      testWc(`
        WITH RECURSIVE search_graph AS (
          SELECT 1
        ) CYCLE col1 SET is_cycle TO true DEFAULT false USING path_col
        SELECT * FROM search_graph
      `);
    });

    it("supports INSERT inside WITH", () => {
      testWc(`WITH t1 AS (INSERT INTO foo VALUES (1) RETURNING *) SELECT * FROM t1`);
    });

    it("supports UPDATE inside WITH", () => {
      testWc(`WITH t1 AS (UPDATE foo SET bar = 1 RETURNING *) SELECT * FROM t1`);
    });

    it("supports DELETE inside WITH", () => {
      testWc(`WITH t1 AS (DELETE FROM foo RETURNING *) SELECT * FROM t1`);
    });
  });
});
