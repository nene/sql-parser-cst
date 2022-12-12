export * from "./Base";
export * from "./Literal";
export * from "./Expr";
export * from "./Sqlite";
export * from "./Transaction";
export * from "./WindowFrame";
export * from "./Trigger";
export * from "./Constraint";
export * from "./Insert";
export * from "./CreateTable";
export * from "./AlterTable";
export * from "./Select";
export * from "./Alias";
export * from "./View";
export * from "./Index";
export * from "./DropTable";
export * from "./Delete";
export * from "./Analyze";
export * from "./Explain";
export * from "./Statement";
export * from "./Program";
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
import { AllFunctionNodes } from "./Function";

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
  | AllFunctionNodes
  | AllSqliteNodes
  | AllBigqueryNodes;
