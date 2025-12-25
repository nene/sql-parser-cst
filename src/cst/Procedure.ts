import { BaseNode, Keyword } from "./Base";
import { BigqueryOptions } from "./dialects/Bigquery";
import { ListExpr, ParenExpr, EntityName } from "./Expr";
import { StringLiteral } from "./Literal";
import { AsClause, LanguageClause, WithConnectionClause } from "./ProcClause";
import { BlockStmt } from "./ProceduralLanguage";
import {
  DynamicallyLoadedFunction,
  FunctionParam,
  FunctionSecurityClause,
  FunctionSignature,
  FunctionTransformClause,
} from "./Function";
import { AlterFunctionAction } from "./AlterAction";
import {
  ResetParameterClause,
  SetParameterClause,
  SetParameterFromCurrentClause,
} from "./Parameter";

export type AllProcedureNodes = AllProcedureStatements;

export type AllProcedureStatements =
  | CreateProcedureStmt
  | DropProcedureStmt
  | AlterProcedureStmt;

// CREATE PROCEDURE
export interface CreateProcedureStmt extends BaseNode {
  type: "create_procedure_stmt";
  createKw: Keyword<"CREATE">;
  orReplaceKw?: [Keyword<"OR">, Keyword<"REPLACE">];
  procedureKw: Keyword<"PROCEDURE">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: EntityName;
  params: ParenExpr<ListExpr<FunctionParam>>;
  clauses: CreateProcedureClause[];
}

type CreateProcedureClause =
  | BlockStmt
  | BigqueryOptions
  | WithConnectionClause
  | LanguageClause
  | AsClause<StringLiteral | DynamicallyLoadedFunction>
  | FunctionSecurityClause
  | FunctionTransformClause
  | SetParameterClause
  | SetParameterFromCurrentClause;

// DROP PROCEDURE
export interface DropProcedureStmt extends BaseNode {
  type: "drop_procedure_stmt";
  dropKw: Keyword<"DROP">;
  procedureKw: Keyword<"PROCEDURE">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  signatures: ListExpr<FunctionSignature>;
  behaviorKw?: Keyword<"RESTRICT" | "CASCADE">;
}

// PostgreSQL
export interface AlterProcedureStmt extends BaseNode {
  type: "alter_procedure_stmt";
  alterKw: Keyword<"ALTER">;
  procedureKw: Keyword<"PROCEDURE">;
  name: EntityName;
  params?: ParenExpr<ListExpr<FunctionParam>>;
  actions: (AlterFunctionAction | AlterProcedureClause)[];
  behaviorKw?: Keyword<"RESTRICT">;
}

type AlterProcedureClause =
  | SetParameterClause
  | SetParameterFromCurrentClause
  | ResetParameterClause
  | FunctionSecurityClause;
