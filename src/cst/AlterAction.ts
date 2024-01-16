import { BaseNode, Keyword } from "./Base";
import { BigqueryOptions } from "./dialects/Bigquery";
import { ColumnDefinition } from "./CreateTable";
import { DataType } from "./DataType";
import { Expr, Identifier, EntityName } from "./Expr";
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

export type AlterSchemaAction =
  | AlterActionSetDefaultCollate
  | AlterActionSetOptions;

export interface AlterActionRenameTable extends BaseNode {
  type: "alter_action_rename_table";
  renameKw: Keyword<"RENAME"> | [Keyword<"RENAME">, Keyword<"TO" | "AS">];
  newName: EntityName;
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
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
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
  | AlterActionSetDefault
  | AlterActionDropDefault
  | AlterActionSetNotNull
  | AlterActionDropNotNull
  | AlterActionSetDataType
  | AlterActionSetOptions
  | AlterActionSetVisible
  | AlterActionSetInvisible;

export interface AlterActionSetDefault extends BaseNode {
  type: "alter_action_set_default";
  setDefaultKw: [Keyword<"SET">, Keyword<"DEFAULT">];
  expr: Expr;
}

export interface AlterActionDropDefault extends BaseNode {
  type: "alter_action_drop_default";
  dropDefaultKw: [Keyword<"DROP">, Keyword<"DEFAULT">];
}

export interface AlterActionSetNotNull extends BaseNode {
  type: "alter_action_set_not_null";
  setNotNullKw: [Keyword<"SET">, Keyword<"NOT">, Keyword<"NULL">];
}

export interface AlterActionDropNotNull extends BaseNode {
  type: "alter_action_drop_not_null";
  dropNotNullKw: [Keyword<"DROP">, Keyword<"NOT">, Keyword<"NULL">];
}

export interface AlterActionSetDataType extends BaseNode {
  type: "alter_action_set_data_type";
  setDataTypeKw:
    | [Keyword<"SET">, Keyword<"DATA">, Keyword<"TYPE">]
    | Keyword<"TYPE">;
  dataType: DataType;
}

// MySQL, MariaDB
export interface AlterActionSetVisible extends BaseNode {
  type: "alter_action_set_visible";
  setVisibleKw: [Keyword<"SET">, Keyword<"VISIBLE">];
}

// MySQL, MariaDB
export interface AlterActionSetInvisible extends BaseNode {
  type: "alter_action_set_invisible";
  setInvisibleKw: [Keyword<"SET">, Keyword<"INVISIBLE">];
}
