import { Ast, ParserOptions } from "../pegjs/sql";
import { parse as mysql } from "../pegjs/dialects/mysql";
import { parse as sqlite } from "../pegjs/dialects/sqlite";
import { show as showSql } from "./show";

export type DialectOption = { dialect?: "mysql" | "sqlite" };

export { ParserOptions };

export function parse(
  sql: string,
  options: ParserOptions & DialectOption = {}
): Ast {
  switch (options.dialect || "mysql") {
    case "mysql":
      return mysql(sql, options);
    case "sqlite":
      return sqlite(sql, options);
  }
}

export function show(ast: Ast): string {
  return showSql(ast, "; ").trimEnd();
}
