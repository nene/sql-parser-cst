export * from "./Base";
export * from "./Literal";
export * from "./Expr";
export * from "./Sqlite";
export * from "./Transaction";
export * from "./WindowFrame";
export * from "./Trigger";
export * from "./Constraint";
export * from "./Insert";
export * from "./CreateTable";
import { AllColumns, BaseNode, Keyword } from "./Base";
import { AllConstraintNodes } from "./Constraint";
import {
  AllCreateTableNodes,
  ColumnDefinition,
  CreateTableStmt,
} from "./CreateTable";
import {
  AllExprNodes,
  Expr,
  ListExpr,
  ParenExpr,
  TableFuncCall,
  ColumnRef,
  Identifier,
  TableRef,
} from "./Expr";
import {
  AllInsertNodes,
  Default,
  InsertClause,
  InsertStmt,
  OrAlternateAction,
  UpsertClause,
  UpsertOption,
  ValuesClause,
} from "./Insert";
import { AllSqliteNodes, SqliteStmt } from "./Sqlite";
import { AllTransactionNodes, TransactionStmt } from "./Transaction";
import { AllTriggerNodes, CreateTriggerStmt, DropTriggerStmt } from "./Trigger";
import { FrameClause, AllFrameNodes } from "./WindowFrame";

export type Node =
  | Program
  | Statement
  | Clause
  | AllExprNodes
  | Keyword
  | JoinExpr
  | JoinOnSpecification
  | JoinUsingSpecification
  | SortSpecification
  | AllCreateTableNodes
  | AllConstraintNodes
  | AlterAction
  | AllTriggerNodes
  | AllColumns
  | AllTransactionNodes
  | CommonTableExpression
  | NamedWindow
  | WindowDefinition
  | AllFrameNodes
  | AllInsertNodes
  | ColumnAssignment
  | Alias
  | IndexedTableRef
  | NotIndexedTableRef
  | AllSqliteNodes;

export interface Program extends BaseNode {
  type: "program";
  statements: Statement[];
}

export type Statement =
  | EmptyStmt
  | CompoundSelectStmt
  | SelectStmt
  | CreateTableStmt
  | AlterTableStmt
  | DropTableStmt
  | InsertStmt
  | DeleteStmt
  | UpdateStmt
  | CreateViewStmt
  | DropViewStmt
  | CreateIndexStmt
  | DropIndexStmt
  | CreateTriggerStmt
  | DropTriggerStmt
  | AnalyzeStmt
  | ExplainStmt
  | TransactionStmt
  | SqliteStmt;

export interface EmptyStmt extends BaseNode {
  type: "empty_stmt";
}

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
    | OrderByClause
    | LimitClause
  )[];
}

export type Clause =
  | WithClause
  | SelectClause
  | FromClause
  | WhereClause
  | GroupByClause
  | HavingClause
  | WindowClause
  | OrderByClause
  | PartitionByClause // in window definitions
  | LimitClause
  | InsertClause
  | ValuesClause
  | UpdateClause // in UPDATE statement
  | SetClause // in UPDATE statement
  | UpsertClause // in INSERT statement
  | ReturningClause; // in UPDATE,INSERT,DELETE

export interface WithClause extends BaseNode {
  type: "with_clause";
  withKw: Keyword<"WITH">;
  recursiveKw?: Keyword<"RECURSIVE">;
  tables: ListExpr<CommonTableExpression>;
}

export interface CommonTableExpression extends BaseNode {
  type: "common_table_expression";
  table: Identifier;
  columns?: ParenExpr<ListExpr<ColumnRef>>;
  asKw: Keyword<"AS">;
  optionKw?:
    | Keyword<"MATERIALIZED">
    | [Keyword<"NOT">, Keyword<"MATERIALIZED">];
  expr: Expr;
}

export interface SelectClause extends BaseNode {
  type: "select_clause";
  selectKw: Keyword<"SELECT">;
  options: Keyword<
    | "ALL"
    | "DISTINCT"
    | "DISTINCTROW"
    | "HIGH_PRIORITY"
    | "STRAIGHT_JOIN"
    | "SQL_CALC_FOUND_ROWS"
    | "SQL_CACHE"
    | "SQL_NO_CACHE"
    | "SQL_BIG_RESULT"
    | "SQL_SMALL_RESULT"
    | "SQL_BUFFER_RESULT"
  >[];
  columns: ListExpr<Expr | Alias<Expr>>;
}

export interface FromClause extends BaseNode {
  type: "from_clause";
  fromKw: Keyword<"FROM">;
  expr: TableOrSubquery | JoinExpr;
}

export interface WhereClause extends BaseNode {
  type: "where_clause";
  whereKw: Keyword<"WHERE">;
  expr: Expr;
}

export interface GroupByClause extends BaseNode {
  type: "group_by_clause";
  groupByKw: [Keyword<"GROUP">, Keyword<"BY">];
  columns: ListExpr<Expr>;
}

export interface HavingClause extends BaseNode {
  type: "having_clause";
  havingKw: Keyword<"HAVING">;
  expr: Expr;
}

export interface WindowClause extends BaseNode {
  type: "window_clause";
  windowKw: Keyword<"WINDOW">;
  namedWindows: NamedWindow[];
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
  specifications: ListExpr<SortSpecification | ColumnRef>;
  withRollupKw?: [Keyword<"WITH">, Keyword<"ROLLUP">];
}

export interface PartitionByClause extends BaseNode {
  type: "partition_by_clause";
  partitionByKw: [Keyword<"PARTITION">, Keyword<"BY">];
  specifications: ListExpr<Expr>;
}

export interface LimitClause extends BaseNode {
  type: "limit_clause";
  limitKw: Keyword<"LIMIT">;
  count: Expr;
  offsetKw?: Keyword<"OFFSET">;
  offset?: Expr;
}

export interface JoinExpr extends BaseNode {
  type: "join_expr";
  left: JoinExpr | TableOrSubquery;
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
  | TableRef
  | TableFuncCall
  | IndexedTableRef
  | NotIndexedTableRef
  | ParenExpr<SubSelect | TableOrSubquery | JoinExpr>
  | Alias<TableOrSubquery>;

// SQLite only
export interface IndexedTableRef extends BaseNode {
  type: "indexed_table_ref";
  table: TableRef | Alias<TableRef>;
  indexedByKw: [Keyword<"INDEXED">, Keyword<"BY">];
  index: Identifier;
}
export interface NotIndexedTableRef extends BaseNode {
  type: "not_indexed_table_ref";
  table: TableRef | Alias<TableRef>;
  notIndexedKw: [Keyword<"NOT">, Keyword<"INDEXED">];
}

export interface JoinOnSpecification extends BaseNode {
  type: "join_on_specification";
  onKw: Keyword<"ON">;
  expr: Expr;
}

export interface JoinUsingSpecification extends BaseNode {
  type: "join_using_specification";
  usingKw: Keyword<"USING">;
  expr: ParenExpr<ListExpr<ColumnRef>>;
}

export interface SortSpecification extends BaseNode {
  type: "sort_specification";
  expr: Expr;
  orderKw?: Keyword<"ASC" | "DESC">;
  nullHandlingKw?: [Keyword<"NULLS">, Keyword<"FIRST" | "LAST">];
}

export interface ReturningClause extends BaseNode {
  type: "returning_clause";
  returningKw: Keyword<"RETURNING">;
  columns: ListExpr<Expr | Alias<Expr>>;
}

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

// DROP TABLE
export interface DropTableStmt extends BaseNode {
  type: "drop_table_stmt";
  dropKw: Keyword<"DROP">;
  temporaryKw?: Keyword<"TEMP" | "TEMPORARY">;
  tableKw: Keyword<"TABLE">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  tables: ListExpr<TableRef>;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}

// DELETE FROM
export interface DeleteStmt extends BaseNode {
  type: "delete_stmt";
  with?: WithClause;
  deleteKw: Keyword<"DELETE">;
  fromKw: Keyword<"FROM">;
  table: TableRef | Alias<TableRef>;
  where?: WhereClause;
  returning?: ReturningClause;
}

// UPDATE
export interface UpdateStmt extends BaseNode {
  type: "update_stmt";
  clauses: (
    | WithClause
    | UpdateClause
    | SetClause
    | WhereClause
    | FromClause
    | OrderByClause
    | LimitClause
    | ReturningClause
  )[];
}

export interface UpdateClause extends BaseNode {
  type: "update_clause";
  updateKw: Keyword<"UPDATE">;
  options: UpsertOption[];
  orAction?: OrAlternateAction;
  tables: ListExpr<TableRef | Alias<TableRef>>;
}

export interface SetClause extends BaseNode {
  type: "set_clause";
  setKw: Keyword<"SET">;
  assignments: ListExpr<ColumnAssignment>;
}

export interface ColumnAssignment extends BaseNode {
  type: "column_assignment";
  column: ColumnRef | ParenExpr<ListExpr<ColumnRef>>;
  expr: Expr | Default;
}

// CREATE VIEW
export interface CreateViewStmt extends BaseNode {
  type: "create_view_stmt";
  createKw: Keyword<"CREATE">;
  temporaryKw?: Keyword<"TEMP" | "TEMPORARY">;
  viewKw: Keyword<"VIEW">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: TableRef;
  columns?: ParenExpr<ListExpr<ColumnRef>>;
  asKw: Keyword<"AS">;
  expr: SubSelect;
}

// DROP VIEW
export interface DropViewStmt extends BaseNode {
  type: "drop_view_stmt";
  dropViewKw: [Keyword<"DROP">, Keyword<"VIEW">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  views: ListExpr<TableRef>;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}

// CREATE INDEX
export interface CreateIndexStmt extends BaseNode {
  type: "create_index_stmt";
  createKw: Keyword<"CREATE">;
  indexTypeKw?: Keyword<"UNIQUE" | "FULLTEXT" | "SPATIAL">;
  indexKw: Keyword<"INDEX">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: TableRef;
  onKw: Keyword<"ON">;
  table: TableRef;
  columns: ParenExpr<ListExpr<SortSpecification | ColumnRef>>;
  where?: WhereClause;
}

// DROP INDEX
export interface DropIndexStmt extends BaseNode {
  type: "drop_index_stmt";
  dropIndexKw: [Keyword<"DROP">, Keyword<"INDEX">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  indexes: ListExpr<TableRef>;
  onKw?: Keyword<"ON">;
  table?: TableRef;
}

// ANALYZE
export interface AnalyzeStmt extends BaseNode {
  type: "analyze_stmt";
  analyzeKw: Keyword<"ANALYZE">;
  tableKw?: Keyword<"TABLE">;
  tables: ListExpr<TableRef>;
}

// EXPLAIN
export interface ExplainStmt extends BaseNode {
  type: "explain_stmt";
  explainKw: Keyword<"EXPLAIN" | "DESCRIBE" | "DESC">;
  analyzeKw?: Keyword<"ANALYZE">;
  queryPlanKw?: [Keyword<"QUERY">, Keyword<"PLAN">];
  statement: Statement;
}

// other...

export interface Alias<T = Node> extends BaseNode {
  type: "alias";
  expr: T;
  asKw?: Keyword<"AS">;
  alias: Identifier;
}
