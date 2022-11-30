import { BaseNode, Keyword } from "./Base";
import { ColumnDefinition } from "./CreateTable";
import { Expr, Identifier, ListExpr, Table } from "./Expr";

// ALTER TABLE
export interface AlterTableStmt extends BaseNode {
  type: "alter_table_stmt";
  alterTableKw: [Keyword<"ALTER">, Keyword<"TABLE">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  table: Table;
  actions: ListExpr<AlterTableAction>;
}

export type AlterTableAction =
  | AlterRenameTable
  | AlterRenameColumn
  | AlterAddColumn
  | AlterDropColumn
  | AlterAlterColumn;

export interface AlterRenameTable extends BaseNode {
  type: "alter_rename_table";
  renameKw: Keyword<"RENAME"> | [Keyword<"RENAME">, Keyword<"TO" | "AS">];
  newName: Table;
}

export interface AlterRenameColumn extends BaseNode {
  type: "alter_rename_column";
  renameKw: Keyword<"RENAME"> | [Keyword<"RENAME">, Keyword<"COLUMN">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  oldName: Identifier;
  toKw: Keyword<"TO">;
  newName: Identifier;
}

export interface AlterAddColumn extends BaseNode {
  type: "alter_add_column";
  addKw: Keyword<"ADD"> | [Keyword<"ADD">, Keyword<"COLUMN">];
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  column: ColumnDefinition;
}

export interface AlterDropColumn extends BaseNode {
  type: "alter_drop_column";
  dropKw: Keyword<"DROP"> | [Keyword<"DROP">, Keyword<"COLUMN">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  column: Identifier;
}

export interface AlterAlterColumn extends BaseNode {
  type: "alter_alter_column";
  alterKw: Keyword<"ALTER"> | [Keyword<"ALTER">, Keyword<"COLUMN">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  column: Identifier;
  action: AlterColumnAction;
}

export type AlterColumnAction = AlterColumnSetDefault | AlterColumnDropDefault;

export interface AlterColumnSetDefault extends BaseNode {
  type: "alter_column_set_default";
  setDefaultKw: [Keyword<"SET">, Keyword<"DEFAULT">];
  expr: Expr;
}

export interface AlterColumnDropDefault extends BaseNode {
  type: "alter_column_drop_default";
  dropDefaultKw: [Keyword<"DROP">, Keyword<"DEFAULT">];
}
