import { AllColumns, BaseNode, Empty, Keyword } from "./Base";
import {
  Expr,
  FuncCall,
  Identifier,
  ListExpr,
  MemberExpr,
  ParenExpr,
  EntityName,
} from "./Expr";
import { Alias } from "./Alias";
import { FrameClause } from "./WindowFrame";

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
  | JoinExpr
  | IndexedTable
  | NotIndexedTable
  | UnnestWithOffsetExpr
  | UnnestExpr
  | PivotExpr
  | PivotForIn
  | UnpivotExpr
  | UnpivotForIn
  | TablesampleExpr
  | TablesamplePercent
  | JoinOnSpecification
  | JoinUsingSpecification
  | SortSpecification
  | ReturningClause;

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
  optionKw?:
    | Keyword<"MATERIALIZED">
    | [Keyword<"NOT">, Keyword<"MATERIALIZED">];
  expr: Expr;
}

export interface SelectClause extends BaseNode {
  type: "select_clause";
  selectKw: Keyword<"SELECT">;
  distinctKw?: Keyword<"ALL" | "DISTINCT" | "DISTINCTROW">;
  options: Keyword<
    | "HIGH_PRIORITY"
    | "STRAIGHT_JOIN"
    | "SQL_CALC_FOUND_ROWS"
    | "SQL_CACHE"
    | "SQL_NO_CACHE"
    | "SQL_BIG_RESULT"
    | "SQL_SMALL_RESULT"
    | "SQL_BUFFER_RESULT"
  >[];
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
  expr: TableExpr;
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
  count: Expr;
  offsetKw?: Keyword<"OFFSET">;
  offset?: Expr;
}

type TableExpr =
  | JoinExpr
  | PivotExpr
  | UnpivotExpr
  | TablesampleExpr
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
