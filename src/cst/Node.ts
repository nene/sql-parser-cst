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
export * from "./PreparedStatements";
export * from "./ProcClause";
export * from "./Procedure";
export * from "./ProceduralLanguage";
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

import { Alias } from "./Alias";
import { AllAlterActionNodes } from "./AlterAction";
import { AllBigqueryNodes } from "./Bigquery";
import { AllColumns, Keyword } from "./Base";
import { AllConstraintNodes } from "./Constraint";
import { AllCreateTableNodes } from "./CreateTable";
import { AllDataTypeNodes } from "./DataType";
import { AllDeleteNodes } from "./Delete";
import { AllExprNodes } from "./Expr";
import { AllFrameNodes } from "./WindowFrame";
import { AllFunctionNodes } from "./Function";
import { AllIndexNodes } from "./Index";
import { AllInsertNodes } from "./Insert";
import { AllMergeNodes } from "./Merge";
import { AllPreparedStatementNodes } from "./PreparedStatements";
import { AllProcClauseNodes } from "./ProcClause";
import { AllProceduralNodes } from "./ProceduralLanguage";
import { AllProcedureNodes } from "./Procedure";
import { AllSelectNodes } from "./Select";
import { AllSqliteNodes } from "./Sqlite";
import { AllTransactionNodes } from "./Transaction";
import { AllTriggerNodes } from "./Trigger";
import { AllUpdateNodes } from "./Update";
import { Program } from "./Program";
import { Statement } from "./Statement";

export type Node =
  | Alias
  | AllAlterActionNodes
  | AllBigqueryNodes
  | AllColumns
  | AllConstraintNodes
  | AllCreateTableNodes
  | AllDataTypeNodes
  | AllDeleteNodes
  | AllExprNodes
  | AllFrameNodes
  | AllFunctionNodes
  | AllIndexNodes
  | AllInsertNodes
  | AllMergeNodes
  | AllPreparedStatementNodes
  | AllProcClauseNodes
  | AllProceduralNodes
  | AllProcedureNodes
  | AllSelectNodes
  | AllSqliteNodes
  | AllTransactionNodes
  | AllTriggerNodes
  | AllUpdateNodes
  | Keyword
  | Program
  | Statement;
