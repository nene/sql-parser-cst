import { parse as mysql, Ast } from "../pegjs/mysql";
import { show as showSql } from "./show";

export function parse(sql: string): Ast {
  return mysql(sql);
}

export function show(ast: Ast): string {
  return showSql(ast, "; ").trimEnd();
}
