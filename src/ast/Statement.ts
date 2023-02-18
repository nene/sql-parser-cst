import { UpdateStmt } from "./Update";
import { InsertStmt } from "./Insert";
import { CompoundSelectStmt, SelectStmt } from "./Select";
import { DeleteStmt } from "./Delete";

export type Statement =
  | CompoundSelectStmt
  | SelectStmt
  | InsertStmt
  | UpdateStmt
  | DeleteStmt;
