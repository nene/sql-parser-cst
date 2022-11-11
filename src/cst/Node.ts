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
import { Alias } from "./Alias";
import { AlterAction } from "./AlterTable";
import { AllColumns, BaseNode, Keyword } from "./Base";
import { AllConstraintNodes } from "./Constraint";
import { AllCreateTableNodes } from "./CreateTable";
import { AllExprNodes } from "./Expr";
import { AllInsertNodes } from "./Insert";
import { Program } from "./Program";
import { AllSelectNodes } from "./Select";
import { AllSqliteNodes } from "./Sqlite";
import { Statement } from "./Statement";
import { AllTransactionNodes } from "./Transaction";
import { AllTriggerNodes } from "./Trigger";
import { AllUpdateNodes } from "./Update";
import { AllFrameNodes } from "./WindowFrame";

export type Node =
  | Program
  | Statement
  | AllExprNodes
  | Keyword
  | AllSelectNodes
  | AllCreateTableNodes
  | AllConstraintNodes
  | AlterAction
  | AllTriggerNodes
  | AllColumns
  | AllTransactionNodes
  | AllFrameNodes
  | AllInsertNodes
  | AllUpdateNodes
  | Alias
  | AllSqliteNodes;
