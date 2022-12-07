import { BaseNode, Keyword } from "./Base";
import { DataType } from "./DataType";
import { Expr, Identifier, ListExpr, ParenExpr, Table } from "./Expr";
import { StringLiteral } from "./Literal";

export type AllFunctionNodes =
  | AllFunctionStatements
  | FunctionParam
  | FunctionReturns;

export type AllFunctionStatements = CreateFunctionStmt;

// CREATE FUNCTION
export interface CreateFunctionStmt extends BaseNode {
  type: "create_function_stmt";
  createKw: Keyword<"CREATE">;
  orReplaceKw?: [Keyword<"OR">, Keyword<"REPLACE">];
  temporaryKw?: Keyword<"TEMP" | "TEMPORARY">;
  functionKw: Keyword<"FUNCTION">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: Table;
  params: ParenExpr<ListExpr<FunctionParam>>;
  returns?: FunctionReturns;
  asKw: Keyword<"AS">;
  expr: ParenExpr<Expr> | StringLiteral;
}

export interface FunctionParam extends BaseNode {
  type: "function_param";
  name: Identifier;
  dataType: DataType;
}

export interface FunctionReturns extends BaseNode {
  type: "function_returns";
  returnsKw: Keyword<"RETURNS">;
  dataType: DataType;
}
