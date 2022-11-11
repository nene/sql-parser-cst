import { AlterTableStmt } from "./AlterTable";
import { AnalyzeStmt } from "./Analyze";
import { BaseNode } from "./Base";
import { CreateTableStmt } from "./CreateTable";
import { DeleteStmt } from "./Delete";
import { DropTableStmt } from "./DropTable";
import { ExplainStmt } from "./Explain";
import { CreateIndexStmt, DropIndexStmt } from "./Index";
import { InsertStmt } from "./Insert";
import { CompoundSelectStmt, SelectStmt } from "./Select";
import { SqliteStmt } from "./Sqlite";
import { TransactionStmt } from "./Transaction";
import { CreateTriggerStmt, DropTriggerStmt } from "./Trigger";
import { UpdateStmt } from "./Update";
import { CreateViewStmt, DropViewStmt } from "./View";

export type Statement =
  | EmptyStmt
  | CompoundSelectStmt
  | SelectStmt
  | CreateTableStmt
  | AlterTableStmt
  | DropTableStmt
  | InsertStmt
  | DeleteStmt
  | UpdateStmt
  | CreateViewStmt
  | DropViewStmt
  | CreateIndexStmt
  | DropIndexStmt
  | CreateTriggerStmt
  | DropTriggerStmt
  | AnalyzeStmt
  | ExplainStmt
  | TransactionStmt
  | SqliteStmt;

export interface EmptyStmt extends BaseNode {
  type: "empty_stmt";
}
