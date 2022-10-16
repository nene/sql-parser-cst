import { parse as mysql, Ast } from "../pegjs/mysql";
import { parse as sqlite } from "../pegjs/sqlite";
import { show as showSql } from "./show";

export function parse(sql: string, dialect: "mysql" | "sqlite" = "mysql"): Ast {
  switch (dialect) {
    case "mysql":
      return mysql(sql);
    case "sqlite":
      return sqlite(sql);
  }
}

export function show(ast: Ast): string {
  return showSql(ast, "; ").trimEnd();
}
