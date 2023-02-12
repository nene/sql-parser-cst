import { dialect } from "../test_utils";
import { parseAstSelect } from "./ast_test_utils";

describe("select from", () => {
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

  it("parses SELECT FROM subquery", () => {
    expect(parseAstSelect("SELECT * FROM (SELECT 1) AS t").from).toMatchInlineSnapshot(`
      {
        "alias": {
          "name": "t",
          "type": "identifier",
        },
        "expr": {
          "columns": [
            {
              "type": "number_literal",
              "value": 1,
            },
          ],
          "type": "select_stmt",
        },
        "type": "alias",
      }
    `);
  });
});
