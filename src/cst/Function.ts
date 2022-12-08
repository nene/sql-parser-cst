import { BaseNode, Keyword } from "./Base";
import { DataType } from "./DataType";
import { Expr, Identifier, ListExpr, ParenExpr, Table } from "./Expr";
import { StringLiteral } from "./Literal";

export type AllFunctionNodes =
  | AllFunctionStatements
  | FunctionParam
  | FunctionReturns
  | FunctionDeterminism
  | FunctionLanguage
  | FunctionAs;

export type AllFunctionStatements = CreateFunctionStmt | DropFunctionStmt;

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
  clauses: CreateFunctionClause[];
}

export interface FunctionParam extends BaseNode {
  type: "function_param";
  name: Identifier;
  dataType: DataType;
}

type CreateFunctionClause =
  | FunctionReturns
  | FunctionDeterminism
  | FunctionLanguage
  | FunctionAs;

export interface FunctionReturns extends BaseNode {
  type: "function_returns";
  returnsKw: Keyword<"RETURNS">;
  dataType: DataType;
}

export interface FunctionDeterminism extends BaseNode {
  type: "function_determinism";
  deterministicKw?:
    | Keyword<"DETERMINISTIC">
    | [Keyword<"NOT">, Keyword<"DETERMINISTIC">];
}

export interface FunctionLanguage extends BaseNode {
  type: "function_language";
  languageKw: Keyword<"LANGUAGE">;
  language: Identifier;
}

export interface FunctionAs extends BaseNode {
  type: "function_as";
  asKw: Keyword<"AS">;
  expr: ParenExpr<Expr> | StringLiteral;
}

export interface DropFunctionStmt extends BaseNode {
  type: "drop_function_stmt";
  dropKw: Keyword<"DROP">;
  tableKw?: Keyword<"TABLE">;
  functionKw: Keyword<"FUNCTION">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: Table;
}
