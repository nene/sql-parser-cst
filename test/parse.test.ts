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
      "Syntax Error: Unexpected "baz"
      Was expecting to see: ",", ";", "EXCEPT", "FROM", "GROUP", "HAVING", "INTERSECT", "LIMIT", "ORDER", "UNION", "WHERE", "WINDOW", or end of input
      --> untitled.sql:1:16
        |
      1 | SELECT foo bar baz
        |                ^"
    `);
  });

  it("indents syntax error properly when it happen on a large line number", () => {
    expect(() => parse("\n".repeat(100) + "SELECT foo bar baz", { dialect: "sqlite" }))
      .toThrowErrorMatchingInlineSnapshot(`
      "Syntax Error: Unexpected "baz"
      Was expecting to see: ",", ";", "EXCEPT", "FROM", "GROUP", "HAVING", "INTERSECT", "LIMIT", "ORDER", "UNION", "WHERE", "WINDOW", or end of input
      --> untitled.sql:101:16
          |
      101 | SELECT foo bar baz
          |                ^"
    `);
  });

  it("uses the filename option in syntax error messages", () => {
    expect(() => parse("CREATE PUZZLE 123;", { dialect: "sqlite", fileName: "prod-database.sql" }))
      .toThrowErrorMatchingInlineSnapshot(`
      "Syntax Error: Unexpected "PUZZLE"
      Was expecting to see: "ASSIGNMENT", "CAPACITY", "DATABASE", "FULLTEXT", "INDEX", "MATERIALIZED", "OR", "RESERVATION", "SCHEMA", "SPATIAL", "TABLE", "TEMP", "TEMPORARY", "TRIGGER", "UNIQUE", "VIEW", or "VIRTUAL"
      --> prod-database.sql:1:8
        |
      1 | CREATE PUZZLE 123;
        |        ^"
    `);
  });
});
