import { BaseNode, Keyword } from "./Base";
import { ColumnDefinition } from "./CreateTable";
import { ColumnRef, ListExpr, TableRef } from "./Expr";

// ALTER TABLE
export interface AlterTableStmt extends BaseNode {
  type: "alter_table_stmt";
  alterTableKw: [Keyword<"ALTER">, Keyword<"TABLE">];
  table: TableRef;
  actions: ListExpr<AlterAction>;
}

export type AlterAction =
  | AlterRenameTable
  | AlterRenameColumn
  | AlterAddColumn
  | AlterDropColumn;

export interface AlterRenameTable extends BaseNode {
  type: "alter_rename_table";
  renameKw: Keyword<"RENAME"> | [Keyword<"RENAME">, Keyword<"TO" | "AS">];
  newName: TableRef;
}

export interface AlterRenameColumn extends BaseNode {
  type: "alter_rename_column";
  renameKw: Keyword<"RENAME"> | [Keyword<"RENAME">, Keyword<"COLUMN">];
  oldName: ColumnRef;
  toKw: Keyword<"TO" | "AS">;
  newName: ColumnRef;
}

export interface AlterAddColumn extends BaseNode {
  type: "alter_add_column";
  addKw: Keyword<"ADD"> | [Keyword<"ADD">, Keyword<"COLUMN">];
  column: ColumnDefinition;
}

export interface AlterDropColumn extends BaseNode {
  type: "alter_drop_column";
  dropKw: Keyword<"DROP"> | [Keyword<"DROP">, Keyword<"COLUMN">];
  column: ColumnRef;
}