import { BaseNode, Keyword } from "./Base";
import { DataType } from "./DataType";
import { Identifier, ListExpr, ParenExpr, BinaryExpr, Expr } from "./Expr";

export type AllProceduralNodes = AllProceduralStatements | DeclareDefault;

export type AllProceduralStatements = DeclareStmt | SetStmt;

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

// SET
export interface SetStmt extends BaseNode {
  type: "set_stmt";
  setKw: Keyword<"SET">;
  assignments: ListExpr<
    BinaryExpr<Identifier | ParenExpr<ListExpr<Identifier>>, "=", Expr>
  >;
}
