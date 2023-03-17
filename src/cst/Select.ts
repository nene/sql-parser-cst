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
import { Hint } from "./Mysql";

export type AllSelectNodes =
  | CompoundSelectStmt
  | SelectStmt
  | WithClause
  | CommonTableExpression
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
  | IntoVariablesClause
  | IntoDumpfileClause
  | IntoOutfileClause
  | OutfileFields
  | OutfileLines
  | OutfileOptionTerminatedBy
  | OutfileOptionEscapedBy
  | OutfileOptionStartingBy
  | OutfileOptionEnclosedBy
  | OutfileOptionCharacterSet;

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
    | IntoVariablesClause
    | IntoDumpfileClause
    | IntoOutfileClause
    | ParenExpr<SelectStmt>
  )[];
}

export interface WithClause extends BaseNode {
  type: "with_clause";
  withKw: Keyword<"WITH">;
  recursiveKw?: Keyword<"RECURSIVE">;
  tables: ListExpr<CommonTableExpression>;
}

export interface CommonTableExpression extends BaseNode {
  type: "common_table_expression";
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
  hints: Hint[];
  asStructOrValueKw?: [Keyword<"AS">, Keyword<"STRUCT" | "VALUE">];
  columns: ListExpr<
    AllColumns | ExceptColumns | ReplaceColumns | Expr | Alias<Expr> | Empty
  >;
}

export interface ExceptColumns extends BaseNode {
  type: "except_columns";
  expr: MemberExpr | AllColumns;
  exceptKw: Keyword<"EXCEPT">;
  columns: ParenExpr<ListExpr<Identifier>>;
}

export interface ReplaceColumns extends BaseNode {
  type: "replace_columns";
  expr: MemberExpr | AllColumns;
  replaceKw: Keyword<"REPLACE">;
  columns: ParenExpr<ListExpr<Alias<Expr>>>;
}

export interface FromClause extends BaseNode {
  type: "from_clause";
  fromKw: Keyword<"FROM">;
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
  columns: ListExpr<Expr> | GroupByRollup;
  withRollupKw?: [Keyword<"WITH">, Keyword<"ROLLUP">];
}

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
  withRollupKw?: [Keyword<"WITH">, Keyword<"ROLLUP">];
}

export interface PartitionByClause extends BaseNode {
  type: "partition_by_clause";
  partitionByKw: [Keyword<"PARTITION">, Keyword<"BY">];
  specifications: ListExpr<Expr>;
}

export interface ClusterByClause extends BaseNode {
  type: "cluster_by_clause";
  clusterByKw: [Keyword<"CLUSTER">, Keyword<"BY">];
  columns: ListExpr<Identifier>;
}

export interface LimitClause extends BaseNode {
  type: "limit_clause";
  limitKw: Keyword<"LIMIT">;
  count?: Expr;
  offsetKw?: Keyword<"OFFSET">;
  offset?: Expr;
  rowsExamined?: LimitRowsExamined;
}

export interface LimitRowsExamined extends BaseNode {
  type: "limit_rows_examined";
  rowsExaminedKw: [Keyword<"ROWS">, Keyword<"EXAMINED">];
  count: Expr;
}

export interface OffsetClause extends BaseNode {
  type: "offset_clause";
  offsetKw: Keyword<"OFFSET">;
  offset: Expr;
  rowsKw?: Keyword<"ROWS" | "ROW">;
}

export interface FetchClause extends BaseNode {
  type: "fetch_clause";
  fetchKw: [Keyword<"FETCH">, Keyword<"FIRST" | "NEXT">];
  count?: Expr;
  rowsKw?: Keyword<"ROWS" | "ROW">;
  withTiesKw: Keyword<"ONLY"> | [Keyword<"WITH">, Keyword<"TIES">];
}

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

export interface PartitionedTable extends BaseNode {
  type: "partitioned_table";
  table: EntityName;
  partitionKw: Keyword<"PARTITION">;
  partitions: ParenExpr<ListExpr<Identifier>>;
}

// BigQuery only
export interface UnnestWithOffsetExpr extends BaseNode {
  type: "unnest_with_offset_expr";
  unnest:
    | UnnestExpr
    | MemberExpr
    | Identifier
    | Alias<UnnestExpr | MemberExpr | Identifier>;
  withOffsetKw: [Keyword<"WITH">, Keyword<"OFFSET">];
}
export interface UnnestExpr extends BaseNode {
  type: "unnest_expr";
  unnestKw: Keyword<"UNNEST">;
  expr: ParenExpr<Expr>;
}
export interface PivotExpr extends BaseNode {
  type: "pivot_expr";
  left: TableExpr;
  pivotKw: Keyword<"PIVOT">;
  args: ParenExpr<PivotForIn>;
}
export interface PivotForIn extends BaseNode {
  type: "pivot_for_in";
  aggregations: ListExpr<FuncCall | Alias<FuncCall>>;
  forKw: Keyword<"FOR">;
  inputColumn: Identifier;
  inKw: Keyword<"IN">;
  pivotColumns: ParenExpr<ListExpr<Expr | Alias<Expr>>>;
}
export interface UnpivotExpr extends BaseNode {
  type: "unpivot_expr";
  left: TableExpr;
  unpivotKw: Keyword<"UNPIVOT">;
  nullHandlingKw?: [Keyword<"INCLUDE" | "EXCLUDE">, Keyword<"NULLS">];
  args: ParenExpr<UnpivotForIn>;
}
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
export interface TablesampleExpr extends BaseNode {
  type: "tablesample_expr";
  left: TableExpr;
  tablesampleKw: [Keyword<"TABLESAMPLE">, Keyword<"SYSTEM">];
  args: ParenExpr<TablesamplePercent>;
}
export interface TablesamplePercent extends BaseNode {
  type: "tablesample_percent";
  percent: Expr;
  percentKw: Keyword<"PERCENT">;
}

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
  nullHandlingKw?: [Keyword<"NULLS">, Keyword<"FIRST" | "LAST">];
}

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

export interface IntoVariablesClause extends BaseNode {
  type: "into_variables_clause";
  intoKw: Keyword<"INTO">;
  variables: ListExpr<Variable>;
}

export interface IntoDumpfileClause extends BaseNode {
  type: "into_dumpfile_clause";
  intoDumpfileKw: [Keyword<"INTO">, Keyword<"DUMPFILE">];
  filename: StringLiteral;
}

export interface IntoOutfileClause extends BaseNode {
  type: "into_outfile_clause";
  intoOutfileKw: [Keyword<"INTO">, Keyword<"OUTFILE">];
  filename: StringLiteral;
  charset?: OutfileOptionCharacterSet;
  fields?: OutfileFields;
  lines?: OutfileLines;
}

export interface OutfileFields extends BaseNode {
  type: "outfile_fields";
  fieldsKw: Keyword<"FIELDS" | "COLUMNS">;
  options: (
    | OutfileOptionTerminatedBy
    | OutfileOptionEnclosedBy
    | OutfileOptionEscapedBy
  )[];
}

export interface OutfileLines extends BaseNode {
  type: "outfile_lines";
  linesKw: Keyword<"LINES">;
  options: (OutfileOptionStartingBy | OutfileOptionTerminatedBy)[];
}

export interface OutfileOptionTerminatedBy extends BaseNode {
  type: "outfile_option_terminated_by";
  terminatedByKw: [Keyword<"TERMINATED">, Keyword<"BY">];
  value: StringLiteral;
}

export interface OutfileOptionEscapedBy extends BaseNode {
  type: "outfile_option_escaped_by";
  escapedByKw: [Keyword<"ESCAPED">, Keyword<"BY">];
  value: StringLiteral;
}

export interface OutfileOptionStartingBy extends BaseNode {
  type: "outfile_option_starting_by";
  startingByKw: [Keyword<"STARTING">, Keyword<"BY">];
  value: StringLiteral;
}

export interface OutfileOptionEnclosedBy extends BaseNode {
  type: "outfile_option_enclosed_by";
  optionallyKw?: Keyword<"OPTIONALLY">;
  enclosedByKw: [Keyword<"ENCLOSED">, Keyword<"BY">];
  value: StringLiteral;
}

export interface OutfileOptionCharacterSet extends BaseNode {
  type: "outfile_option_character_set";
  characterSetKw: [Keyword<"CHARACTER">, Keyword<"SET">];
  value: Identifier;
}
