import { AllAlterTableStatements } from "./AlterTable";
import { AllBigqueryStatements } from "./dialects/Bigquery";
import { AllCommentStatements } from "./Comment";
import { AllDclStatements } from "./Dcl";
import { AllDomainStatements } from "./Domain";
import { AllExtensionNodes } from "./Extension";
import { AllFunctionStatements } from "./Function";
import { AllIndexStatements } from "./Index";
import { AllParameterStatements } from "./Parameter";
import { AllPolicyStatements } from "./Policy";
import { AllPreparedStatements } from "./PreparedStatements";
import { AllProceduralStatements } from "./ProceduralLanguage";
import { AllProcedureStatements } from "./Procedure";
import { AllPublicationStatements } from "./Publication";
import { AllSchemaStatements } from "./Schema";
import { AllSequenceStatements } from "./Sequence";
import { AllSqliteStatements } from "./dialects/Sqlite";
import { AllSubscriptionNodes } from "./Subscription";
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
import { UnsupportedGrammarStmt } from "./UnsupportedGrammar";
import { DoStmt } from "./Do";

export type Statement =
  | AllAlterTableStatements
  | AllBigqueryStatements
  | AllCommentStatements
  | AllDclStatements
  | AllDomainStatements
  | AllExtensionNodes
  | AllFunctionStatements
  | AllIndexStatements
  | AllPolicyStatements
  | AllPreparedStatements
  | AllProceduralStatements
  | AllProcedureStatements
  | AllPublicationStatements
  | AllSchemaStatements
  | AllSequenceStatements
  | AllSubscriptionNodes
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
