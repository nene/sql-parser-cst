import { BaseNode, Keyword } from "./Base";
import { BigqueryOptions } from "./Bigquery";
import { DataType } from "./DataType";
import { Expr, Identifier, ListExpr, ParenExpr, Table } from "./Expr";
import { StringLiteral } from "./Literal";
import {
  AsClause,
  DeterminismClause,
  LanguageClause,
  RemoteClause,
  ReturnsClause,
} from "./ProcClause";
import { SubSelect } from "./Select";

export type AllFunctionNodes = AllFunctionStatements | FunctionParam;

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
  | ReturnsClause
  | DeterminismClause
  | LanguageClause
  | AsClause<ParenExpr<Expr> | StringLiteral | SubSelect>
  | BigqueryOptions
  | RemoteClause;

export interface DropFunctionStmt extends BaseNode {
  type: "drop_function_stmt";
  dropKw: Keyword<"DROP">;
  tableKw?: Keyword<"TABLE">;
  functionKw: Keyword<"FUNCTION">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: Table;
}
