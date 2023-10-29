import { parse } from "../src/main";

describe("parse()", () => {
  it("throws helpful error when called without options", () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    expect(() => (parse as any)("SELECT col FROM tbl")).toThrowErrorMatchingInlineSnapshot(
      `"No SQL dialect specified."`
    );
  });

  it("throws helpful error when called without dialect name", () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    expect(() => parse("SELECT col FROM tbl", {} as any)).toThrowErrorMatchingInlineSnapshot(
      `"No SQL dialect specified."`
    );
  });

  it("throws helpful error when called with incorrect dialect name", () => {
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      parse("SELECT col FROM tbl", { dialect: "aliensql" as any })
    ).toThrowErrorMatchingInlineSnapshot(`"Unsupported dialect name: "aliensql""`);
  });

  it("throws nicely formatted error message when SQL syntax error found", () => {
    expect(() => parse("SELECT foo bar baz", { dialect: "sqlite" }))
      .toThrowErrorMatchingInlineSnapshot(`
      "Syntax Error: Unexpected "baz"
      Was expecting to see: ",", ";", "EXCEPT", "FROM", "GROUP", "HAVING", "INTERSECT", "LIMIT", "ORDER", "UNION", "WHERE", "WINDOW", or end of input
      --> undefined:1:16
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
      --> undefined:101:16
          |
      101 | SELECT foo bar baz
          |                ^"
    `);
  });

  it("uses the filename option in syntax error messages", () => {
    expect(() =>
      parse("INSERT TODAYS PUZZLE 123;", { dialect: "sqlite", filename: "prod-database.sql" })
    ).toThrowErrorMatchingInlineSnapshot(`
      "Syntax Error: Unexpected "PUZZLE"
      Was expecting to see: "(", ".", "AS", "DEFAULT", "SELECT", "TABLE", "VALUE", "VALUES", or "WITH"
      --> prod-database.sql:1:15
        |
      1 | INSERT TODAYS PUZZLE 123;
        |               ^"
    `);
  });
});
