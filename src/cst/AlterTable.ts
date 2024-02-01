import { AlterActionSetTablespace, AlterTableAction } from "./AlterAction";
import { BaseNode, Keyword } from "./Base";
import { FuncCall, Identifier, ListExpr } from "./Expr";
import { RelationExpr } from "./Select";

export type AllAlterTableNodes = AllAlterTableStatements | OwnedByClause;

export type AllAlterTableStatements =
  | AlterTableStmt
  | AlterTableAllInTablespaceStmt;

// ALTER TABLE
export interface AlterTableStmt extends BaseNode {
  type: "alter_table_stmt";
  alterTableKw: [Keyword<"ALTER">, Keyword<"TABLE">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  table: RelationExpr;
  actions: ListExpr<AlterTableAction>;
}

// PostgreSQL
export interface AlterTableAllInTablespaceStmt extends BaseNode {
  type: "alter_table_all_in_tablespace_stmt";
  alterTableKw: [Keyword<"ALTER">, Keyword<"TABLE">];
  allInTablespaceKw: [Keyword<"ALL">, Keyword<"IN">, Keyword<"TABLESPACE">];
  tablespace: Identifier;
  ownedBy?: OwnedByClause;
  action: AlterActionSetTablespace;
}

// PostgreSQL
export interface OwnedByClause extends BaseNode {
  type: "owned_by_clause";
  ownedByKw: [Keyword<"OWNED">, Keyword<"BY">];
  owners: ListExpr<Identifier | FuncCall>;
}
