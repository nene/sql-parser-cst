import { Join } from "../../src/sql";
import { dialect, parseFrom, test, show, preserveAll } from "../test_utils";

describe("join", () => {
  it("supports comma-joins", () => {
    test("SELECT col FROM tbl1, tbl2, tbl3");
    test("SELECT col FROM tbl1 /*c1*/ , /*c2*/ tbl2");
  });

  it("supports plain JOIN", () => {
    test("SELECT c FROM t1 JOIN t2");
    test("SELECT c FROM t1 /*c1*/ JOIN /*c2*/ t2");
  });

  it("treats chain of joins as left-associative operators", () => {
    const join = parseFrom("foo JOIN bar JOIN baz", preserveAll) as Join;
    expect(show(join.left).trim()).toBe(`foo JOIN bar`);
    expect(show(join.right).trim()).toBe(`baz`);
  });

  it("supports NATURAL JOIN", () => {
    test("SELECT c FROM t1 NATURAL JOIN t2");
    test("SELECT c FROM t1 /*c1*/ NATURAL /*c2*/ JOIN /*c3*/ t2");
  });

  it("supports LEFT [OUTER] JOIN", () => {
    test("SELECT c FROM t1 LEFT JOIN t2");
    test("SELECT c FROM t1 LEFT OUTER JOIN t2");
    test("SELECT c FROM t1 /*c1*/ LEFT /*c2*/ JOIN /*c3*/ t2");
    test("SELECT c FROM t1 /*c1*/ LEFT /*c2*/ OUTER /*c3*/ JOIN /*c4*/ t2");
  });

  it("supports NATURAL LEFT [OUTER] JOIN", () => {
    test("SELECT c FROM t1 NATURAL LEFT JOIN t2");
    test("SELECT c FROM t1 NATURAL LEFT OUTER JOIN t2");
    test("SELECT c FROM t1 /*c1*/ NATURAL /*c2*/ LEFT /*c3*/ JOIN /*c4*/ t2");
  });

  it("supports RIGHT [OUTER] JOIN", () => {
    test("SELECT c FROM t1 RIGHT JOIN t2");
    test("SELECT c FROM t1 RIGHT OUTER JOIN t2");
    test("SELECT c FROM t1 /*c1*/ RIGHT /*c2*/ JOIN /*c3*/ t2");
    test("SELECT c FROM t1 /*c1*/ RIGHT /*c2*/ OUTER /*c3*/ JOIN /*c4*/ t2");
  });

  it("supports NATURAL RIGHT [OUTER] JOIN", () => {
    test("SELECT c FROM t1 NATURAL RIGHT JOIN t2");
    test("SELECT c FROM t1 NATURAL RIGHT OUTER JOIN t2");
    test("SELECT c FROM t1 /*c1*/ NATURAL /*c2*/ RIGHT /*c3*/ JOIN /*c4*/ t2");
  });

  it("supports INNER JOIN", () => {
    test("SELECT c FROM t1 INNER JOIN t2");
    test("SELECT c FROM t1 /*c1*/ INNER /*c2*/ JOIN /*c3*/ t2");
  });

  it("supports NATURAL INNER JOIN", () => {
    test("SELECT c FROM t1 NATURAL INNER JOIN t2");
    test("SELECT c FROM t1 /*c1*/ NATURAL /*c2*/ INNER /*c3*/ JOIN /*c4*/ t2");
  });

  it("supports CROSS JOIN", () => {
    test("SELECT c FROM t1 CROSS JOIN t2");
    test("SELECT c FROM t1 /*c1*/ CROSS /*c2*/ JOIN /*c3*/ t2");
  });

  dialect("sqlite", () => {
    it("supports FULL [OUTER] JOIN", () => {
      test("SELECT c FROM t1 FULL JOIN t2");
      test("SELECT c FROM t1 FULL OUTER JOIN t2");
      test("SELECT c FROM t1 /*c1*/ FULL /*c2*/ JOIN /*c3*/ t2");
      test("SELECT c FROM t1 /*c1*/ FULL /*c2*/ OUTER /*c3*/ JOIN /*c4*/ t2");
    });

    it("supports NATURAL FULL [OUTER] JOIN", () => {
      test("SELECT c FROM t1 NATURAL FULL JOIN t2");
      test("SELECT c FROM t1 NATURAL FULL OUTER JOIN t2");
      test("SELECT c FROM t1 /*c1*/ NATURAL /*c2*/ FULL /*c3*/ JOIN /*c4*/ t2");
    });
  });

  dialect("mysql", () => {
    it("supports STRAIGHT_JOIN", () => {
      test("SELECT c FROM t1 STRAIGHT_JOIN t2");
    });
  });

  it("supports join with USING specification", () => {
    test("SELECT c FROM t1 JOIN t2 USING (id)");
    test("SELECT c FROM t1 JOIN t2 USING (col1, col2)");
    test("SELECT c FROM t1 JOIN t2 using (ext_id)");
    test("SELECT c FROM t1 JOIN t2 /*c1*/ USING /*c2*/ (/*c3*/ col1 /*c4*/, /*c5*/ col2 /*c6*/)");
  });

  it("supports join with ON specification", () => {
    test("SELECT c FROM t1 JOIN t2 ON t1.id = t2.id");
    test("SELECT c FROM t1 JOIN t2 ON t1.id = t2.id AND t2.type = 5");
    test("SELECT c FROM t1 JOIN t2 ON (t1.id = t2.id)");
    test("SELECT c FROM t1 JOIN t2 on t1.id = t2.id");
    test("SELECT c FROM t1 JOIN t2 /*c1*/ ON /*c2*/ true");
  });
});
