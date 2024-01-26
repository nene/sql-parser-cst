import { BaseNode, Keyword } from "./Base";
import { BigqueryOptions } from "./dialects/Bigquery";
import { ListExpr, ParenExpr, EntityName } from "./Expr";
import { StringLiteral } from "./Literal";
import { AsClause, LanguageClause, WithConnectionClause } from "./ProcClause";
import { BlockStmt } from "./ProceduralLanguage";
import { DynamicallyLoadedFunction, FunctionParam } from "./Function";

export type AllProcedureNodes = AllProcedureStatements;

export type AllProcedureStatements = CreateProcedureStmt | DropProcedureStmt;

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
  | AsClause<StringLiteral | DynamicallyLoadedFunction>;

// DROP PROCEDURE
export interface DropProcedureStmt extends BaseNode {
  type: "drop_procedure_stmt";
  dropKw: Keyword<"DROP">;
  procedureKw: Keyword<"PROCEDURE">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: EntityName;
  params?: ParenExpr<ListExpr<FunctionParam>>;
  behaviorKw?: Keyword<"RESTRICT" | "CASCADE">;
}
