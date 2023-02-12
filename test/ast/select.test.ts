import { dialect } from "../test_utils";
import { parseAstSelect } from "./ast_test_utils";

describe("select", () => {
  it("parses SELECT with standard clauses", () => {
    expect(
      parseAstSelect(`
        WITH tbl AS (SELECT * FROM foo)
        SELECT col1, col2
        FROM tbl
        WHERE true
        GROUP BY col3
        HAVING false
        ORDER BY col4
        LIMIT 100
      `)
    ).toMatchInlineSnapshot(`
      {
        "columns": [
          {
            "name": "col1",
            "type": "identifier",
          },
          {
            "name": "col2",
            "type": "identifier",
          },
        ],
        "from": {
          "name": "tbl",
          "type": "identifier",
        },
        "groupBy": [
          {
            "name": "col3",
            "type": "identifier",
          },
        ],
        "having": {
          "type": "boolean_literal",
          "value": false,
        },
        "limit": {
          "type": "number_literal",
          "value": 100,
        },
        "orderBy": [
          {
            "name": "col4",
            "type": "identifier",
          },
        ],
        "type": "select_stmt",
        "where": {
          "type": "boolean_literal",
          "value": true,
        },
        "with": {
          "tables": [
            {
              "expr": {
                "columns": [
                  {
                    "type": "all_columns",
                  },
                ],
                "from": {
                  "name": "foo",
                  "type": "identifier",
                },
                "type": "select_stmt",
              },
              "table": {
                "name": "tbl",
                "type": "identifier",
              },
              "type": "common_table_expression",
            },
          ],
          "type": "with_clause",
        },
      }
    `);
  });

  it("parses SELECT ALL/DISTINCT", () => {
    expect(parseAstSelect("SELECT DISTINCT *").distinct).toBe("distinct");
    expect(parseAstSelect("SELECT ALL *").distinct).toBe("all");
  });

  it("parses aliases", () => {
    expect(parseAstSelect("SELECT x AS foo").columns).toMatchInlineSnapshot(`
      [
        {
          "alias": {
            "name": "foo",
            "type": "identifier",
          },
          "expr": {
            "name": "x",
            "type": "identifier",
          },
          "type": "alias",
        },
      ]
    `);
  });

  it("parses ORDER BY sort specifiers", () => {
    expect(parseAstSelect("SELECT * FROM t ORDER BY foo ASC, bar DESC").orderBy)
      .toMatchInlineSnapshot(`
      [
        {
          "expr": {
            "name": "foo",
            "type": "identifier",
          },
          "order": "asc",
          "type": "sort_specification",
        },
        {
          "expr": {
            "name": "bar",
            "type": "identifier",
          },
          "order": "desc",
          "type": "sort_specification",
        },
      ]
    `);
  });

  dialect("sqlite", () => {
    it("parses ORDER BY with NULLS FIRST/LAST", () => {
      expect(parseAstSelect("SELECT * FROM t ORDER BY foo NULLS FIRST, bar NULLS LAST").orderBy)
        .toMatchInlineSnapshot(`
        [
          {
            "expr": {
              "name": "foo",
              "type": "identifier",
            },
            "nulls": "first",
            "type": "sort_specification",
          },
          {
            "expr": {
              "name": "bar",
              "type": "identifier",
            },
            "nulls": "last",
            "type": "sort_specification",
          },
        ]
      `);
    });
  });

  it("parses LIMIT <offset>, <count>", () => {
    const select = parseAstSelect("SELECT * FROM t LIMIT 100, 15");
    expect(select.limit).toMatchInlineSnapshot(`
      {
        "type": "number_literal",
        "value": 15,
      }
    `);
    expect(select.offset).toMatchInlineSnapshot(`
      {
        "type": "number_literal",
        "value": 100,
      }
    `);
  });

  it("parses LIMIT <count> OFFSET <offset>", () => {
    const select = parseAstSelect("SELECT * FROM t LIMIT 15 OFFSET 100");
    expect(select.limit).toMatchInlineSnapshot(`
      {
        "type": "number_literal",
        "value": 15,
      }
    `);
    expect(select.offset).toMatchInlineSnapshot(`
      {
        "type": "number_literal",
        "value": 100,
      }
    `);
  });

  it("parses comma-join", () => {
    expect(parseAstSelect("SELECT * FROM foo, bar").from).toMatchInlineSnapshot(`
      {
        "left": {
          "name": "foo",
          "type": "identifier",
        },
        "operator": ",",
        "right": {
          "name": "bar",
          "type": "identifier",
        },
        "type": "join_expr",
      }
    `);
  });

  const parseJoinOp = (join: string) => {
    const { from } = parseAstSelect(`SELECT * FROM foo ${join} bar`);
    if (from?.type !== "join_expr") {
      throw new Error(`Expected join_expr, instead got ${from ? from.type : "undefined"}`);
    }
    return from.operator;
  };

  it("parses common join types", () => {
    expect(parseJoinOp("JOIN")).toBe("join");
    expect(parseJoinOp("LEFT JOIN")).toBe("left join");
    expect(parseJoinOp("RIGHT JOIN")).toBe("right join");
    expect(parseJoinOp("INNER JOIN")).toBe("inner join");
    expect(parseJoinOp("CROSS JOIN")).toBe("cross join");
  });

  dialect(["sqlite", "mysql"], () => {
    it("parses natural join types", () => {
      expect(parseJoinOp("NATURAL JOIN")).toBe("natural join");
      expect(parseJoinOp("NATURAL LEFT JOIN")).toBe("natural left join");
    });
  });

  it("parses JOIN .. ON", () => {
    expect(parseAstSelect("SELECT * FROM foo JOIN bar ON true").from).toMatchInlineSnapshot(`
      {
        "left": {
          "name": "foo",
          "type": "identifier",
        },
        "operator": "join",
        "right": {
          "name": "bar",
          "type": "identifier",
        },
        "specification": {
          "expr": {
            "type": "boolean_literal",
            "value": true,
          },
          "type": "join_on_specification",
        },
        "type": "join_expr",
      }
    `);
  });

  it("parses JOIN .. USING", () => {
    expect(parseAstSelect("SELECT * FROM foo JOIN bar USING (col1, col2)").from)
      .toMatchInlineSnapshot(`
      {
        "left": {
          "name": "foo",
          "type": "identifier",
        },
        "operator": "join",
        "right": {
          "name": "bar",
          "type": "identifier",
        },
        "specification": {
          "columns": [
            {
              "name": "col1",
              "type": "identifier",
            },
            {
              "name": "col2",
              "type": "identifier",
            },
          ],
          "type": "join_using_specification",
        },
        "type": "join_expr",
      }
    `);
  });
});
