import { AlterTableStmt } from "./AlterTable";
import { AnalyzeStmt } from "./Analyze";
import { Empty } from "./Base";
import { CreateTableStmt } from "./CreateTable";
import { DeleteStmt } from "./Delete";
import { DropTableStmt } from "./DropTable";
import { ExplainStmt } from "./Explain";
import { CreateIndexStmt, DropIndexStmt } from "./Index";
import { InsertStmt } from "./Insert";
import { MergeStmt } from "./Merge";
import { CompoundSelectStmt, SelectStmt } from "./Select";
import { SqliteStmt } from "./Sqlite";
import { TransactionStmt } from "./Transaction";
import { CreateTriggerStmt, DropTriggerStmt } from "./Trigger";
import { TruncateStmt } from "./Truncate";
import { UpdateStmt } from "./Update";
import { CreateViewStmt, DropViewStmt } from "./View";

export type Statement =
  | Empty
  | CompoundSelectStmt
  | SelectStmt
  | CreateTableStmt
  | AlterTableStmt
  | DropTableStmt
  | InsertStmt
  | DeleteStmt
  | TruncateStmt
  | UpdateStmt
  | MergeStmt
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
