import { dialect, test } from "../test_utils";

describe("select FROM", () => {
  it("parses basic syntax", () => {
    test("SELECT col FROM tbl");
    test("SELECT col from tbl");
    test("SELECT /*c1*/ col /*c2*/ FROM /*c3*/ tbl");
  });

  it("parses table alias", () => {
    test("SELECT t.col FROM my_db.my_long_table_name AS t");
    test("SELECT t.col FROM my_db.my_long_table_name t");
    test("SELECT t.col FROM db.tbl /*c1*/ AS /*c2*/ t");
  });

  it("parses table name in parenthesis", () => {
    test("SELECT col FROM (tbl)");
    test("SELECT t.col FROM (db.tbl) AS t");
    test("SELECT t.col FROM (db.tbl) t");
    test("SELECT t.col FROM (/*c1*/ db.tbl /*c2*/) /*c3*/ AS /*c4*/ t");
  });

  it("parses subselect in parenthesis", () => {
    test("SELECT t.col FROM (SELECT x FROM tbl) AS t");
    test("SELECT t.col FROM (/*c1*/ SELECT x FROM tbl /*c2*/) /*c3*/ AS /*c4*/ t");
  });

  it("parses comma-joins", () => {
    test("SELECT col FROM tbl1, tbl2, tbl3");
    test("SELECT col FROM tbl1 /*c1*/ , /*c2*/ tbl2");
  });

  it("parses plain JOIN", () => {
    test("SELECT c FROM t1 JOIN t2");
    test("SELECT c FROM t1 /*c1*/ JOIN /*c2*/ t2");
  });

  it("parses NATURAL JOIN", () => {
    test("SELECT c FROM t1 NATURAL JOIN t2");
    test("SELECT c FROM t1 /*c1*/ NATURAL /*c2*/ JOIN /*c3*/ t2");
  });

  it("parses LEFT [OUTER] JOIN", () => {
    test("SELECT c FROM t1 LEFT JOIN t2");
    test("SELECT c FROM t1 LEFT OUTER JOIN t2");
    test("SELECT c FROM t1 /*c1*/ LEFT /*c2*/ JOIN /*c3*/ t2");
    test("SELECT c FROM t1 /*c1*/ LEFT /*c2*/ OUTER /*c3*/ JOIN /*c4*/ t2");
  });

  it("parses NATURAL LEFT [OUTER] JOIN", () => {
    test("SELECT c FROM t1 NATURAL LEFT JOIN t2");
    test("SELECT c FROM t1 NATURAL LEFT OUTER JOIN t2");
    test("SELECT c FROM t1 /*c1*/ NATURAL /*c2*/ LEFT /*c3*/ JOIN /*c4*/ t2");
  });

  it("parses RIGHT [OUTER] JOIN", () => {
    test("SELECT c FROM t1 RIGHT JOIN t2");
    test("SELECT c FROM t1 RIGHT OUTER JOIN t2");
    test("SELECT c FROM t1 /*c1*/ RIGHT /*c2*/ JOIN /*c3*/ t2");
    test("SELECT c FROM t1 /*c1*/ RIGHT /*c2*/ OUTER /*c3*/ JOIN /*c4*/ t2");
  });

  it("parses NATURAL RIGHT [OUTER] JOIN", () => {
    test("SELECT c FROM t1 NATURAL RIGHT JOIN t2");
    test("SELECT c FROM t1 NATURAL RIGHT OUTER JOIN t2");
    test("SELECT c FROM t1 /*c1*/ NATURAL /*c2*/ RIGHT /*c3*/ JOIN /*c4*/ t2");
  });

  it("parses INNER JOIN", () => {
    test("SELECT c FROM t1 INNER JOIN t2");
    test("SELECT c FROM t1 /*c1*/ INNER /*c2*/ JOIN /*c3*/ t2");
  });

  it("parses NATURAL INNER JOIN", () => {
    test("SELECT c FROM t1 NATURAL INNER JOIN t2");
    test("SELECT c FROM t1 /*c1*/ NATURAL /*c2*/ INNER /*c3*/ JOIN /*c4*/ t2");
  });

  it("parses CROSS JOIN", () => {
    test("SELECT c FROM t1 CROSS JOIN t2");
    test("SELECT c FROM t1 /*c1*/ CROSS /*c2*/ JOIN /*c3*/ t2");
  });

  dialect("sqlite", () => {
    it("parses FULL [OUTER] JOIN", () => {
      test("SELECT c FROM t1 FULL JOIN t2");
      test("SELECT c FROM t1 FULL OUTER JOIN t2");
      test("SELECT c FROM t1 /*c1*/ FULL /*c2*/ JOIN /*c3*/ t2");
      test("SELECT c FROM t1 /*c1*/ FULL /*c2*/ OUTER /*c3*/ JOIN /*c4*/ t2");
    });

    it("parses NATURAL FULL [OUTER] JOIN", () => {
      test("SELECT c FROM t1 NATURAL FULL JOIN t2");
      test("SELECT c FROM t1 NATURAL FULL OUTER JOIN t2");
      test("SELECT c FROM t1 /*c1*/ NATURAL /*c2*/ FULL /*c3*/ JOIN /*c4*/ t2");
    });
  });

  dialect("mysql", () => {
    it("parses STRAIGHT_JOIN", () => {
      test("SELECT c FROM t1 STRAIGHT_JOIN t2");
    });
  });

  it("parses join with USING specification", () => {
    test("SELECT c FROM t1 JOIN t2 USING (id)");
    test("SELECT c FROM t1 JOIN t2 USING (col1, col2)");
    test("SELECT c FROM t1 JOIN t2 using (ext_id)");
    test("SELECT c FROM t1 JOIN t2 /*c1*/ USING /*c2*/ (/*c3*/ col1 /*c4*/, /*c5*/ col2 /*c6*/)");
  });

  it("parses join with ON specification", () => {
    test("SELECT c FROM t1 JOIN t2 ON t1.id = t2.id");
    test("SELECT c FROM t1 JOIN t2 ON t1.id = t2.id AND t2.type = 5");
    test("SELECT c FROM t1 JOIN t2 ON (t1.id = t2.id)");
    test("SELECT c FROM t1 JOIN t2 on t1.id = t2.id");
    test("SELECT c FROM t1 JOIN t2 /*c1*/ ON /*c2*/ true");
  });
});
