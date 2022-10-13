import { parse } from "../src/parser";

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
