import { AllColumns, BaseNode, Empty, Keyword } from "./Base";
import {
  Expr,
  FuncCall,
  Identifier,
  ListExpr,
  MemberExpr,
  ParenExpr,
  EntityName,
  Variable,
} from "./Expr";
import { Alias } from "./Alias";
import { FrameClause } from "./WindowFrame";
import { StringLiteral } from "./Literal";
import { MysqlHint } from "./Mysql";

export type AllSelectNodes =
  | CompoundSelectStmt
  | SelectStmt
  | WithClause
  | CommonTableExpr
  | SelectClause
  | ExceptColumns
  | ReplaceColumns
  | FromClause
  | WhereClause
  | GroupByClause
  | GroupByRollup
  | HavingClause
  | WindowClause
  | QualifyClause
  | NamedWindow
  | WindowDefinition
  | OrderByClause
  | PartitionByClause
  | ClusterByClause
  | LimitClause
  | LimitAll
  | LimitRowsExamined
  | OffsetClause
  | FetchClause
  | DualTable
  | JoinExpr
  | IndexedTable
  | NotIndexedTable
  | LateralDerivedTable
  | PartitionedTable
  | UnnestWithOffsetExpr
  | UnnestExpr
  | PivotExpr
  | PivotForIn
  | UnpivotExpr
  | UnpivotForIn
  | TablesampleExpr
  | TablesamplePercent
  | ForSystemTimeAsOfExpr
  | JoinOnSpecification
  | JoinUsingSpecification
  | SortSpecification
  | ReturningClause
  | IntoTableClause
  | IntoVariablesClause
  | IntoDumpfileClause
  | IntoOutfileClause
  | OutfileFields
  | OutfileLines
  | OutfileOptionTerminatedBy
  | OutfileOptionEscapedBy
  | OutfileOptionStartingBy
  | OutfileOptionEnclosedBy
  | OutfileOptionCharacterSet
  | ForClause
  | ForClauseTables
  | LockInShareModeClause
  | TableClause;

// SELECT
export interface CompoundSelectStmt extends BaseNode {
  type: "compound_select_stmt";
  left: SubSelect;
  operator:
    | Keyword<"UNION" | "EXCEPT" | "INTERSECT">
    | [Keyword<"UNION" | "EXCEPT" | "INTERSECT">, Keyword<"ALL" | "DISTINCT">];
  right: SubSelect;
}

export type SubSelect = SelectStmt | CompoundSelectStmt | ParenExpr<SubSelect>;

export interface SelectStmt extends BaseNode {
  type: "select_stmt";
  clauses: (
    | WithClause
    | SelectClause
    | FromClause
    | WhereClause
    | GroupByClause
    | HavingClause
    | WindowClause
    | QualifyClause
    | OrderByClause
    | LimitClause
    | OffsetClause
    | FetchClause
    | IntoTableClause
    | IntoVariablesClause
    | IntoDumpfileClause
    | IntoOutfileClause
    | ForClause
    | LockInShareModeClause
    | TableClause
    | ParenExpr<SelectStmt>
  )[];
}

export interface WithClause extends BaseNode {
  type: "with_clause";
  withKw: Keyword<"WITH">;
  recursiveKw?: Keyword<"RECURSIVE">;
  tables: ListExpr<CommonTableExpr>;
}

export interface CommonTableExpr extends BaseNode {
  type: "common_table_expr";
  table: Identifier;
  columns?: ParenExpr<ListExpr<Identifier>>;
  asKw: Keyword<"AS">;
  materializedKw?:
    | Keyword<"MATERIALIZED">
    | [Keyword<"NOT">, Keyword<"MATERIALIZED">];
  expr: Expr;
}

export interface SelectClause extends BaseNode {
  type: "select_clause";
  selectKw: Keyword<"SELECT">;
  distinctKw?: Keyword<"ALL" | "DISTINCT" | "DISTINCTROW">;
  hints: MysqlHint[];
  asStructOrValueKw?: [Keyword<"AS">, Keyword<"STRUCT" | "VALUE">];
  // PostgreSQL supports empty SELECT clause
  columns?: ListExpr<
    AllColumns | ExceptColumns | ReplaceColumns | Expr | Alias<Expr> | Empty
  >;
}

// BigQuery
export interface ExceptColumns extends BaseNode {
  type: "except_columns";
  expr: MemberExpr | AllColumns;
  exceptKw: Keyword<"EXCEPT">;
  columns: ParenExpr<ListExpr<Identifier>>;
}

// BigQuery
export interface ReplaceColumns extends BaseNode {
  type: "replace_columns";
  expr: MemberExpr | AllColumns;
  replaceKw: Keyword<"REPLACE">;
  columns: ParenExpr<ListExpr<Alias<Expr>>>;
}

export interface FromClause extends BaseNode {
  type: "from_clause";
  fromKw: Keyword<"FROM" | "USING">; // The USING keyword is used in MySQL/MariaDB DELETE statement
  expr: TableExpr | DualTable;
}

export interface WhereClause extends BaseNode {
  type: "where_clause";
  whereKw: Keyword<"WHERE">;
  expr: Expr;
}

export interface GroupByClause extends BaseNode {
  type: "group_by_clause";
  groupByKw: [Keyword<"GROUP">, Keyword<"BY">];
  distinctKw?: Keyword<"ALL" | "DISTINCT">; // PostgreSQL
  columns: ListExpr<Expr> | GroupByRollup;
  withRollupKw?: [Keyword<"WITH">, Keyword<"ROLLUP">]; // MySQL, MariaDB
}

// BigQuery, PostgreSQL
export interface GroupByRollup extends BaseNode {
  type: "group_by_rollup";
  rollupKw: Keyword<"ROLLUP">;
  columns: ParenExpr<ListExpr<Expr>>;
}

export interface HavingClause extends BaseNode {
  type: "having_clause";
  havingKw: Keyword<"HAVING">;
  expr: Expr;
}

export interface WindowClause extends BaseNode {
  type: "window_clause";
  windowKw: Keyword<"WINDOW">;
  namedWindows: ListExpr<NamedWindow>;
}

export interface NamedWindow extends BaseNode {
  type: "named_window";
  name: Identifier;
  asKw: Keyword<"AS">;
  window: ParenExpr<WindowDefinition>;
}

export interface WindowDefinition extends BaseNode {
  type: "window_definition";
  baseWindowName?: Identifier;
  partitionBy?: PartitionByClause;
  orderBy?: OrderByClause;
  frame?: FrameClause;
}

export interface OrderByClause extends BaseNode {
  type: "order_by_clause";
  orderByKw: [Keyword<"ORDER">, Keyword<"BY">];
  specifications: ListExpr<SortSpecification | Identifier>;
  withRollupKw?: [Keyword<"WITH">, Keyword<"ROLLUP">]; // MySQL
}

export interface PartitionByClause extends BaseNode {
  type: "partition_by_clause";
  partitionByKw: [Keyword<"PARTITION">, Keyword<"BY">];
  specifications: ListExpr<Expr>;
}

// BigQuery
export interface ClusterByClause extends BaseNode {
  type: "cluster_by_clause";
  clusterByKw: [Keyword<"CLUSTER">, Keyword<"BY">];
  columns: ListExpr<Identifier>;
}

export interface LimitClause extends BaseNode {
  type: "limit_clause";
  limitKw: Keyword<"LIMIT">;
  count?: Expr | LimitAll;
  offsetKw?: Keyword<"OFFSET">;
  offset?: Expr;
  rowsExamined?: LimitRowsExamined;
}

// PostgreSQL
export interface LimitAll extends BaseNode {
  type: "limit_all";
  allKw: Keyword<"ALL">;
}

// MariaDB
export interface LimitRowsExamined extends BaseNode {
  type: "limit_rows_examined";
  rowsExaminedKw: [Keyword<"ROWS">, Keyword<"EXAMINED">];
  count: Expr;
}

// MariaDB, PostgreSQL
export interface OffsetClause extends BaseNode {
  type: "offset_clause";
  offsetKw: Keyword<"OFFSET">;
  offset: Expr;
  rowsKw?: Keyword<"ROWS" | "ROW">;
}

// MariaDB, PostgreSQL
export interface FetchClause extends BaseNode {
  type: "fetch_clause";
  fetchKw: [Keyword<"FETCH">, Keyword<"FIRST" | "NEXT">];
  count?: Expr;
  rowsKw: Keyword<"ROWS" | "ROW">;
  withTiesKw: Keyword<"ONLY"> | [Keyword<"WITH">, Keyword<"TIES">];
}

// MySQL, MariaDB
export interface DualTable extends BaseNode {
  type: "dual_table";
  dualKw: Keyword<"DUAL">;
}

type TableExpr =
  | JoinExpr
  | PivotExpr
  | UnpivotExpr
  | TablesampleExpr
  | ForSystemTimeAsOfExpr
  | TableOrSubquery;

export interface JoinExpr extends BaseNode {
  type: "join_expr";
  left: TableExpr;
  operator: JoinOp | ",";
  right: TableOrSubquery;
  specification?: JoinOnSpecification | JoinUsingSpecification;
}

type JoinOp =
  | Keyword<
      | "NATURAL"
      | "LEFT"
      | "RIGHT"
      | "FULL"
      | "OUTER"
      | "INNER"
      | "CROSS"
      | "JOIN"
    >[]
  | Keyword<"JOIN" | "STRAIGHT_JOIN">;

export type TableOrSubquery =
  | EntityName
  | FuncCall
  | IndexedTable
  | NotIndexedTable
  | ParenExpr<SubSelect | TableExpr>
  | UnnestWithOffsetExpr
  | UnnestExpr
  | LateralDerivedTable
  | PartitionedTable
  | Alias<TableOrSubquery>;

// SQLite only
export interface IndexedTable extends BaseNode {
  type: "indexed_table";
  table: EntityName | Alias<EntityName>;
  indexedByKw: [Keyword<"INDEXED">, Keyword<"BY">];
  index: Identifier;
}
export interface NotIndexedTable extends BaseNode {
  type: "not_indexed_table";
  table: EntityName | Alias<EntityName>;
  notIndexedKw: [Keyword<"NOT">, Keyword<"INDEXED">];
}

// MySQL only (SQL 99)
export interface LateralDerivedTable extends BaseNode {
  type: "lateral_derived_table";
  lateralKw: Keyword<"LATERAL">;
  expr: ParenExpr<SubSelect>;
}

// MySQL, MariaDB
export interface PartitionedTable extends BaseNode {
  type: "partitioned_table";
  table: EntityName | Alias<EntityName>;
  partitionKw: Keyword<"PARTITION">;
  partitions: ParenExpr<ListExpr<Identifier>>;
}

// BigQuery
export interface UnnestWithOffsetExpr extends BaseNode {
  type: "unnest_with_offset_expr";
  unnest:
    | UnnestExpr
    | MemberExpr
    | Identifier
    | Alias<UnnestExpr | MemberExpr | Identifier>;
  withOffsetKw: [Keyword<"WITH">, Keyword<"OFFSET">];
}
// BigQuery
export interface UnnestExpr extends BaseNode {
  type: "unnest_expr";
  unnestKw: Keyword<"UNNEST">;
  expr: ParenExpr<Expr>;
}
// BigQuery
export interface PivotExpr extends BaseNode {
  type: "pivot_expr";
  left: TableExpr;
  pivotKw: Keyword<"PIVOT">;
  args: ParenExpr<PivotForIn>;
}
// BigQuery
export interface PivotForIn extends BaseNode {
  type: "pivot_for_in";
  aggregations: ListExpr<FuncCall | Alias<FuncCall>>;
  forKw: Keyword<"FOR">;
  inputColumn: Identifier;
  inKw: Keyword<"IN">;
  pivotColumns: ParenExpr<ListExpr<Expr | Alias<Expr>>>;
}
// BigQuery
export interface UnpivotExpr extends BaseNode {
  type: "unpivot_expr";
  left: TableExpr;
  unpivotKw: Keyword<"UNPIVOT">;
  nullHandlingKw?: [Keyword<"INCLUDE" | "EXCLUDE">, Keyword<"NULLS">];
  args: ParenExpr<UnpivotForIn>;
}
// BigQuery
export interface UnpivotForIn extends BaseNode {
  type: "unpivot_for_in";
  valuesColumn:
    | Identifier // for single-column unpivot
    | ParenExpr<ListExpr<Identifier>>; // for multi-column unpivot
  forKw: Keyword<"FOR">;
  nameColumn: Identifier;
  inKw: Keyword<"IN">;
  unpivotColumns:
    | ParenExpr<ListExpr<Identifier | Alias<Expr>>> // for single-column unpivot
    // for multi-column unpivot
    | ParenExpr<
        ListExpr<
          | ParenExpr<ListExpr<Identifier>>
          | Alias<ParenExpr<ListExpr<Identifier>>>
        >
      >;
}
// BigQuery
export interface TablesampleExpr extends BaseNode {
  type: "tablesample_expr";
  left: TableExpr;
  tablesampleKw: [Keyword<"TABLESAMPLE">, Keyword<"SYSTEM">];
  args: ParenExpr<TablesamplePercent>;
}
// BigQuery
export interface TablesamplePercent extends BaseNode {
  type: "tablesample_percent";
  percent: Expr;
  percentKw: Keyword<"PERCENT">;
}
// BigQuery
export interface ForSystemTimeAsOfExpr extends BaseNode {
  type: "for_system_time_as_of_expr";
  left: TableExpr;
  forSystemTimeAsOfKw: [
    Keyword<"FOR">,
    Keyword<"SYSTEM_TIME">,
    Keyword<"AS">,
    Keyword<"OF">
  ];
  expr: Expr;
}

export interface JoinOnSpecification extends BaseNode {
  type: "join_on_specification";
  onKw: Keyword<"ON">;
  expr: Expr;
}

export interface JoinUsingSpecification extends BaseNode {
  type: "join_using_specification";
  usingKw: Keyword<"USING">;
  expr: ParenExpr<ListExpr<Identifier>>;
}

export interface SortSpecification extends BaseNode {
  type: "sort_specification";
  expr: Expr;
  orderKw?: Keyword<"ASC" | "DESC">;
  nullHandlingKw?: [Keyword<"NULLS">, Keyword<"FIRST" | "LAST">]; // SQLite, PostgreSQL
}

// BigQuery
export interface QualifyClause extends BaseNode {
  type: "qualify_clause";
  qualifyKw: Keyword<"QUALIFY">;
  expr: Expr;
}

export interface ReturningClause extends BaseNode {
  type: "returning_clause";
  returningKw: Keyword<"RETURNING">;
  columns: ListExpr<Expr | Alias<Expr>>;
}

// PostgreSQL
export interface IntoTableClause extends BaseNode {
  type: "into_table_clause";
  intoKw: Keyword<"INTO">;
  temporaryKw?: Keyword<"TEMP" | "TEMPORARY">;
  unloggedKw?: Keyword<"UNLOGGED">;
  tableKw?: Keyword<"TABLE">;
  name: EntityName;
}

// MySQL, MariaDB
export interface IntoVariablesClause extends BaseNode {
  type: "into_variables_clause";
  intoKw: Keyword<"INTO">;
  variables: ListExpr<Variable>;
}

// MySQL, MariaDB
export interface IntoDumpfileClause extends BaseNode {
  type: "into_dumpfile_clause";
  intoDumpfileKw: [Keyword<"INTO">, Keyword<"DUMPFILE">];
  filename: StringLiteral;
}

// MySQL, MariaDB
export interface IntoOutfileClause extends BaseNode {
  type: "into_outfile_clause";
  intoOutfileKw: [Keyword<"INTO">, Keyword<"OUTFILE">];
  filename: StringLiteral;
  charset?: OutfileOptionCharacterSet;
  fields?: OutfileFields;
  lines?: OutfileLines;
}

// MySQL, MariaDB
export interface OutfileFields extends BaseNode {
  type: "outfile_fields";
  fieldsKw: Keyword<"FIELDS" | "COLUMNS">;
  options: (
    | OutfileOptionTerminatedBy
    | OutfileOptionEnclosedBy
    | OutfileOptionEscapedBy
  )[];
}

// MySQL, MariaDB
export interface OutfileLines extends BaseNode {
  type: "outfile_lines";
  linesKw: Keyword<"LINES">;
  options: (OutfileOptionStartingBy | OutfileOptionTerminatedBy)[];
}

// MySQL, MariaDB
export interface OutfileOptionTerminatedBy extends BaseNode {
  type: "outfile_option_terminated_by";
  terminatedByKw: [Keyword<"TERMINATED">, Keyword<"BY">];
  value: StringLiteral;
}

// MySQL, MariaDB
export interface OutfileOptionEscapedBy extends BaseNode {
  type: "outfile_option_escaped_by";
  escapedByKw: [Keyword<"ESCAPED">, Keyword<"BY">];
  value: StringLiteral;
}

// MySQL, MariaDB
export interface OutfileOptionStartingBy extends BaseNode {
  type: "outfile_option_starting_by";
  startingByKw: [Keyword<"STARTING">, Keyword<"BY">];
  value: StringLiteral;
}

// MySQL, MariaDB
export interface OutfileOptionEnclosedBy extends BaseNode {
  type: "outfile_option_enclosed_by";
  optionallyKw?: Keyword<"OPTIONALLY">;
  enclosedByKw: [Keyword<"ENCLOSED">, Keyword<"BY">];
  value: StringLiteral;
}

// MySQL, MariaDB
export interface OutfileOptionCharacterSet extends BaseNode {
  type: "outfile_option_character_set";
  characterSetKw: [Keyword<"CHARACTER">, Keyword<"SET">];
  value: Identifier;
}

// MySQL, MariaDB, PostgreSQL
// Referred to as the Locking Clause in PostgreSQL documentation
export interface ForClause extends BaseNode {
  type: "for_clause";
  forKw: Keyword<"FOR">;
  lockStrengthKw:
    | Keyword<"UPDATE">
    | [Keyword<"NO">, Keyword<"KEY">, Keyword<"UPDATE">]
    | Keyword<"SHARE">
    | [Keyword<"KEY">, Keyword<"SHARE">];
  tables?: ForClauseTables;
  waitingKw?: Keyword<"NOWAIT"> | [Keyword<"SKIP">, Keyword<"LOCKED">];
}

// MySQL, PostgreSQL
export interface ForClauseTables extends BaseNode {
  type: "for_clause_tables";
  ofKw: Keyword<"OF">;
  tables: ListExpr<Identifier>;
}

// MySQL, MariaDB
export interface LockInShareModeClause extends BaseNode {
  type: "lock_in_share_mode_clause";
  lockInShareModeKw: [
    Keyword<"LOCK">,
    Keyword<"IN">,
    Keyword<"SHARE">,
    Keyword<"MODE">
  ];
}

// MySQL, MariaDB, PostgreSQL
export interface TableClause extends BaseNode {
  type: "table_clause";
  tableKw: Keyword<"TABLE">;
  table: EntityName;
}
