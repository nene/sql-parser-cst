import { JoinExpr } from "../../src/cst/Node";
import { dialect, parseFrom, show, includeAll, testWc } from "../test_utils";

describe("join", () => {
  it("supports comma-joins", () => {
    testWc("SELECT col FROM tbl1, tbl2 , tbl3");
  });

  it("supports plain JOIN", () => {
    testWc("SELECT c FROM t1 JOIN t2");
  });

  it("treats chain of joins as left-associative operators", () => {
    const join = parseFrom("foo JOIN bar JOIN baz", includeAll) as JoinExpr;
    expect(show(join.left).trim()).toBe(`foo JOIN bar`);
    expect(show(join.right).trim()).toBe(`baz`);
  });

  dialect(["mysql", "mariadb", "sqlite", "postgresql", "plpgsql"], () => {
    it("supports NATURAL JOIN", () => {
      testWc("SELECT c FROM t1 NATURAL JOIN t2");
    });
  });

  it("supports LEFT [OUTER] JOIN", () => {
    testWc("SELECT c FROM t1 LEFT JOIN t2");
    testWc("SELECT c FROM t1 LEFT OUTER JOIN t2");
  });

  dialect(["mysql", "mariadb", "sqlite", "postgresql", "plpgsql"], () => {
    it("supports NATURAL LEFT [OUTER] JOIN", () => {
      testWc("SELECT c FROM t1 NATURAL LEFT JOIN t2");
      testWc("SELECT c FROM t1 NATURAL LEFT OUTER JOIN t2");
    });
  });

  it("supports RIGHT [OUTER] JOIN", () => {
    testWc("SELECT c FROM t1 RIGHT JOIN t2");
    testWc("SELECT c FROM t1 RIGHT OUTER JOIN t2");
  });

  dialect(["mysql", "mariadb", "sqlite", "postgresql", "plpgsql"], () => {
    it("supports NATURAL RIGHT [OUTER] JOIN", () => {
      testWc("SELECT c FROM t1 NATURAL RIGHT JOIN t2");
      testWc("SELECT c FROM t1 NATURAL RIGHT OUTER JOIN t2");
    });
  });

  it("supports INNER JOIN", () => {
    testWc("SELECT c FROM t1 INNER JOIN t2 ON x = y");
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("supports plain INNER JOIN", () => {
      testWc("SELECT c FROM t1 INNER JOIN t2");
    });
  });

  dialect(["mysql", "mariadb", "sqlite", "postgresql", "plpgsql"], () => {
    it("supports NATURAL INNER JOIN", () => {
      testWc("SELECT c FROM t1 NATURAL INNER JOIN t2");
    });
  });

  it("supports CROSS JOIN", () => {
    testWc("SELECT c FROM t1 CROSS JOIN t2");
  });
  dialect("sqlite", () => {
    it("supports CROSS JOIN with USING & ON-specification", () => {
      testWc("SELECT c FROM t1 CROSS JOIN t2 USING (id)");
      testWc("SELECT c FROM t1 CROSS JOIN t2 ON t1.id = t2.id");
    });
  });

  dialect(["sqlite", "bigquery", "postgresql", "plpgsql"], () => {
    it("supports FULL [OUTER] JOIN", () => {
      testWc("SELECT c FROM t1 FULL JOIN t2 ON x = y");
      testWc("SELECT c FROM t1 FULL OUTER JOIN t2 ON x = y");
    });
  });

  dialect(["sqlite", "postgresql", "plpgsql"], () => {
    it("supports NATURAL FULL [OUTER] JOIN", () => {
      testWc("SELECT c FROM t1 NATURAL FULL JOIN t2");
      testWc("SELECT c FROM t1 NATURAL FULL OUTER JOIN t2");
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports STRAIGHT_JOIN", () => {
      testWc("SELECT c FROM t1 STRAIGHT_JOIN t2");
    });
  });

  dialect("sqlite", () => {
    // The general syntax in SQLite is:
    //
    //   blah blah blah JOIN
    //
    // Where there are between 1 and 3 instances of "blah", each of which can be any of:
    const joinTypes = ["CROSS", "FULL", "INNER", "LEFT", "NATURAL", "OUTER", "RIGHT"];
    // Not all of these combinations are actually valid in SQLite,
    // but in our parser we choose to lean on the side of being too permissive.

    [
      ...combinations(1, joinTypes),
      ...combinations(2, joinTypes),
      ...combinations(3, joinTypes),
    ].forEach((combo) => {
      const join = combo.join(" ");
      it(`supports ${join} JOIN`, () => {
        testWc(`SELECT x FROM t1 ${join} JOIN t2`);
      });
    });
  });

  it("supports join with USING specification", () => {
    testWc("SELECT c FROM t1 JOIN t2 USING (id)");
    testWc("SELECT c FROM t1 JOIN t2 USING (col1, col2)");
    testWc("SELECT c FROM t1 JOIN t2 using ( ext_id )");
  });

  it("supports join with ON specification", () => {
    testWc("SELECT c FROM t1 JOIN t2 ON t1.id = t2.id");
    testWc("SELECT c FROM t1 JOIN t2 ON t1.id = t2.id AND t2.type = 5");
    testWc("SELECT c FROM t1 JOIN t2 ON (t1.id = t2.id)");
    testWc("SELECT c FROM t1 JOIN t2 on t1.id = t2.id");
  });
});

function combinations<T>(count: number, options: T[]): T[][] {
  if (count === 0) return [[]];
  if (count > options.length) return [];
  const result: T[][] = [];
  for (let i = 0; i < options.length; i++) {
    const rest = options.slice(i + 1);
    for (const combo of combinations(count - 1, rest)) {
      result.push([options[i], ...combo]);
    }
  }
  return result;
}
