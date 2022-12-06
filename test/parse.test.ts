import { parse } from "../src/main";

describe("parse()", () => {
  it("throws helpful error when called without options", () => {
    expect(() => (parse as any)("SELECT col FROM tbl")).toThrowErrorMatchingInlineSnapshot(
      `"No SQL dialect specified."`
    );
  });

  it("throws helpful error when called without dialect name", () => {
    expect(() => parse("SELECT col FROM tbl", {} as any)).toThrowErrorMatchingInlineSnapshot(
      `"No SQL dialect specified."`
    );
  });

  it("throws helpful error when called with incorrect dialect name", () => {
    expect(() =>
      parse("SELECT col FROM tbl", { dialect: "aliensql" as any })
    ).toThrowErrorMatchingInlineSnapshot(`"Unsupported dialect name: "aliensql""`);
  });

  it("throws nicely formatted error message when SQL syntax error found", () => {
    expect(() => parse("SELECT foo bar baz", { dialect: "sqlite" }))
      .toThrowErrorMatchingInlineSnapshot(`
      "Syntax Error: Expected ",", ";", "EXCEPT", "FROM", "GROUP", "HAVING", "INTERSECT", "LIMIT", "ORDER", "UNION", "WHERE", "WINDOW", or end of input but "b" found.
      --> untitled.sql:1:16
        |
      1 | SELECT foo bar baz
        |                ^"
    `);
  });

  it("indents syntax error properly when it happen on a large line number", () => {
    expect(() => parse("\n".repeat(100) + "SELECT foo bar baz", { dialect: "sqlite" }))
      .toThrowErrorMatchingInlineSnapshot(`
      "Syntax Error: Expected ",", ";", "EXCEPT", "FROM", "GROUP", "HAVING", "INTERSECT", "LIMIT", "ORDER", "UNION", "WHERE", "WINDOW", or end of input but "b" found.
      --> untitled.sql:101:16
          |
      101 | SELECT foo bar baz
          |                ^"
    `);
  });
});
