import { AllAlterTableStatements } from "./AlterTable";
import { AllBigqueryStatements } from "./dialects/Bigquery";
import { AllCommentStatements } from "./Comment";
import { AllDclStatements } from "./Dcl";
import { AllFunctionStatements } from "./Function";
import { AllIndexStatements } from "./Index";
import { AllProceduralStatements } from "./ProceduralLanguage";
import { AllProcedureStatements } from "./Procedure";
import { AllSchemaStatements } from "./Schema";
import { AllSequenceStatements } from "./Sequence";
import { AllParameterStatements } from "./Parameter";
import { AllSqliteStatements } from "./dialects/Sqlite";
import { AllTransactionStatements } from "./Transaction";
import { AllTriggerStatements } from "./Trigger";
import { AllTypeStatements } from "./Type";
import { AllViewStatements } from "./View";
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
import { AllPreparedStatements } from "./PreparedStatements";
import { UnsupportedGrammarStmt } from "./UnsupportedGrammar";
import { AllPolicyStatements } from "./Policy";
import { DoStmt } from "./Do";

export type Statement =
  | AllAlterTableStatements
  | AllBigqueryStatements
  | AllCommentStatements
  | AllDclStatements
  | AllFunctionStatements
  | AllIndexStatements
  | AllPolicyStatements
  | AllPreparedStatements
  | AllProceduralStatements
  | AllProcedureStatements
  | AllSchemaStatements
  | AllSequenceStatements
  | AllParameterStatements
  | AllSqliteStatements
  | AllTransactionStatements
  | AllTriggerStatements
  | AllTypeStatements
  | AllViewStatements
  | AnalyzeStmt
  | CompoundSelectStmt
  | CreateTableStmt
  | DeleteStmt
  | DoStmt
  | DropTableStmt
  | Empty
  | ExplainStmt
  | InsertStmt
  | MergeStmt
  | SelectStmt
  | TruncateStmt
  | UpdateStmt
  | UnsupportedGrammarStmt;
