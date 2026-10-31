import { parse, show } from "../src/main";
import { includeAll } from "./test_utils";

describe("psql scripts", () => {
  it.each([
    "\\set id 1\nSELECT :id, :'name' FROM :\"table\";\n\\quit\n",
    "\\if :enabled\nSELECT 1\n\\gset result_\n\\else\nSELECT 2;\n\\endif\n",
    "\\restrict abc123\nSELECT 1;\n\\unrestrict abc123\n",
    "-- heading\nSELECT 1; -- trailing\n\\echo 'done'\n",
    "SELECT 1\n\\gexec\nSELECT 2;",
    "SELECT 1",
    "\\echo 'two words with ''quotes'''\n",
    '\\echo "two words"\n',
    "\\echo `printf hi`\n",
    "\\unknown value\n",
    "SELECT :id, :'name', :\"table\", :{?enabled};",
  ])("round-trips %s", (sql) => {
    const tree = parse(sql, { dialect: "postgresql", psql: true, ...includeAll });
    expect(show(tree)).toBe(sql);
    expect(tree.psql).toBe(true);
  });

  it.each(["SELECT\n\\echo partial\n1;", "SELECT 1 \\gset", "\\echo hi \\\\ SELECT 1;"])(
    "rejects unsupported command placement or syntax: %s",
    (sql) => {
      expect(() => parse(sql, { dialect: "postgresql", psql: true })).toThrow();
    }
  );

  it("requires opt-in and the PostgreSQL dialect", () => {
    expect(() => parse("\\quit", { dialect: "postgresql" })).toThrow();
    expect(() => parse("\\quit", { dialect: "sqlite", psql: true })).toThrow();
  });
});
