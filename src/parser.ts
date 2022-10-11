import { parse as mysql, Ast } from "../pegjs/mysql";
export { show } from "./show";

export function parse(sql: string): Ast {
  return mysql(sql);
}
