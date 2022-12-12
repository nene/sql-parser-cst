import { BaseNode, Keyword } from "./Base";
import { BigqueryOptions } from "./Bigquery";
import { DataType } from "./DataType";
import { Identifier, ListExpr, ParenExpr, Table } from "./Expr";
import { StringLiteral } from "./Literal";
import { AsClause, LanguageClause, RemoteClause } from "./ProcClause";
import { CodeBlock } from "./Program";

export type AllProcedureNodes = AllProcedureStatements | ProcedureParam;

export type AllProcedureStatements = CreateProcedureStmt | DropProcedureStmt;

// CREATE PROCEDURE
export interface CreateProcedureStmt extends BaseNode {
  type: "create_procedure_stmt";
  createKw: Keyword<"CREATE">;
  orReplaceKw?: [Keyword<"OR">, Keyword<"REPLACE">];
  procedureKw: Keyword<"PROCEDURE">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: Table;
  params: ParenExpr<ListExpr<ProcedureParam>>;
  clauses: CreateProcedureClause[];
}

export interface ProcedureParam extends BaseNode {
  type: "procedure_param";
  mode?: Keyword<"IN" | "OUT" | "INOUT">;
  name: Identifier;
  dataType: DataType;
}

type CreateProcedureClause =
  | CodeBlock
  | BigqueryOptions
  | RemoteClause
  | LanguageClause
  | AsClause<StringLiteral>;

// DROP PROCEDURE
export interface DropProcedureStmt extends BaseNode {
  type: "drop_procedure_stmt";
  dropKw: Keyword<"DROP">;
  procedureKw: Keyword<"PROCEDURE">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: Table;
}
