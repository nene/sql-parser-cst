import { UpdateStmt } from "src/main";
import { InsertStmt } from "./Insert";
import { CompoundSelectStmt, SelectStmt } from "./Select";

export type Statement =
  | CompoundSelectStmt
  | SelectStmt
  | InsertStmt
  | UpdateStmt;
