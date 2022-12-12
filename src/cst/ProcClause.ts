import { BaseNode, Keyword } from "./Base";
import { DataType } from "./DataType";
import { Identifier, Table } from "./Expr";
import { Node } from "./Node";

export type AllProcClauseNodes =
  | ReturnsClause
  | DeterminismClause
  | LanguageClause
  | AsClause
  | WithConnectionClause;

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

export interface AsClause<T = Node> extends BaseNode {
  type: "as_clause";
  asKw: Keyword<"AS">;
  expr: T;
}

export interface WithConnectionClause extends BaseNode {
  type: "with_connection_clause";
  withConnectionKw:
    | [Keyword<"REMOTE">, Keyword<"WITH">, Keyword<"CONNECTION">]
    | [Keyword<"WITH">, Keyword<"CONNECTION">];
  connection: Table;
}
