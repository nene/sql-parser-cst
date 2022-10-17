import { parse as parseSql, show } from "../src/parser";

type Dialect = "mysql" | "sqlite";

declare var __SQL_DIALECT__: Dialect;

export function parse(sql: string) {
  return parseSql(sql, __SQL_DIALECT__);
}

export function dialect(lang: Dialect, block: () => void) {
  if (lang === __SQL_DIALECT__) {
    describe(lang, block);
  }
}

export function test(sql: string) {
  expect(show(parse(sql))).toBe(sql);
}

export function testExpr(expr: string) {
  expect(show(parse(`SELECT ${expr}`))).toBe(`SELECT ${expr}`);
}

export function parseExpr(expr: string) {
  const stmt = parse(`SELECT ${expr}`)[0];
  if (stmt.type === "select_statement") {
    return stmt.select.columns[0];
  } else {
    throw new Error(
      `Expected create_table_statement, instead got ${stmt.type}`
    );
  }
}

export { show };
