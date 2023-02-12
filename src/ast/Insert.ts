import { BaseNode } from "./Base";

export type AllInsertNodes = InsertStmt;

export interface InsertStmt extends BaseNode {
  type: "insert_stmt";
  // TODO...
}
