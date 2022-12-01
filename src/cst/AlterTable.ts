import { BaseNode, Keyword } from "./Base";
import { ColumnDefinition } from "./CreateTable";
import { DataType } from "./DataType";
import { Expr, Identifier, ListExpr, Table } from "./Expr";
import { StringLiteral } from "./Literal";

// ALTER TABLE
export interface AlterTableStmt extends BaseNode {
  type: "alter_table_stmt";
  alterTableKw: [Keyword<"ALTER">, Keyword<"TABLE">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  table: Table;
  actions: ListExpr<AlterTableAction>;
}

export type AlterTableAction =
  | AlterTableRenameTable
  | AlterTableRenameColumn
  | AlterTableAddColumn
  | AlterTableDropColumn
  | AlterTableAlterColumn
  | AlterTableSetDefaultCollate;

export interface AlterTableRenameTable extends BaseNode {
  type: "alter_table_rename_table";
  renameKw: Keyword<"RENAME"> | [Keyword<"RENAME">, Keyword<"TO" | "AS">];
  newName: Table;
}

export interface AlterTableRenameColumn extends BaseNode {
  type: "alter_table_rename_column";
  renameKw: Keyword<"RENAME"> | [Keyword<"RENAME">, Keyword<"COLUMN">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  oldName: Identifier;
  toKw: Keyword<"TO">;
  newName: Identifier;
}

export interface AlterTableAddColumn extends BaseNode {
  type: "alter_table_add_column";
  addKw: Keyword<"ADD"> | [Keyword<"ADD">, Keyword<"COLUMN">];
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  column: ColumnDefinition;
}

export interface AlterTableDropColumn extends BaseNode {
  type: "alter_table_drop_column";
  dropKw: Keyword<"DROP"> | [Keyword<"DROP">, Keyword<"COLUMN">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  column: Identifier;
}

export interface AlterTableAlterColumn extends BaseNode {
  type: "alter_table_alter_column";
  alterKw: Keyword<"ALTER"> | [Keyword<"ALTER">, Keyword<"COLUMN">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  column: Identifier;
  action: AlterColumnAction;
}

export type AlterColumnAction =
  | AlterColumnSetDefault
  | AlterColumnDropDefault
  | AlterColumnDropNotNull
  | AlterColumnSetDataType;

export interface AlterColumnSetDefault extends BaseNode {
  type: "alter_column_set_default";
  setDefaultKw: [Keyword<"SET">, Keyword<"DEFAULT">];
  expr: Expr;
}

export interface AlterColumnDropDefault extends BaseNode {
  type: "alter_column_drop_default";
  dropDefaultKw: [Keyword<"DROP">, Keyword<"DEFAULT">];
}

export interface AlterColumnDropNotNull extends BaseNode {
  type: "alter_column_drop_not_null";
  dropNotNullKw: [Keyword<"DROP">, Keyword<"NOT">, Keyword<"NULL">];
}

export interface AlterColumnSetDataType extends BaseNode {
  type: "alter_column_set_data_type";
  setDataTypeKw: [Keyword<"SET">, Keyword<"DATA">, Keyword<"TYPE">];
  dataType: DataType;
}

export interface AlterTableSetDefaultCollate extends BaseNode {
  type: "alter_table_set_default_collate";
  setDefaultCollateKw: [Keyword<"SET">, Keyword<"DEFAULT">, Keyword<"COLLATE">];
  collation: StringLiteral;
}
