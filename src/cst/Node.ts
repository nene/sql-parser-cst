export * from "./Alias";
export * from "./AlterAction";
export * from "./AlterTable";
export * from "./Analyze";
export * from "./Base";
export * from "./Bigquery";
export * from "./Constraint";
export * from "./CreateTable";
export * from "./DataType";
export * from "./Dcl";
export * from "./Delete";
export * from "./DropTable";
export * from "./Explain";
export * from "./Expr";
export * from "./Function";
export * from "./Index";
export * from "./Insert";
export * from "./Literal";
export * from "./Merge";
export * from "./ProcClause";
export * from "./Procedure";
export * from "./Program";
export * from "./Schema";
export * from "./Select";
export * from "./Sqlite";
export * from "./Statement";
export * from "./Transaction";
export * from "./Trigger";
export * from "./Truncate";
export * from "./Update";
export * from "./View";
export * from "./WindowFrame";
import { AllProgramNodes } from "./Program";
import { Statement } from "./Statement";
import { AllColumns, Keyword } from "./Base";
import { Alias } from "./Alias";
import { AllAlterActionNodes } from "./AlterAction";
import { AllConstraintNodes } from "./Constraint";
import { AllCreateTableNodes } from "./CreateTable";
import { AllDataTypeNodes } from "./DataType";
import { AllExprNodes } from "./Expr";
import { AllInsertNodes } from "./Insert";
import { AllSelectNodes } from "./Select";
import { AllTransactionNodes } from "./Transaction";
import { AllTriggerNodes } from "./Trigger";
import { AllUpdateNodes } from "./Update";
import { AllFrameNodes } from "./WindowFrame";
import { AllMergeNodes } from "./Merge";
import { AllSqliteNodes } from "./Sqlite";
import { AllBigqueryNodes } from "./Bigquery";
import { AllIndexNodes } from "./Index";
import { AllProcClauseNodes } from "./ProcClause";
import { AllFunctionNodes } from "./Function";
import { AllProcedureNodes } from "./Procedure";

export type Node =
  | AllProgramNodes
  | Statement
  | Keyword
  | AllColumns
  | Alias
  | AllExprNodes
  | AllSelectNodes
  | AllCreateTableNodes
  | AllDataTypeNodes
  | AllConstraintNodes
  | AllAlterActionNodes
  | AllTriggerNodes
  | AllTransactionNodes
  | AllFrameNodes
  | AllInsertNodes
  | AllUpdateNodes
  | AllMergeNodes
  | AllIndexNodes
  | AllProcClauseNodes
  | AllFunctionNodes
  | AllProcedureNodes
  | AllSqliteNodes
  | AllBigqueryNodes;
