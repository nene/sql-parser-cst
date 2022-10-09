import { parse as mysql, Ast } from "../pegjs/mysql";

export function parse(sql: string): Ast {
  return mysql(sql);
}
