import { BaseNode, Keyword } from "./Base";
import { BigqueryOptions } from "./Bigquery";
import { ColumnDefinition } from "./CreateTable";
import { DataType } from "./DataType";
import { Expr, Identifier, Table } from "./Expr";
import { StringLiteral } from "./Literal";

export type AllAlterActionNodes = AlterTableAction | AlterColumnAction;

export type AlterTableAction =
  | AlterActionRenameTable
  | AlterActionRenameColumn
  | AlterActionAddColumn
  | AlterActionDropColumn
  | AlterActionAlterColumn
  | AlterActionSetDefaultCollate
  | AlterActionSetOptions;

export interface AlterActionRenameTable extends BaseNode {
  type: "alter_action_rename_table";
  renameKw: Keyword<"RENAME"> | [Keyword<"RENAME">, Keyword<"TO" | "AS">];
  newName: Table;
}

export interface AlterActionRenameColumn extends BaseNode {
  type: "alter_action_rename_column";
  renameKw: Keyword<"RENAME"> | [Keyword<"RENAME">, Keyword<"COLUMN">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  oldName: Identifier;
  toKw: Keyword<"TO">;
  newName: Identifier;
}

export interface AlterActionAddColumn extends BaseNode {
  type: "alter_action_add_column";
  addKw: Keyword<"ADD"> | [Keyword<"ADD">, Keyword<"COLUMN">];
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  column: ColumnDefinition;
}

export interface AlterActionDropColumn extends BaseNode {
  type: "alter_action_drop_column";
  dropKw: Keyword<"DROP"> | [Keyword<"DROP">, Keyword<"COLUMN">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  column: Identifier;
}

export interface AlterActionAlterColumn extends BaseNode {
  type: "alter_action_alter_column";
  alterKw: Keyword<"ALTER"> | [Keyword<"ALTER">, Keyword<"COLUMN">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  column: Identifier;
  action: AlterColumnAction;
}

export interface AlterActionSetDefaultCollate extends BaseNode {
  type: "alter_action_set_default_collate";
  setDefaultCollateKw: [Keyword<"SET">, Keyword<"DEFAULT">, Keyword<"COLLATE">];
  collation: StringLiteral;
}

export interface AlterActionSetOptions extends BaseNode {
  type: "alter_action_set_options";
  setKw: Keyword<"SET">;
  options: BigqueryOptions;
}

export type AlterColumnAction =
  | AlterColumnSetDefault
  | AlterColumnDropDefault
  | AlterColumnDropNotNull
  | AlterColumnSetDataType
  | AlterColumnSetOptions;

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

export interface AlterColumnSetOptions extends BaseNode {
  type: "alter_column_set_options";
  setKw: Keyword<"SET">;
  options: BigqueryOptions;
}
