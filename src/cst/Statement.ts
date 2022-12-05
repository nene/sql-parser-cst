import { AlterTableStmt } from "./AlterTable";
import { AnalyzeStmt } from "./Analyze";
import { Empty } from "./Base";
import { CreateTableStmt } from "./CreateTable";
import { DeleteStmt } from "./Delete";
import { DropTableStmt } from "./DropTable";
import { ExplainStmt } from "./Explain";
import { AllIndexStatements } from "./Index";
import { InsertStmt } from "./Insert";
import { MergeStmt } from "./Merge";
import { CompoundSelectStmt, SelectStmt } from "./Select";
import { AllSqliteStatements } from "./Sqlite";
import { AllTransactionStatements } from "./Transaction";
import { AllTriggerStatements } from "./Trigger";
import { TruncateStmt } from "./Truncate";
import { UpdateStmt } from "./Update";
import { AllViewStatements } from "./View";
import { AllSchemaStatements } from "./Schema";

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
  | AllViewStatements
  | AllSchemaStatements
  | AllIndexStatements
  | AllTriggerStatements
  | AnalyzeStmt
  | ExplainStmt
  | AllTransactionStatements
  | AllSqliteStatements;
