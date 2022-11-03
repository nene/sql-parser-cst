import { dialect, parse, preserveAll, show } from "./test_utils";

describe("table options", () => {
  function testOpts(options: string) {
    const sql = `CREATE TABLE t (id INT) ${options}`;
    expect(show(parse(sql, preserveAll))).toBe(sql);
  }

  dialect("sqlite", () => {
    it("supports CREATE TABLE with STRICT & WITHOUT ROWID options", () => {
      testOpts("STRICT");
      testOpts("WITHOUT ROWID");
      testOpts("STRICT, WITHOUT ROWID");
      testOpts("/*c0*/ STRICT /*c1*/,/*c2*/ WITHOUT /*c3*/ ROWID");
    });
  });
});
