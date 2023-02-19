import { UpdateStmt } from "./Update";
import { InsertStmt } from "./Insert";
import { CompoundSelectStmt, SelectStmt } from "./Select";
import { DeleteStmt } from "./Delete";
import { CreateTableStmt } from "./CreateTable";

export type Statement =
  | CompoundSelectStmt
  | SelectStmt
  | InsertStmt
  | UpdateStmt
  | DeleteStmt
  | CreateTableStmt;
