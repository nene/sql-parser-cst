import { BaseNode, Keyword } from "./Base";
import { DataType } from "./DataType";
import { Identifier, ListExpr, Expr } from "./Expr";

export type AllProceduralNodes = AllProceduralStatements | DeclareDefault;

export type AllProceduralStatements = DeclareStmt;

// DECLARE
export interface DeclareStmt extends BaseNode {
  type: "declare_stmt";
  declareKw: Keyword<"DECLARE">;
  names: ListExpr<Identifier>;
  dataType?: DataType;
  default?: DeclareDefault;
}

export interface DeclareDefault extends BaseNode {
  type: "declare_default";
  defaultKw: Keyword<"DEFAULT">;
  expr: Expr;
}
