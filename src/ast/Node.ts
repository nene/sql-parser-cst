export * from "./Alias";
export * from "./Base";
export * from "./Expr";
export * from "./Insert";
export * from "./Program";
export * from "./Select";
export * from "./Statement";

import { Alias } from "./Alias";
import { AllColumns } from "./Base";
import { AllExprNodes } from "./Expr";
import { AllInsertNodes } from "./Insert";
import { AllSelectNodes } from "./Select";
import { Program } from "./Program";
import { Statement } from "./Statement";

export type Node =
  | Alias
  | AllColumns
  | AllExprNodes
  | AllInsertNodes
  | AllSelectNodes
  | Program
  | Statement;
