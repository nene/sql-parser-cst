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
});
