import { InsertStmt } from "./Insert";
import { SelectStmt } from "./Select";

export type Statement = SelectStmt | InsertStmt;
