import { InsertStmt } from "./Insert";
import { CompoundSelectStmt, SelectStmt } from "./Select";

export type Statement = CompoundSelectStmt | SelectStmt | InsertStmt;
