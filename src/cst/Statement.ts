import { AllBigqueryStatements } from "./Bigquery";
import { AllDclStatements } from "./Dcl";
import { AllFunctionStatements } from "./Function";
import { AllIndexStatements } from "./Index";
import { AllProceduralStatements } from "./ProceduralLanguage";
import { AllProcedureStatements } from "./Procedure";
import { AllSchemaStatements } from "./Schema";
import { AllSqliteStatements } from "./Sqlite";
import { AllTransactionStatements } from "./Transaction";
import { AllTriggerStatements } from "./Trigger";
import { AllViewStatements } from "./View";
import { AlterTableStmt } from "./AlterTable";
import { AnalyzeStmt } from "./Analyze";
import { CompoundSelectStmt, SelectStmt } from "./Select";
import { CreateTableStmt } from "./CreateTable";
import { DeleteStmt } from "./Delete";
import { DropTableStmt } from "./DropTable";
import { Empty } from "./Base";
import { ExplainStmt } from "./Explain";
import { InsertStmt } from "./Insert";
import { MergeStmt } from "./Merge";
import { TruncateStmt } from "./Truncate";
import { UpdateStmt } from "./Update";

export type Statement =
  | AllBigqueryStatements
  | AllDclStatements
  | AllFunctionStatements
  | AllIndexStatements
  | AllProceduralStatements
  | AllProcedureStatements
  | AllSchemaStatements
  | AllSqliteStatements
  | AllTransactionStatements
  | AllTriggerStatements
  | AllViewStatements
  | AlterTableStmt
  | AnalyzeStmt
  | CompoundSelectStmt
  | CreateTableStmt
  | DeleteStmt
  | DropTableStmt
  | Empty
  | ExplainStmt
  | InsertStmt
  | MergeStmt
  | SelectStmt
  | TruncateStmt
  | UpdateStmt;
