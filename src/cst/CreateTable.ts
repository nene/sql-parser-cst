import { BaseNode, Keyword } from "./Base";
import {
  BigqueryOptionDefaultCollate,
  BigqueryOptions,
} from "./dialects/Bigquery";
import {
  ColumnConstraint,
  Constraint,
  IndexSpecification,
  TableConstraint,
} from "./Constraint";
import { DataType } from "./DataType";
import {
  Expr,
  Identifier,
  ListExpr,
  ParenExpr,
  EntityName,
  FuncCall,
  MemberExpr,
} from "./Expr";
import { AsClause, WithConnectionClause } from "./ProcClause";
import { ForSystemTimeAsOfExpr, PartitionByClause, SubSelect } from "./Select";
import { ClusterByClause } from "./OtherClauses";
import { NumberLiteral } from "./Literal";

export type AllCreateTableNodes =
  | CreateTableStmt
  | TableKind
  | ColumnDefinition
  | TableOption<Keyword | Keyword[] | Identifier | MemberExpr, Keyword | Expr>
  | CreateTableLikeClause
  | TableLikeOption
  | CreateTableCopyClause
  | CreateTableCloneClause
  | WithPartitionColumnsClause
  | CreateTableUsingClause
  | CreateTableInheritsClause
  | CreateTablePartitionByClause
  | CreateTablePartitionOfClause
  | CreateTablePartitionBoundClause
  | PartitionBoundFromTo
  | PartitionBoundMinvalue
  | PartitionBoundMaxvalue
  | PartitionBoundIn
  | PartitionBoundWith
  | PartitionBoundModulus
  | PartitionBoundRemainder
  | CreateTableDefaultPartitionClause
  | CreateTableOnCommitClause
  | CreateTableTablespaceClause
  | UsingAccessMethodClause
  | WithStorageParametersClause
  | CreateTableWithoutOidsClause
  | CreateTableWithDataClause
  | CreateTableOfTypeClause;

// CREATE TABLE
export interface CreateTableStmt extends BaseNode {
  type: "create_table_stmt";
  createKw: Keyword<"CREATE">;
  orReplaceKw?: [Keyword<"OR">, Keyword<"REPLACE">];
  kind?: TableKind;
  tableKw: Keyword<"TABLE">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: EntityName;
  partitionOf?: CreateTablePartitionOfClause;
  ofType?: CreateTableOfTypeClause;
  columns?: ParenExpr<
    ListExpr<
      | ColumnDefinition
      | TableConstraint
      | Constraint<TableConstraint>
      | CreateTableLikeClause // PostgreSQL, MariaDB, MySQL
    >
  >;
  options?: ListExpr<
    TableOption<
      TableOptionNameSqlite | TableOptionNameMysql,
      TableOptionValueMysql | Expr
    >
  >;
  clauses: CreateTableClause[];
}

export interface TableKind extends BaseNode {
  type: "table_kind";
  kindKw:
    | Keyword<"TEMP" | "TEMPORARY">
    // PostgreSQL deprecated syntax which has the same effect as just TEMPORARY
    | [Keyword<"GLOBAL" | "LOCAL">, Keyword<"TEMPORARY" | "TEMP">]
    | Keyword<"UNLOGGED"> // PostgreSQL
    | Keyword<"EXTERNAL"> // BigQuery
    | Keyword<"SNAPSHOT"> // BigQuery
    | Keyword<"VIRTUAL">; // SQLite
}

export interface ColumnDefinition extends BaseNode {
  type: "column_definition";
  name: Identifier;
  dataType?: DataType;
  withOptionsKw?: [Keyword<"WITH">, Keyword<"OPTIONS">];
  constraints: (ColumnConstraint | Constraint<ColumnConstraint>)[];
}

export interface TableOption<TKey, TValue> extends BaseNode {
  type: "table_option";
  name: TKey;
  hasEq?: boolean; // True when "=" sign is used
  value?: TValue;
}

type TableOptionNameSqlite =
  | Keyword<"STRICT">
  | [Keyword<"WITHOUT">, Keyword<"ROWID">];

type TableOptionNameMysql =
  | [Keyword<"START">, Keyword<"TRANSACTION">]
  | Keyword<"AUTOEXTEND_SIZE">
  | Keyword<"AUTO_INCREMENT">
  | Keyword<"AVG_ROW_LENGTH">
  | [Keyword<"DEFAULT">, Keyword<"CHARACTER">, Keyword<"SET">]
  | [Keyword<"CHARACTER">, Keyword<"SET">]
  | Keyword<"CHECKSUM">
  | [Keyword<"DEFAULT">, Keyword<"COLLATE">]
  | Keyword<"COLLATE">
  | Keyword<"COMMENT">
  | Keyword<"COMPRESSION">
  | Keyword<"CONNECTION">
  | [Keyword<"DATA">, Keyword<"DIRECTORY">]
  | [Keyword<"INDEX">, Keyword<"DIRECTORY">]
  | Keyword<"DELAY_KEY_WRITE">
  | Keyword<"ENCRYPTION">
  | Keyword<"ENGINE">
  | Keyword<"ENGINE_ATTRIBUTE">
  | Keyword<"INSERT_METHOD">
  | Keyword<"KEY_BLOCK_SIZE">
  | Keyword<"MAX_ROWS">
  | Keyword<"MIN_ROWS">
  | Keyword<"PACK_KEYS">
  | Keyword<"PASSWORD">
  | Keyword<"ROW_FORMAT">
  | Keyword<"SECONDARY_ENGINE_ATTRIBUTE">
  | Keyword<"STATS_AUTO_RECALC">
  | Keyword<"STATS_PERSISTENT">
  | Keyword<"STATS_SAMPLE_PAGES">
  | Keyword<"TABLESPACE">
  | Keyword<"STORAGE">
  | Keyword<"UNION">;

type TableOptionValueMysql = Keyword<
  | "DEFAULT"
  | "DYNAMIC"
  | "FIXED"
  | "COMPRESSED"
  | "REDUNDANT"
  | "COMPACT"
  | "NO"
  | "FIRST"
  | "LAST"
  | "DISK"
  | "MEMORY"
>;

type CreateTableClause =
  | AsClause<SubSelect>
  | CreateTableLikeClause
  | BigqueryCreateTableClause
  | SqliteCreateTableClause
  | PostgresqlCreateTableClause;

export interface CreateTableLikeClause extends BaseNode {
  type: "create_table_like_clause";
  likeKw: Keyword<"LIKE">;
  name: EntityName;
  options: TableLikeOption[];
}

export interface TableLikeOption extends BaseNode {
  type: "table_like_option";
  includingOrExcludingKw: Keyword<"INCLUDING" | "EXCLUDING">;
  optionKw: Keyword<
    | "COMMENTS"
    | "CONSTRAINTS"
    | "DEFAULTS"
    | "GENERATED"
    | "IDENTITY"
    | "INDEXES"
    | "STATISTICS"
    | "STORAGE"
  >;
}

type BigqueryCreateTableClause =
  | BigqueryOptions
  | BigqueryOptionDefaultCollate
  | PartitionByClause
  | ClusterByClause
  | CreateTableCopyClause
  | CreateTableCloneClause
  | WithConnectionClause
  | WithPartitionColumnsClause;

export interface CreateTableCopyClause extends BaseNode {
  type: "create_table_copy_clause";
  copyKw: Keyword<"COPY">;
  name: EntityName;
}

export interface CreateTableCloneClause extends BaseNode {
  type: "create_table_clone_clause";
  cloneKw: Keyword<"CLONE">;
  table: EntityName | ForSystemTimeAsOfExpr;
}

export interface WithPartitionColumnsClause extends BaseNode {
  type: "with_partition_columns_clause";
  withPartitionColumnsKw: [
    Keyword<"WITH">,
    Keyword<"PARTITION">,
    Keyword<"COLUMNS">
  ];
  columns?: ParenExpr<ListExpr<ColumnDefinition>>;
}

type SqliteCreateTableClause = CreateTableUsingClause;

export interface CreateTableUsingClause extends BaseNode {
  type: "create_table_using_clause";
  usingKw: Keyword<"USING">;
  module: FuncCall;
}

type PostgresqlCreateTableClause =
  | CreateTableInheritsClause
  | CreateTablePartitionByClause
  | CreateTablePartitionBoundClause
  | CreateTableDefaultPartitionClause
  | CreateTableOnCommitClause
  | CreateTableTablespaceClause
  | UsingAccessMethodClause
  | WithStorageParametersClause
  | CreateTableWithoutOidsClause
  | CreateTableWithDataClause;

export interface CreateTableInheritsClause extends BaseNode {
  type: "create_table_inherits_clause";
  inheritsKw: Keyword<"INHERITS">;
  tables: ParenExpr<ListExpr<EntityName>>;
}

export interface CreateTablePartitionByClause extends BaseNode {
  type: "create_table_partition_by_clause";
  partitionByKw: [Keyword<"PARTITION">, Keyword<"BY">];
  strategyKw: Keyword<"RANGE" | "LIST" | "HASH">;
  columns: ParenExpr<ListExpr<IndexSpecification>>;
}

export interface CreateTablePartitionBoundClause extends BaseNode {
  type: "create_table_partition_bound_clause";
  forValuesKw: [Keyword<"FOR">, Keyword<"VALUES">];
  bound: PartitionBoundFromTo | PartitionBoundIn | PartitionBoundWith;
}

export interface PartitionBoundFromTo extends BaseNode {
  type: "partition_bound_from_to";
  fromKw: Keyword<"FROM">;
  from: ParenExpr<
    ListExpr<Expr | PartitionBoundMinvalue | PartitionBoundMaxvalue>
  >;
  toKw: Keyword<"TO">;
  to: ParenExpr<
    ListExpr<Expr | PartitionBoundMinvalue | PartitionBoundMaxvalue>
  >;
}

export interface PartitionBoundMinvalue extends BaseNode {
  type: "partition_bound_minvalue";
  minvalueKw: Keyword<"MINVALUE">;
}

export interface PartitionBoundMaxvalue extends BaseNode {
  type: "partition_bound_maxvalue";
  maxvalueKw: Keyword<"MAXVALUE">;
}

export interface PartitionBoundIn extends BaseNode {
  type: "partition_bound_in";
  inKw: Keyword<"IN">;
  values: ParenExpr<ListExpr<Expr>>;
}

export interface PartitionBoundWith extends BaseNode {
  type: "partition_bound_with";
  withKw: Keyword<"WITH">;
  values: ParenExpr<ListExpr<PartitionBoundModulus | PartitionBoundRemainder>>;
}

export interface PartitionBoundModulus extends BaseNode {
  type: "partition_bound_modulus";
  modulusKw: Keyword<"MODULUS">;
  value: NumberLiteral;
}

export interface PartitionBoundRemainder extends BaseNode {
  type: "partition_bound_remainder";
  remainderKw: Keyword<"REMAINDER">;
  value: NumberLiteral;
}

export interface CreateTableDefaultPartitionClause extends BaseNode {
  type: "create_table_default_partition_clause";
  defaultKw: Keyword<"DEFAULT">;
}

export interface CreateTableOnCommitClause extends BaseNode {
  type: "create_table_on_commit_clause";
  onCommitKw: [Keyword<"ON">, Keyword<"COMMIT">];
  actionKw: [Keyword<"DELETE" | "PRESERVE">, Keyword<"ROWS">] | Keyword<"DROP">;
}

export interface CreateTableTablespaceClause extends BaseNode {
  type: "create_table_tablespace_clause";
  tablespaceKw: Keyword<"TABLESPACE">;
  name: Identifier;
}

export interface UsingAccessMethodClause extends BaseNode {
  type: "using_access_method_clause";
  usingKw: Keyword<"USING">;
  method: Identifier;
}

export interface WithStorageParametersClause extends BaseNode {
  type: "with_storage_parameters_clause";
  withKw: Keyword<"WITH">;
  options: ParenExpr<
    ListExpr<
      TableOption<
        Identifier | MemberExpr,
        Expr | Keyword<"ON" | "OFF" | "AUTO">
      >
    >
  >;
}

export interface CreateTableWithoutOidsClause extends BaseNode {
  type: "create_table_without_oids_clause";
  withoutOidsKw: [Keyword<"WITHOUT">, Keyword<"OIDS">];
}

export interface CreateTableWithDataClause extends BaseNode {
  type: "create_table_with_data_clause";
  withDataKw:
    | [Keyword<"WITH">, Keyword<"DATA">]
    | [Keyword<"WITH">, Keyword<"NO">, Keyword<"DATA">];
}

// PostgreSQL
//
// We're not including `PARTITION OF` and `OF type` clauses
// PostgresqlCreateTableClause because it comes right after table name,
// unlike other clauses that come after the column definitions.

export interface CreateTablePartitionOfClause extends BaseNode {
  type: "create_table_partition_of_clause";
  partitionOfKw: [Keyword<"PARTITION">, Keyword<"OF">];
  table: EntityName;
}

export interface CreateTableOfTypeClause extends BaseNode {
  type: "create_table_of_type_clause";
  ofKw: Keyword<"OF">;
  typeName: EntityName;
}
