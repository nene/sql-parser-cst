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
import { Alias } from "./Alias";
import { AlterAction, AlterTableStmt } from "./AlterTable";
import { AnalyzeStmt } from "./Analyze";
import { AllColumns, BaseNode, Keyword } from "./Base";
import { AllConstraintNodes } from "./Constraint";
import { AllCreateTableNodes, CreateTableStmt } from "./CreateTable";
import { DeleteStmt } from "./Delete";
import { DropTableStmt } from "./DropTable";
import { ExplainStmt } from "./Explain";
import { AllExprNodes } from "./Expr";
import { CreateIndexStmt, DropIndexStmt } from "./Index";
import { AllInsertNodes, InsertStmt } from "./Insert";
import { AllSelectNodes, CompoundSelectStmt, SelectStmt } from "./Select";
import { AllSqliteNodes, SqliteStmt } from "./Sqlite";
import { AllTransactionNodes, TransactionStmt } from "./Transaction";
import { AllTriggerNodes, CreateTriggerStmt, DropTriggerStmt } from "./Trigger";
import { AllUpdateNodes, UpdateStmt } from "./Update";
import { CreateViewStmt, DropViewStmt } from "./View";
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

export interface Program extends BaseNode {
  type: "program";
  statements: Statement[];
}

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
