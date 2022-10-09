import { parse as mysql } from "../pegjs/mysql";

export function parse(sql: string): boolean {
  return mysql(sql);
}
