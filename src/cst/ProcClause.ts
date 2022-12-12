import { BaseNode, Keyword } from "./Base";
import { DataType } from "./DataType";
import { Expr, Identifier, ParenExpr, Table } from "./Expr";
import { StringLiteral } from "./Literal";
import { SubSelect } from "./Select";

export type AllProcClauseNodes =
  | ReturnsClause
  | DeterminismClause
  | LanguageClause
  | AsClause
  | RemoteClause;

export interface ReturnsClause extends BaseNode {
  type: "returns_clause";
  returnsKw: Keyword<"RETURNS">;
  dataType: DataType;
}

export interface DeterminismClause extends BaseNode {
  type: "determinism_clause";
  deterministicKw?:
    | Keyword<"DETERMINISTIC">
    | [Keyword<"NOT">, Keyword<"DETERMINISTIC">];
}

export interface LanguageClause extends BaseNode {
  type: "language_clause";
  languageKw: Keyword<"LANGUAGE">;
  name: Identifier;
}

export interface AsClause extends BaseNode {
  type: "as_clause";
  asKw: Keyword<"AS">;
  expr: ParenExpr<Expr> | StringLiteral | SubSelect;
}

export interface RemoteClause extends BaseNode {
  type: "remote_clause";
  withConnectionKw:
    | [Keyword<"REMOTE">, Keyword<"WITH">, Keyword<"CONNECTION">]
    | [Keyword<"WITH">, Keyword<"CONNECTION">];
  connection: Table;
}
