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
export * from "./AlterTable";
export * from "./Select";
import { AlterAction, AlterTableStmt } from "./AlterTable";
import { AllColumns, BaseNode, Keyword } from "./Base";
import { AllConstraintNodes } from "./Constraint";
import { AllCreateTableNodes, CreateTableStmt } from "./CreateTable";
import {
  AllExprNodes,
  Expr,
  ListExpr,
  ParenExpr,
  ColumnRef,
  Identifier,
  TableRef,
} from "./Expr";
import {
  AllInsertNodes,
  Default,
  InsertStmt,
  OrAlternateAction,
  UpsertOption,
} from "./Insert";
import {
  AllSelectNodes,
  CompoundSelectStmt,
  FromClause,
  LimitClause,
  OrderByClause,
  ReturningClause,
  SelectStmt,
  SortSpecification,
  SubSelect,
  WhereClause,
  WithClause,
} from "./Select";
import { AllSqliteNodes, SqliteStmt } from "./Sqlite";
import { AllTransactionNodes, TransactionStmt } from "./Transaction";
import { AllTriggerNodes, CreateTriggerStmt, DropTriggerStmt } from "./Trigger";
import { AllFrameNodes } from "./WindowFrame";

export type Node =
  | Program
  | Statement
  | AllExprNodes
  | Keyword
  | AllSelectNodes
  | AllCreateTableNodes
  | AllConstraintNodes
  | AlterAction
  | AllTriggerNodes
  | AllColumns
  | AllTransactionNodes
  | AllFrameNodes
  | AllInsertNodes
  | ColumnAssignment
  | Alias
  | AllSqliteNodes
  | SetClause
  | UpdateClause;

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
