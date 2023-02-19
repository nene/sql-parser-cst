export * from "./Alias";
export * from "./Base";
export * from "./Constraint";
export * from "./CreateTable";
export * from "./Delete";
export * from "./Expr";
export * from "./Insert";
export * from "./Literal";
export * from "./Program";
export * from "./Select";
export * from "./Statement";
export * from "./Update";
export * from "./WindowFrame";

import { Alias } from "./Alias";
import { AllColumns } from "./Base";
import { AllConstraintNodes } from "./Constraint";
import { AllCreateTableNodes } from "./CreateTable";
import { AllDataTypeNodes } from "./DataType";
import { AllDeleteNodes } from "./Delete";
import { AllExprNodes } from "./Expr";
import { AllFrameNodes } from "./WindowFrame";
import { AllInsertNodes } from "./Insert";
import { AllSelectNodes } from "./Select";
import { AllUpdateNodes } from "./Update";
import { Program } from "./Program";
import { Statement } from "./Statement";

export type Node =
  | Alias
  | AllColumns
  | AllConstraintNodes
  | AllCreateTableNodes
  | AllDataTypeNodes
  | AllDeleteNodes
  | AllExprNodes
  | AllFrameNodes
  | AllInsertNodes
  | AllSelectNodes
  | AllUpdateNodes
  | Program
  | Statement;
