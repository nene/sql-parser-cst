import { parse as parseSql, ParserOptions, show } from "../src/parser";

type Dialect = "mysql" | "sqlite";

declare var __SQL_DIALECT__: Dialect;

export function parse(sql: string, options: ParserOptions = {}) {
  return parseSql(sql, {
    dialect: __SQL_DIALECT__,
    preserveComments: true,
    ...options,
  });
}

export function dialect(lang: Dialect | Dialect[], block: () => void) {
  lang = typeof lang === "string" ? [lang] : lang;
  if (lang.includes(__SQL_DIALECT__)) {
    describe(__SQL_DIALECT__, block);
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
  if (stmt.type !== "select_statement") {
    throw new Error(`Expected select_statement, instead got ${stmt.type}`);
  }
  const clause = stmt.clauses[0];
  if (clause.type !== "select_clause") {
    throw new Error(`Expected select_clause, instead got ${clause.type}`);
  }
  if (clause.columns.length !== 1) {
    throw new Error(`Expected 1 column, instead got ${clause.columns.length}`);
  }
  return clause.columns[0];
}

export { show };
