import { BaseNode, Keyword } from "./Base";
import { BigqueryOptions } from "./dialects/Bigquery";
import { DataType } from "./DataType";
import { Expr, Identifier, ListExpr, ParenExpr, EntityName } from "./Expr";
import { StringLiteral } from "./Literal";
import {
  AsClause,
  DeterminismClause,
  LanguageClause,
  WithConnectionClause,
  ReturnsClause,
} from "./ProcClause";
import { SubSelect } from "./Select";

export type AllFunctionNodes =
  | AllFunctionStatements
  | FunctionParam
  | ReturnClause;

export type AllFunctionStatements = CreateFunctionStmt | DropFunctionStmt;

// CREATE FUNCTION
export interface CreateFunctionStmt extends BaseNode {
  type: "create_function_stmt";
  createKw: Keyword<"CREATE">;
  orReplaceKw?: [Keyword<"OR">, Keyword<"REPLACE">];
  temporaryKw?: Keyword<"TEMP" | "TEMPORARY">;
  tableKw?: Keyword<"TABLE">;
  functionKw: Keyword<"FUNCTION">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: EntityName;
  params: ParenExpr<ListExpr<FunctionParam>>;
  clauses: CreateFunctionClause[];
}

export interface FunctionParam extends BaseNode {
  type: "function_param";
  name: Identifier;
  dataType: DataType;
}

type CreateFunctionClause =
  | ReturnsClause
  | ReturnClause
  | DeterminismClause
  | LanguageClause
  | AsClause<ParenExpr<Expr> | StringLiteral | SubSelect>
  | BigqueryOptions
  | WithConnectionClause;

// PostgreSQL
// Note: Do not confuse this with "returns_clause", which defines the return type.
export interface ReturnClause extends BaseNode {
  type: "return_clause";
  returnKw: Keyword<"RETURN">;
  expr: Expr;
}

export interface DropFunctionStmt extends BaseNode {
  type: "drop_function_stmt";
  dropKw: Keyword<"DROP">;
  tableKw?: Keyword<"TABLE">;
  functionKw: Keyword<"FUNCTION">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: EntityName;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}
