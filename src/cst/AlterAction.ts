import { BaseNode, Keyword } from "./Base";
import { BigqueryOptions } from "./dialects/Bigquery";
import { ColumnDefinition } from "./CreateTable";
import { DataType } from "./DataType";
import {
  Expr,
  Identifier,
  EntityName,
  FuncCall,
  ParenExpr,
  ListExpr,
  MemberExpr,
} from "./Expr";
import { NumberLiteral, StringLiteral } from "./Literal";
import {
  ConstraintCollate,
  ConstraintModifier,
  TableConstraint,
} from "./Constraint";
import { Default } from "./Insert";
import { RoleOption } from "./Role";
import {
  PostgresqlTableOption,
  SequenceOption,
  SequenceOptionList,
} from "./Node";

export type AllAlterActionNodes =
  | AlterTableAction
  | AlterColumnAction
  | AlterSchemaAction
  | AlterViewAction
  | AlterIdentityAction
  | AlterIndexAction
  | AlterFunctionAction
  | AlterTypeAction
  | AlterDomainAction
  | AlterRoleAction
  | ToggleItem
  | ReplicaIdentityUsingIndex
  | SetDataTypeCollateClause
  | SetDataTypeUsingClause
  | AlterActionAddConstraintConstraintName
  | AlterActionAddEnumValuePosition;

export type AlterTableAction =
  | AlterActionRename
  | AlterActionRenameColumn
  | AlterActionAddColumn
  | AlterActionDropColumn
  | AlterActionAlterColumn
  | AlterActionSetDefaultCollate
  | AlterActionSetBigqueryOptions
  | AlterActionSetPostgresqlOptions
  | AlterActionResetPostgresqlOptions
  | AlterActionAddConstraint
  | AlterActionDropConstraint
  | AlterActionAlterConstraint
  | AlterActionRenameConstraint
  | AlterActionValidateConstraint
  | AlterActionDropPrimaryKey
  | AlterActionOwnerTo
  | AlterActionSetSchema
  | AlterActionEnable
  | AlterActionDisable
  | AlterActionForce
  | AlterActionNoForce
  | AlterActionSetTablespace
  | AlterActionSetAccessMethod
  | AlterActionClusterOn
  | AlterActionSetWithoutCluster
  | AlterActionSetWithoutOids
  | AlterActionSetLogged
  | AlterActionSetUnlogged
  | AlterActionInherit
  | AlterActionNoInherit
  | AlterActionOfType
  | AlterActionNotOfType
  | AlterActionReplicaIdentity;

export type AlterSchemaAction =
  | AlterActionSetDefaultCollate
  | AlterActionSetBigqueryOptions
  | AlterActionRename
  | AlterActionOwnerTo;

export type AlterViewAction =
  | AlterActionSetBigqueryOptions
  | AlterActionSetPostgresqlOptions
  | AlterActionResetPostgresqlOptions
  | AlterActionRename
  | AlterActionRenameColumn
  | AlterActionOwnerTo
  | AlterActionAlterColumn
  | AlterActionSetSchema
  | AlterActionSetTablespace
  | AlterActionSetAccessMethod
  | AlterActionClusterOn
  | AlterActionSetWithoutCluster
  | AlterActionDependsOnExtension
  | AlterActionNoDependsOnExtension;

export type AlterSequenceAction =
  | AlterActionSetLogged
  | AlterActionSetUnlogged
  | AlterActionOwnerTo
  | AlterActionRename
  | AlterActionSetSchema;

export type AlterIndexAction =
  | AlterActionRename
  | AlterActionSetTablespace
  | AlterActionDependsOnExtension
  | AlterActionNoDependsOnExtension
  | AlterActionSetPostgresqlOptions
  | AlterActionResetPostgresqlOptions
  | AlterActionAlterColumn
  | AlterActionAttachPartition;

export type AlterFunctionAction =
  | AlterActionRename
  | AlterActionOwnerTo
  | AlterActionSetSchema
  | AlterActionDependsOnExtension
  | AlterActionNoDependsOnExtension;

export type AlterTypeAction =
  | AlterActionRename
  | AlterActionOwnerTo
  | AlterActionSetSchema
  | AlterActionAddEnumValue
  | AlterActionRenameEnumValue
  | AlterActionRenameAttribute
  | AlterActionAddAttribute
  | AlterActionDropAttribute
  | AlterActionAlterAttribute;

export type AlterDomainAction =
  | AlterActionRename
  | AlterActionOwnerTo
  | AlterActionSetSchema
  | AlterActionSetDefault
  | AlterActionDropDefault
  | AlterActionSetNotNull
  | AlterActionDropNotNull
  | AlterActionRenameConstraint
  | AlterActionValidateConstraint
  | AlterActionDropConstraint
  | AlterActionAddConstraint;

export type AlterRoleAction =
  | AlterActionWithRoleOptions
  | AlterActionRename
  | AlterActionSetPostgresqlOption
  | AlterActionSetPostgresqlOptionFromCurrent
  | AlterActionResetPostgresqlOption
  | AlterActionAddUser
  | AlterActionDropUser;

export interface AlterActionRename extends BaseNode {
  type: "alter_action_rename";
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
  column: Identifier | NumberLiteral;
  action: AlterColumnAction;
}

export interface AlterActionSetDefaultCollate extends BaseNode {
  type: "alter_action_set_default_collate";
  setDefaultCollateKw: [Keyword<"SET">, Keyword<"DEFAULT">, Keyword<"COLLATE">];
  collation: StringLiteral;
}

// BigQuery
export interface AlterActionSetBigqueryOptions extends BaseNode {
  type: "alter_action_set_bigquery_options";
  setKw: Keyword<"SET">;
  options: BigqueryOptions;
}

// PostgreSQL
export interface AlterActionSetPostgresqlOptions extends BaseNode {
  type: "alter_action_set_postgresql_options";
  setKw: Keyword<"SET">;
  options: ParenExpr<ListExpr<PostgresqlTableOption>>;
}

// PostgreSQL
export interface AlterActionResetPostgresqlOptions extends BaseNode {
  type: "alter_action_reset_postgresql_options";
  resetKw: Keyword<"RESET">;
  options: ParenExpr<ListExpr<Identifier | MemberExpr>>;
}

// PostgreSQL
export interface AlterActionSetPostgresqlOption extends BaseNode {
  type: "alter_action_set_postgresql_option";
  setKw: Keyword<"SET">;
  name: Identifier;
  operator: Keyword<"TO"> | "=";
  value: Expr | Keyword;
}

export interface AlterActionSetPostgresqlOptionFromCurrent extends BaseNode {
  type: "alter_action_set_postgresql_option_from_current";
  setKw: Keyword<"SET">;
  name: Identifier;
  fromCurrentKw: [Keyword<"FROM">, Keyword<"CURRENT">];
}

// PostgreSQL
export interface AlterActionResetPostgresqlOption extends BaseNode {
  type: "alter_action_reset_postgresql_option";
  resetKw: Keyword<"RESET">;
  name: Identifier | Keyword<"ALL">;
}

// MySQL, MariaDB, PostgreSQL, BigQuery
export interface AlterActionAddConstraint extends BaseNode {
  type: "alter_action_add_constraint";
  addKw: Keyword<"ADD">;
  name?: AlterActionAddConstraintConstraintName;
  constraint: TableConstraint;
  modifiers: ConstraintModifier[];
}

// BigQuery
// Like ConstraintName, but allows for IF NOT EXISTS
export interface AlterActionAddConstraintConstraintName extends BaseNode {
  type: "alter_action_add_constraint_constraint_name";
  constraintKw: Keyword<"CONSTRAINT">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: Identifier;
}

// MySQL, MariaDB, PostgreSQL, BigQuery
export interface AlterActionDropConstraint extends BaseNode {
  type: "alter_action_drop_constraint";
  dropConstraintKw: [Keyword<"DROP">, Keyword<"CONSTRAINT" | "CHECK">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  constraint: Identifier;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}

// MySQL, PostgreSQL
export interface AlterActionAlterConstraint extends BaseNode {
  type: "alter_action_alter_constraint";
  alterConstraintKw: [Keyword<"ALTER">, Keyword<"CONSTRAINT" | "CHECK">];
  constraint: Identifier;
  modifiers: ConstraintModifier[];
}

// PostgreSQL
export interface AlterActionRenameConstraint extends BaseNode {
  type: "alter_action_rename_constraint";
  renameConstraintKw: [Keyword<"RENAME">, Keyword<"CONSTRAINT">];
  oldName: Identifier;
  toKw: Keyword<"TO">;
  newName: Identifier;
}

// PostgreSQL
export interface AlterActionValidateConstraint extends BaseNode {
  type: "alter_action_validate_constraint";
  validateConstraintKw: [Keyword<"VALIDATE">, Keyword<"CONSTRAINT">];
  constraint: Identifier;
}

// BigQuery
export interface AlterActionDropPrimaryKey extends BaseNode {
  type: "alter_action_drop_primary_key";
  dropPrimaryKeyKw: [Keyword<"DROP">, Keyword<"PRIMARY">, Keyword<"KEY">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
}

// PostgreSQL
export interface AlterActionOwnerTo extends BaseNode {
  type: "alter_action_owner_to";
  ownerToKw: [Keyword<"OWNER">, Keyword<"TO">];
  owner: Identifier | FuncCall;
}

// PostgreSQL
export interface AlterActionSetSchema extends BaseNode {
  type: "alter_action_set_schema";
  setSchemaKw: [Keyword<"SET">, Keyword<"SCHEMA">];
  schema: Identifier;
}

// PostgreSQL
export interface AlterActionEnable extends BaseNode {
  type: "alter_action_enable";
  enableKw: Keyword<"ENABLE">;
  modeKw?: Keyword<"REPLICA" | "ALWAYS">;
  item: ToggleItem;
}

// PostgreSQL
export interface AlterActionDisable extends BaseNode {
  type: "alter_action_disable";
  disableKw: Keyword<"DISABLE">;
  item: ToggleItem;
}

// PostgreSQL
export interface AlterActionForce extends BaseNode {
  type: "alter_action_force";
  forceKw: Keyword<"FORCE">;
  item: ToggleRowLevelSecurity;
}

// PostgreSQL
export interface AlterActionNoForce extends BaseNode {
  type: "alter_action_no_force";
  noForceKw: [Keyword<"NO">, Keyword<"FORCE">];
  item: ToggleRowLevelSecurity;
}

// PostgreSQL
export interface AlterActionSetTablespace extends BaseNode {
  type: "alter_action_set_tablespace";
  setTablespaceKw: [Keyword<"SET">, Keyword<"TABLESPACE">];
  tablespace: Identifier;
  nowaitKw?: Keyword<"NOWAIT">;
}

// PostgreSQL
export interface AlterActionClusterOn extends BaseNode {
  type: "alter_action_cluster_on";
  clusterOnKw: [Keyword<"CLUSTER">, Keyword<"ON">];
  index: Identifier;
}

// PostgreSQL
export interface AlterActionSetAccessMethod extends BaseNode {
  type: "alter_action_set_access_method";
  setAccessMethodKw: [Keyword<"SET">, Keyword<"ACCESS">, Keyword<"METHOD">];
  method: Identifier;
}

// PostgreSQL
export interface AlterActionSetWithoutCluster extends BaseNode {
  type: "alter_action_set_without_cluster";
  setWithoutClusterKw: [Keyword<"SET">, Keyword<"WITHOUT">, Keyword<"CLUSTER">];
}

// PostgreSQL
export interface AlterActionSetWithoutCluster extends BaseNode {
  type: "alter_action_set_without_cluster";
  setWithoutClusterKw: [Keyword<"SET">, Keyword<"WITHOUT">, Keyword<"CLUSTER">];
}

// PostgreSQL
export interface AlterActionSetWithoutOids extends BaseNode {
  type: "alter_action_set_without_oids";
  setWithoutOidsKw: [Keyword<"SET">, Keyword<"WITHOUT">, Keyword<"OIDS">];
}

// PostgreSQL
export interface AlterActionSetLogged extends BaseNode {
  type: "alter_action_set_logged";
  setLoggedKw: [Keyword<"SET">, Keyword<"LOGGED">];
}

// PostgreSQL
export interface AlterActionSetUnlogged extends BaseNode {
  type: "alter_action_set_unlogged";
  setUnloggedKw: [Keyword<"SET">, Keyword<"UNLOGGED">];
}

// PostgreSQL
export interface AlterActionInherit extends BaseNode {
  type: "alter_action_inherit";
  inheritKw: Keyword<"INHERIT">;
  table: EntityName;
}

// PostgreSQL
export interface AlterActionNoInherit extends BaseNode {
  type: "alter_action_no_inherit";
  noInheritKw: [Keyword<"NO">, Keyword<"INHERIT">];
  table: EntityName;
}

// PostgreSQL
export interface AlterActionOfType extends BaseNode {
  type: "alter_action_of_type";
  ofKw: Keyword<"OF">;
  typeName: EntityName;
}

// PostgreSQL
export interface AlterActionNotOfType extends BaseNode {
  type: "alter_action_not_of_type";
  notOfKw: [Keyword<"NOT">, Keyword<"OF">];
}

// PostgreSQL
export interface AlterActionDependsOnExtension extends BaseNode {
  type: "alter_action_depends_on_extension";
  dependsOnExtensionKw: [
    Keyword<"DEPENDS">,
    Keyword<"ON">,
    Keyword<"EXTENSION">
  ];
  extension: Identifier;
}

// PostgreSQL
export interface AlterActionNoDependsOnExtension extends BaseNode {
  type: "alter_action_no_depends_on_extension";
  noDependsOnExtensionKw: [
    Keyword<"NO">,
    Keyword<"DEPENDS">,
    Keyword<"ON">,
    Keyword<"EXTENSION">
  ];
  extension: Identifier;
}

// PostgreSQL
export interface AlterActionReplicaIdentity extends BaseNode {
  type: "alter_action_replica_identity";
  replicaIdentityKw: [Keyword<"REPLICA">, Keyword<"IDENTITY">];
  identity: Keyword<"DEFAULT" | "FULL" | "NOTHING"> | ReplicaIdentityUsingIndex;
}

// PostgreSQL
export interface ReplicaIdentityUsingIndex extends BaseNode {
  type: "replica_identity_using_index";
  usingIndexKw: [Keyword<"USING">, Keyword<"INDEX">];
  index: Identifier;
}

// PostgreSQL
export interface AlterActionAttachPartition extends BaseNode {
  type: "alter_action_attach_partition";
  attachPartitionKw: [Keyword<"ATTACH">, Keyword<"PARTITION">];
  index: EntityName;
}

// PostgreSQL
export interface AlterActionAddEnumValue extends BaseNode {
  type: "alter_action_add_enum_value";
  addValueKw: [Keyword<"ADD">, Keyword<"VALUE">];
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  value: StringLiteral;
  position?: AlterActionAddEnumValuePosition;
}

// PostgreSQL
export interface AlterActionAddEnumValuePosition extends BaseNode {
  type: "alter_action_add_enum_value_position";
  positionKw: Keyword<"BEFORE" | "AFTER">;
  value: StringLiteral;
}

// PostgreSQL
export interface AlterActionRenameEnumValue extends BaseNode {
  type: "alter_action_rename_enum_value";
  renameValueKw: [Keyword<"RENAME">, Keyword<"VALUE">];
  oldValue: StringLiteral;
  toKw: Keyword<"TO">;
  newValue: StringLiteral;
}

// PostgreSQL
export interface AlterActionRenameAttribute extends BaseNode {
  type: "alter_action_rename_attribute";
  renameAttributeKw: [Keyword<"RENAME">, Keyword<"ATTRIBUTE">];
  oldName: Identifier;
  toKw: Keyword<"TO">;
  newName: Identifier;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}

// PostgreSQL
export interface AlterActionAddAttribute extends BaseNode {
  type: "alter_action_add_attribute";
  addAttributeKw: [Keyword<"ADD">, Keyword<"ATTRIBUTE">];
  name: Identifier;
  dataType: DataType;
  constraint?: ConstraintCollate;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}

// PostgreSQL
export interface AlterActionDropAttribute extends BaseNode {
  type: "alter_action_drop_attribute";
  dropAttributeKw: [Keyword<"DROP">, Keyword<"ATTRIBUTE">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: Identifier;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}

// PostgreSQL
export interface AlterActionAlterAttribute extends BaseNode {
  type: "alter_action_alter_attribute";
  alterAttributeKw: [Keyword<"ALTER">, Keyword<"ATTRIBUTE">];
  name: Identifier;
  setDataTypeKw:
    | [Keyword<"SET">, Keyword<"DATA">, Keyword<"TYPE">]
    | Keyword<"TYPE">;
  dataType: DataType;
  constraint?: ConstraintCollate;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}

// PostgreSQL
export interface AlterActionWithRoleOptions extends BaseNode {
  type: "alter_action_with_role_options";
  withKw: Keyword<"WITH">;
  options: RoleOption[];
}

// PostgreSQL
export interface AlterActionAddUser extends BaseNode {
  type: "alter_action_add_user";
  addUserKw: [Keyword<"ADD">, Keyword<"USER">];
  users: ListExpr<Identifier>;
}

// PostgreSQL
export interface AlterActionDropUser extends BaseNode {
  type: "alter_action_drop_user";
  dropUserKw: [Keyword<"DROP">, Keyword<"USER">];
  users: ListExpr<Identifier>;
}

export type AlterColumnAction =
  | AlterActionSetDefault
  | AlterActionDropDefault
  | AlterActionSetNotNull
  | AlterActionDropNotNull
  | AlterActionSetDataType
  | AlterActionSetBigqueryOptions
  | AlterActionSetPostgresqlOptions
  | AlterActionResetPostgresqlOptions
  | AlterActionSetVisible
  | AlterActionSetInvisible
  | AlterActionSetCompression
  | AlterActionSetStorage
  | AlterActionSetStatistics
  | AlterActionDropExpression
  | AlterActionDropIdentity
  | AlterActionAddIdentity
  | AlterActionAlterIdentity;

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
  clauses: (SetDataTypeCollateClause | SetDataTypeUsingClause)[];
}

export interface SetDataTypeCollateClause extends BaseNode {
  type: "set_data_type_collate_clause";
  collateKw: Keyword<"COLLATE">;
  collation: StringLiteral;
}

export interface SetDataTypeUsingClause extends BaseNode {
  type: "set_data_type_using_clause";
  usingKw: Keyword<"USING">;
  expr: Expr;
}

// MySQL only
export interface AlterActionSetVisible extends BaseNode {
  type: "alter_action_set_visible";
  setVisibleKw: [Keyword<"SET">, Keyword<"VISIBLE">];
}

// MySQL only
export interface AlterActionSetInvisible extends BaseNode {
  type: "alter_action_set_invisible";
  setInvisibleKw: [Keyword<"SET">, Keyword<"INVISIBLE">];
}

// PostgreSQL
export interface AlterActionSetCompression extends BaseNode {
  type: "alter_action_set_compression";
  setCompressionKw: [Keyword<"SET">, Keyword<"COMPRESSION">];
  method: Identifier | Default;
}

// PostgreSQL
export interface AlterActionSetStorage extends BaseNode {
  type: "alter_action_set_storage";
  setStorageKw: [Keyword<"SET">, Keyword<"STORAGE">];
  typeKw: Keyword<"PLAIN" | "EXTERNAL" | "EXTENDED" | "MAIN" | "DEFAULT">;
}

// PostgreSQL
export interface AlterActionSetStatistics extends BaseNode {
  type: "alter_action_set_statistics";
  setStatisticsKw: [Keyword<"SET">, Keyword<"STATISTICS">];
  value: NumberLiteral;
}

// PostgreSQL
export interface AlterActionDropExpression extends BaseNode {
  type: "alter_action_drop_expression";
  dropExpressionKw: [Keyword<"DROP">, Keyword<"EXPRESSION">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
}

// PostgreSQL
export interface AlterActionDropIdentity extends BaseNode {
  type: "alter_action_drop_identity";
  dropIdentityKw: [Keyword<"DROP">, Keyword<"IDENTITY">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
}

// PostgreSQL
export interface AlterActionAddIdentity extends BaseNode {
  type: "alter_action_add_identity";
  addGeneratedKw: [Keyword<"ADD">, Keyword<"GENERATED">];
  whenKw?: Keyword<"ALWAYS"> | [Keyword<"BY">, Keyword<"DEFAULT">];
  asIdentityKw: [Keyword<"AS">, Keyword<"IDENTITY">];
  sequenceOptions?: ParenExpr<SequenceOptionList>;
}

// PostgreSQL
export interface AlterActionAlterIdentity extends BaseNode {
  type: "alter_action_alter_identity";
  actions: AlterIdentityAction[];
}

type AlterIdentityAction =
  | AlterActionSetGenerated
  | AlterActionSetSequenceOption
  | AlterActionRestart;

export interface AlterActionSetGenerated extends BaseNode {
  type: "alter_action_set_generated";
  setGeneratedKw: [Keyword<"SET">, Keyword<"GENERATED">];
  whenKw?: Keyword<"ALWAYS"> | [Keyword<"BY">, Keyword<"DEFAULT">];
}

export interface AlterActionSetSequenceOption extends BaseNode {
  type: "alter_action_set_sequence_option";
  setKw: Keyword<"SET">;
  option: SequenceOption;
}

export interface AlterActionRestart extends BaseNode {
  type: "alter_action_restart";
  restartKw: Keyword<"RESTART">;
  withKw?: Keyword<"WITH">;
  value?: Expr;
}

// Used with ENABLE/DISABLE
export type ToggleItem = ToggleRowLevelSecurity | ToggleTrigger | ToggleRule;

export interface ToggleRowLevelSecurity extends BaseNode {
  type: "toggle_row_level_security";
  rowLevelSecurityKw: [Keyword<"ROW">, Keyword<"LEVEL">, Keyword<"SECURITY">];
}

export interface ToggleTrigger extends BaseNode {
  type: "toggle_trigger";
  triggerKw: Keyword<"TRIGGER">;
  name: Identifier | Keyword<"ALL" | "USER">;
}

export interface ToggleRule extends BaseNode {
  type: "toggle_rule";
  ruleKw: Keyword<"RULE">;
  name: Identifier;
}
