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
import { Program } from "./Program";
import { Statement } from "./Statement";
import { AllColumns, Keyword } from "./Base";
import { Alias } from "./Alias";
import { AlterAction } from "./AlterTable";
import { AllConstraintNodes } from "./Constraint";
import { AllCreateTableNodes } from "./CreateTable";
import { AllExprNodes } from "./Expr";
import { AllInsertNodes } from "./Insert";
import { AllSelectNodes } from "./Select";
import { AllSqliteNodes } from "./Sqlite";
import { AllTransactionNodes } from "./Transaction";
import { AllTriggerNodes } from "./Trigger";
import { AllUpdateNodes } from "./Update";
import { AllFrameNodes } from "./WindowFrame";
import { AllMergeNodes } from "./Merge";

export type Node =
  | Program
  | Statement
  | Keyword
  | AllColumns
  | Alias
  | AllExprNodes
  | AllSelectNodes
  | AllCreateTableNodes
  | AllConstraintNodes
  | AlterAction
  | AllTriggerNodes
  | AllTransactionNodes
  | AllFrameNodes
  | AllInsertNodes
  | AllUpdateNodes
  | AllMergeNodes
  | AllSqliteNodes;
