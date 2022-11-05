type BaseNode = {
  leading?: Whitespace[];
  trailing?: Whitespace[];
  range?: [number, number];
};

type Whitespace = {
  type: "block_comment" | "line_comment" | "newline" | "space";
  text: string;
};

type Node =
  | Program
  | Statement
  | Clause
  | Expr
  | Keyword
  | Join
  | JoinOnSpecification
  | JoinUsingSpecification
  | SortSpecification
  | ColumnDefinition
  | Constraint<ColumnConstraint | TableConstraint>
  | ColumnConstraint
  | TableConstraint
  | ConstraintName
  | ConstraintDeferrable
  | ReferencesSpecification
  | ReferentialAction
  | ReferentialMatch
  | OnConflictClause
  | TableOption
  | AlterAction
  | TriggerEvent
  | TriggerCondition
  | TriggerBody
  | AllColumns
  | RollbackToSavepoint
  | DistinctArg
  | CastArg
  | CommonTableExpression
  | DataType
  | NamedWindow
  | WindowDefinition
  | FilterArg
  | OverArg
  | FrameNode
  | CaseWhen
  | CaseElse
  | RowConstructor
  | DefaultValues
  | Default
  | UpsertOption
  | OrAlternateAction
  | ColumnAssignment
  | Alias
  | PragmaAssignment
  | PragmaFuncCall;

type Program = BaseNode & {
  type: "program";
  statements: Statement[];
};

type Statement =
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

type Expr =
  | ExprList
  | ParenExpr
  | BinaryExpr
  | PrefixOpExpr
  | PostfixOpExpr
  | FuncCall
  | CastExpr
  | BetweenExpr
  | CaseExpr
  | IntervalExpr
  | StringWithCharset
  | Literal
  | ColumnRef
  | TableRef
  | Identifier;

type Literal =
  | StringLiteral
  | NumberLiteral
  | BooleanLiteral
  | NullLiteral
  | DateTimeLiteral;

type EmptyStmt = BaseNode & {
  type: "empty_stmt";
  foo: number;
};

// SELECT
type CompoundSelectStmt = BaseNode & {
  type: "compound_select_stmt";
  left: SubSelect;
  operator: Keyword | Keyword[]; // { UNION | EXCEPT | INTERSECT } [ALL | DISTINCT]
  right: SubSelect;
};

type SubSelect = SelectStmt | CompoundSelectStmt | ParenExpr<SubSelect>;

type SelectStmt = BaseNode & {
  type: "select_stmt";
  clauses: Clause[];
};

type Clause =
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
  | ValuesClause
  | UpdateClause // in UPDATE statement
  | SetClause // in UPDATE statement
  | ReturningClause; // in UPDATE,INSERT,DELETE

type WithClause = BaseNode & {
  type: "with_clause";
  withKw: Keyword;
  recursiveKw?: Keyword;
  tables: ExprList<CommonTableExpression>;
};

type CommonTableExpression = BaseNode & {
  type: "common_table_expression";
  table: Identifier;
  columns?: ParenExpr<ExprList<ColumnRef>>;
  asKw: Keyword;
  optionKw?: Keyword[];
  expr: Expr;
};

type SelectClause = BaseNode & {
  type: "select_clause";
  selectKw: Keyword;
  options: Keyword[];
  columns: ExprList<Expr | Alias<Expr>>;
};

type FromClause = BaseNode & {
  type: "from_clause";
  fromKw: Keyword;
  tables: (JoinTable | Alias<JoinTable> | Join)[];
};

type WhereClause = BaseNode & {
  type: "where_clause";
  whereKw: Keyword;
  expr: Expr;
};

type GroupByClause = BaseNode & {
  type: "group_by_clause";
  groupByKw: Keyword[];
  columns: ExprList<Expr>;
};

type HavingClause = BaseNode & {
  type: "having_clause";
  havingKw: Keyword;
  expr: Expr;
};

type WindowClause = BaseNode & {
  type: "window_clause";
  windowKw: Keyword;
  namedWindows: NamedWindow[];
};

type NamedWindow = BaseNode & {
  type: "named_window";
  name: Identifier;
  asKw: Keyword;
  window: ParenExpr<WindowDefinition>;
};

type WindowDefinition = BaseNode & {
  type: "window_definition";
  baseWindowName?: Identifier;
  partitionBy?: PartitionByClause;
  orderBy?: OrderByClause;
  frame?: FrameClause;
};

type OrderByClause = BaseNode & {
  type: "order_by_clause";
  orderByKw: Keyword[];
  specifications: ExprList<SortSpecification>;
  withRollupKw?: Keyword[]; // WITH ROLLUP
};

type PartitionByClause = BaseNode & {
  type: "partition_by_clause";
  partitionByKw: Keyword[];
  specifications: ExprList<Expr>;
};

type LimitClause = BaseNode & {
  type: "limit_clause";
  limitKw: Keyword;
  count: Expr;
  offsetKw?: Keyword;
  offset?: Expr;
};

type Join = BaseNode & {
  type: "join";
  operator: Keyword[] | ",";
  table: JoinTable | Alias<JoinTable>;
  specification?: JoinOnSpecification | JoinUsingSpecification;
};

type JoinTable = TableRef | ParenExpr<TableRef | SubSelect>;

type JoinOnSpecification = BaseNode & {
  type: "join_on_specification";
  onKw: Keyword;
  expr: Expr;
};

type JoinUsingSpecification = BaseNode & {
  type: "join_using_specification";
  usingKw: Keyword;
  expr: ParenExpr<ExprList<ColumnRef>>;
};

type SortSpecification = BaseNode & {
  type: "sort_specification";
  expr: Expr;
  orderKw?: Keyword; // ASC | DESC
  nullHandlingKw?: Keyword[]; // NULLS FIRST | NULLS LAST
};

type ReturningClause = BaseNode & {
  type: "returning_clause";
  returningKw: Keyword; // RETURNING
  columns: ExprList<Expr | Alias<Expr>>;
};

// CREATE TABLE
type CreateTableStmt = BaseNode & {
  type: "create_table_stmt";
  createKw: Keyword;
  tableKw: Keyword;
  temporaryKw?: Keyword;
  ifNotExistsKw?: Keyword[];
  table: TableRef;
  columns: ParenExpr<
    ExprList<ColumnDefinition | TableConstraint | Constraint<TableConstraint>>
  >;
  options?: ExprList<TableOption>;
};

type ColumnDefinition = BaseNode & {
  type: "column_definition";
  name: ColumnRef;
  dataType: DataType;
  constraints: (ColumnConstraint | Constraint<ColumnConstraint>)[];
};

type DataType = BaseNode & {
  type: "data_type";
  nameKw: Keyword | Keyword[];
  params?: ParenExpr<ExprList<Literal>>;
};

type Constraint<T> = BaseNode & {
  type: "constraint";
  name?: ConstraintName;
  constraint: T;
  deferrable?: ConstraintDeferrable;
};

type ConstraintName = BaseNode & {
  type: "constraint_name";
  constraintKw: Keyword;
  name?: Identifier;
};

type ConstraintDeferrable = BaseNode & {
  type: "constraint_deferrable";
  deferrableKw: Keyword | Keyword[]; // DEFERRABLE | NOT DEFERRABLE
  initiallyKw?: Keyword[]; // INITIALLY IMMEDIATE | INITIALLY DEFERRED
};

type TableConstraint =
  | ConstraintPrimaryKey
  | ConstraintForeignKey
  | ConstraintUnique
  | ConstraintCheck
  | ConstraintIndex;

type ColumnConstraint =
  | ConstraintNull
  | ConstraintNotNull
  | ConstraintDefault
  | ConstraintAutoIncrement
  | ConstraintUnique
  | ConstraintPrimaryKey
  | ReferencesSpecification
  | ConstraintComment
  | ConstraintCheck
  | ConstraintIndex
  | ConstraintGenerated
  | ConstraintCollate
  | ConstraintVisible
  | ConstraintColumnFormat
  | ConstraintStorage
  | ConstraintEngineAttribute;

type ConstraintPrimaryKey = BaseNode & {
  type: "constraint_primary_key";
  primaryKeyKw: Keyword[];
  columns?: ParenExpr<ExprList<ColumnRef>>;
  onConflict?: OnConflictClause;
};

type ConstraintForeignKey = BaseNode & {
  type: "constraint_foreign_key";
  foreignKeyKw: Keyword[];
  columns: ParenExpr<ExprList<ColumnRef>>;
  references: ReferencesSpecification;
};

type ReferencesSpecification = BaseNode & {
  type: "references_specification";
  referencesKw: Keyword;
  table: TableRef;
  columns?: ParenExpr<ExprList<ColumnRef>>;
  options: (ReferentialAction | ReferentialMatch)[];
};

type ReferentialAction = BaseNode & {
  type: "referential_action";
  onKw: Keyword; // ON
  eventKw: Keyword; // DELETE | UPDATE
  actionKw: Keyword | Keyword[]; // RESTRICT | CASCADE | SET NULL | NO ACTION | SET DEFAULT
};

type ReferentialMatch = BaseNode & {
  type: "referential_match";
  matchKw: Keyword;
  typeKw: Keyword; // FULL | PARTIAL | SIMPLE
};

type ConstraintUnique = BaseNode & {
  type: "constraint_unique";
  uniqueKw: Keyword | Keyword[];
  columns?: ParenExpr<ExprList<ColumnRef>>;
  onConflict?: OnConflictClause;
};

type ConstraintCheck = BaseNode & {
  type: "constraint_check";
  checkKw: Keyword;
  expr: ParenExpr<Expr>;
  onConflict?: OnConflictClause;
};

type ConstraintIndex = BaseNode & {
  type: "constraint_index";
  indexTypeKw?: Keyword; // FULLTEXT | SPATIAL
  indexKw: Keyword; // INDEX | KEY
  columns?: ParenExpr<ExprList<ColumnRef>>;
};

type ConstraintNull = BaseNode & {
  type: "constraint_null";
  nullKw: Keyword;
};

type ConstraintNotNull = BaseNode & {
  type: "constraint_not_null";
  notNullKw: Keyword[];
  onConflict?: OnConflictClause;
};

type ConstraintDefault = BaseNode & {
  type: "constraint_default";
  defaultKw: Keyword;
  expr: Expr;
};

type ConstraintAutoIncrement = BaseNode & {
  type: "constraint_auto_increment";
  autoIncrementKw: Keyword;
};

type ConstraintComment = BaseNode & {
  type: "constraint_comment";
  commentKw: Keyword;
  value: StringLiteral;
};

type ConstraintGenerated = BaseNode & {
  type: "constraint_generated";
  generatedKw?: Keyword[]; // GENERATED ALWAYS
  asKw: Keyword[]; // AS
  expr: ParenExpr<Expr>;
  storageKw?: Keyword; // STORED | VIRTUAL
};

type ConstraintCollate = BaseNode & {
  type: "constraint_collate";
  collateKw: Keyword; // COLLATE
  collation: Identifier;
};

type ConstraintVisible = BaseNode & {
  type: "constraint_visible";
  visibleKw: Keyword; // VISIBLE | INVISIBLE
};

type ConstraintColumnFormat = BaseNode & {
  type: "constraint_column_format";
  columnFormatKw: Keyword; // COLUMN_FORMAT
  formatKw: Keyword; // FIXED | DYNAMIC | DEFAULT
};

type ConstraintStorage = BaseNode & {
  type: "constraint_storage";
  storageKw: Keyword; // STORAGE
  typeKw: Keyword; // DISK | MEMORY
};

type ConstraintEngineAttribute = BaseNode & {
  type: "constraint_engine_attribute";
  engineAttributeKw: Keyword; // ENGINE_ATTRIBUTE | SECONDARY_ENGINE_ATTRIBUTE
  hasEq: boolean; // True when "=" sign is used
  value: StringLiteral;
};

type OnConflictClause = BaseNode & {
  type: "on_conflict_clause";
  onConflictKw: Keyword[]; // ON CONFLICT
  resolutionKw: Keyword; // ROLLBACK | ABORT | FAIL | IGNORE | REPLACE
};

type TableOption = BaseNode & {
  type: "table_option";
  name: Keyword | Keyword[];
  hasEq?: boolean; // True when "=" sign is used
  value?: NumberLiteral | StringLiteral | Identifier | Keyword;
};

// ALTER TABLE
type AlterTableStmt = BaseNode & {
  type: "alter_table_stmt";
  alterTableKw: Keyword[];
  table: TableRef;
  actions: ExprList<AlterAction>;
};

type AlterAction =
  | AlterRenameTable
  | AlterRenameColumn
  | AlterAddColumn
  | AlterDropColumn;

type AlterRenameTable = BaseNode & {
  type: "alter_rename_table";
  renameKw: Keyword | Keyword[]; // RENAME | RENAME TO | RENAME AS
  newName: TableRef;
};

type AlterRenameColumn = BaseNode & {
  type: "alter_rename_column";
  renameKw: Keyword | Keyword[]; // RENAME | RENAME COLUMN
  oldName: ColumnRef;
  toKw: Keyword; // TO | AS
  newName: ColumnRef;
};

type AlterAddColumn = BaseNode & {
  type: "alter_add_column";
  addKw: Keyword | Keyword[]; // ADD | ADD COLUMN
  column: ColumnDefinition;
};

type AlterDropColumn = BaseNode & {
  type: "alter_drop_column";
  dropKw: Keyword | Keyword[]; // DROP | DROP COLUMN
  column: ColumnRef;
};

// DROP TABLE
type DropTableStmt = BaseNode & {
  type: "drop_table_stmt";
  dropKw: Keyword;
  temporaryKw?: Keyword;
  tableKw: Keyword;
  ifExistsKw?: Keyword[];
  tables: ExprList<TableRef>;
  behaviorKw?: Keyword; // CASCADE | RESTRICT
};

// INSERT INTO
type InsertStmt = BaseNode & {
  type: "insert_stmt";
  with?: WithClause;
  insertKw: Keyword; // INSERT | REPLACE
  options: UpsertOption[];
  orAction?: OrAlternateAction;
  intoKw?: Keyword;
  table: TableRef | Alias<TableRef>;
  columns?: ParenExpr<ExprList<ColumnRef>>;
  source: ValuesClause | SubSelect | DefaultValues;
  returning?: ReturningClause;
};

// Only in MySQL INSERT & UPDATE clauses
type UpsertOption = BaseNode & {
  type: "upsert_option";
  kw: Keyword; // LOW_PRIORITY | DELAYED | HIGH_PRIORITY | IGNORE
};

// Only in SQLite
type OrAlternateAction = BaseNode & {
  type: "or_alternate_action";
  orKw: Keyword; // OR
  actionKw: Keyword; // ABORT | FAIL | IGNORE | REPLACE | ROLLBACK
};

type ValuesClause = BaseNode & {
  type: "values_clause";
  valuesKw: Keyword; // VALUES | VALUE
  values: ExprList<ParenExpr<ExprList<Expr | Default>> | RowConstructor>;
};

// only in MySQL
type RowConstructor = BaseNode & {
  type: "row_constructor";
  rowKw: Keyword; // ROW
  row: ParenExpr<ExprList<Expr | Default>>;
};

type DefaultValues = BaseNode & {
  type: "default_values";
  kw: Keyword[]; // DEFAULT VALUES
};

type Default = BaseNode & {
  type: "default";
  kw: Keyword[]; // DEFAULT
};

// DELETE FROM
type DeleteStmt = BaseNode & {
  type: "delete_stmt";
  with?: WithClause;
  deleteKw: Keyword;
  fromKw: Keyword;
  table: TableRef | Alias<TableRef>;
  where?: WhereClause;
  returning?: ReturningClause;
};

// UPDATE
type UpdateStmt = BaseNode & {
  type: "update_stmt";
  clauses: Clause[];
};

type UpdateClause = BaseNode & {
  type: "update_clause";
  updateKw: Keyword;
  options: UpsertOption[];
  orAction?: OrAlternateAction;
  tables: ExprList<TableRef>;
};

type SetClause = BaseNode & {
  type: "set_clause";
  setKw: Keyword;
  assignments: ExprList<ColumnAssignment>;
};

type ColumnAssignment = BaseNode & {
  type: "column_assignment";
  column: ColumnRef;
  expr: Expr | Default;
};

// CREATE VIEW
type CreateViewStmt = BaseNode & {
  type: "create_view_stmt";
  createKw: Keyword;
  temporaryKw?: Keyword;
  viewKw: Keyword;
  ifNotExistsKw?: Keyword[];
  name: TableRef;
  columns?: ParenExpr<ExprList<ColumnRef>>;
  asKw: Keyword;
  expr: SubSelect;
};

// DROP VIEW
type DropViewStmt = BaseNode & {
  type: "drop_view_stmt";
  dropViewKw: Keyword[];
  ifExistsKw?: Keyword[];
  views: ExprList<TableRef>;
  behaviorKw?: Keyword; // CASCADE | RESTRICT
};

// CREATE INDEX
type CreateIndexStmt = BaseNode & {
  type: "create_index_stmt";
  createKw: Keyword; // CREATE
  indexTypeKw?: Keyword; // UNIQUE | FULLTEXT | SPATIAL
  indexKw: Keyword; // INDEX
  ifNotExistsKw?: Keyword[]; // IF NOT EXISTS
  name: TableRef;
  onKw: Keyword; // ON
  table: TableRef;
  columns: ParenExpr<ExprList<ColumnRef>>;
  where?: WhereClause;
};

// DROP INDEX
type DropIndexStmt = BaseNode & {
  type: "drop_index_stmt";
  dropIndexKw: Keyword[]; // DROP INDEX
  ifExistsKw?: Keyword[]; // IF EXISTS
  indexes: ExprList<TableRef>;
  onKw?: Keyword; // ON
  table?: TableRef;
};

// CREATE TRIGGER
type CreateTriggerStmt = BaseNode & {
  type: "create_trigger_stmt";
  createKw: Keyword; // CREATE
  temporaryKw?: Keyword; // TEMPORARY | TEMP
  triggerKw: Keyword; // TRIGGER
  ifNotExistsKw?: Keyword[]; // IF NOT EXISTS
  name: TableRef;
  event: TriggerEvent;
  onKw: Keyword; // ON
  table: TableRef;
  forEachRowKw?: Keyword[]; // FOR EACH ROW
  condition?: TriggerCondition;
  body: TriggerBody;
};

type TriggerEvent = BaseNode & {
  type: "trigger_event";
  timeKw?: Keyword | Keyword[]; // BEFORE | AFTER | INSTEAD OF
  eventKw: Keyword; // INSERT | DELETE | UPDATE
  ofKw?: Keyword; // OF
  columns?: ExprList<ColumnRef>;
};

type TriggerCondition = BaseNode & {
  type: "trigger_condition";
  whenKw?: Keyword; // WHEN
  expr: Expr;
};

type TriggerBody = BaseNode & {
  type: "trigger_body";
  beginKw: Keyword; // BEGIN
  statements: Statement[];
  endKw: Keyword; // END
};

// DROP TRIGGER
type DropTriggerStmt = BaseNode & {
  type: "drop_trigger_stmt";
  dropTriggerKw: Keyword[]; // DROP TRIGGER
  ifExistsKw?: Keyword[]; // IF EXISTS
  trigger: TableRef;
};

// ANALYZE
type AnalyzeStmt = BaseNode & {
  type: "analyze_stmt";
  analyzeKw: Keyword; // ANALYZE
  tableKw?: Keyword; // TABLE
  tables: ExprList<TableRef>;
};

// EXPLAIN
type ExplainStmt = BaseNode & {
  type: "explain_stmt";
  explainKw: Keyword; // EXPLAIN | DESCRIBE | DESC
  analyzeKw?: Keyword; // ANALYZE
  queryPlanKw?: Keyword[]; // QUERY PLAN
  statement: Statement;
};

// Transactions
type TransactionStmt =
  | StartTransactionStmt
  | CommitTransactionStmt
  | RollbackTransactionStmt
  | SavepointStmt
  | ReleaseSavepointStmt;

type StartTransactionStmt = BaseNode & {
  type: "start_transaction_stmt";
  startKw: Keyword; // START | BEGIN
  behaviorKw?: Keyword; // DEFERRED | IMMEDIATE | EXCLUSIVE
  transactionKw?: Keyword; // TRANSACTION | WORK
};

type CommitTransactionStmt = BaseNode & {
  type: "commit_transaction_stmt";
  commitKw: Keyword; // COMMIT | END
  transactionKw?: Keyword; // TRANSACTION | WORK
};

type RollbackTransactionStmt = BaseNode & {
  type: "rollback_transaction_stmt";
  rollbackKw: Keyword; // ROLLBACK
  transactionKw?: Keyword; // TRANSACTION | WORK
  savepoint?: RollbackToSavepoint;
};

type RollbackToSavepoint = BaseNode & {
  type: "rollback_to_savepoint";
  toKw: Keyword; // TO
  savepointKw?: Keyword; // SAVEPOINT
  savepoint: Identifier;
};

type SavepointStmt = BaseNode & {
  type: "savepoint_stmt";
  savepointKw: Keyword; // SAVEPOINT
  savepoint: Identifier;
};

type ReleaseSavepointStmt = BaseNode & {
  type: "release_savepoint_stmt";
  releaseKw: Keyword; // RELEASE
  savepointKw?: Keyword; // SAVEPOINT
  savepoint: Identifier;
};

// SQLite-specific statements
type SqliteStmt =
  | AttachDatabaseStmt
  | DetachDatabaseStmt
  | VacuumStmt
  | ReindexStmt
  | PragmaStmt
  | CreateVirtualTableStmt;

type AttachDatabaseStmt = BaseNode & {
  type: "attach_database_stmt";
  attachKw: Keyword; // ATTACH
  databaseKw?: Keyword; // DATABASE
  file: Expr;
  asKw: Keyword; // AS
  schema: Identifier;
};

type DetachDatabaseStmt = BaseNode & {
  type: "detach_database_stmt";
  detachKw: Keyword; // DETACH
  databaseKw?: Keyword; // DATABASE
  schema: Identifier;
};

type VacuumStmt = BaseNode & {
  type: "vacuum_stmt";
  vacuumKw: Keyword; // VACUUM
  schema?: Identifier;
  intoKw?: Keyword; // INTO
  file?: StringLiteral;
};

type ReindexStmt = BaseNode & {
  type: "reindex_stmt";
  reindexKw: Keyword; // REINDEX
  table?: TableRef;
};

type PragmaStmt = BaseNode & {
  type: "pragma_stmt";
  pragmaKw: Keyword; // PRAGMA
  pragma: TableRef | PragmaAssignment | PragmaFuncCall;
};

type PragmaAssignment = BaseNode & {
  type: "pragma_assignment";
  name: TableRef;
  value: Literal | Keyword;
};

type PragmaFuncCall = BaseNode & {
  type: "pragma_func_call";
  name: TableRef;
  args: ParenExpr<Literal | Keyword>;
};

type CreateVirtualTableStmt = BaseNode & {
  type: "create_virtual_table_stmt";
  createVirtualTableKw: Keyword[]; // CREATE VIRTUAL TABLE
  ifNotExistsKw?: Keyword[]; // IF NOT EXISTS
  table: TableRef;
  usingKw: Keyword; // USING
  module: FuncCall;
};

// Window frame
type FrameNode =
  | FrameClause
  | FrameBetween
  | FrameBound
  | FrameUnbounded
  | FrameExclusion;

type FrameClause = BaseNode & {
  type: "frame_clause";
  unitKw: Keyword; // ROWS | RANGE | GROUPS
  extent: FrameBetween | FrameBound;
  exclusion?: FrameExclusion;
};

type FrameBetween = BaseNode & {
  type: "frame_between";
  betweenKw: Keyword;
  begin: FrameBound;
  andKw: Keyword;
  end: FrameBound;
};

type FrameBound =
  | FrameBoundCurrentRow
  | FrameBoundPreceding
  | FrameBoundFollowing;

type FrameBoundCurrentRow = BaseNode & {
  type: "frame_bound_current_row";
  currentRowKw: Keyword[];
};
type FrameBoundPreceding = BaseNode & {
  type: "frame_bound_preceding";
  expr: Literal | FrameUnbounded;
  precedingKw: Keyword;
};
type FrameBoundFollowing = BaseNode & {
  type: "frame_bound_following";
  expr: Literal | FrameUnbounded;
  followingKw: Keyword;
};
type FrameUnbounded = BaseNode & {
  type: "frame_unbounded";
  unboundedKw: Keyword;
};
type FrameExclusion = BaseNode & {
  type: "frame_exclusion";
  excludeKw: Keyword;
  kindKw: Keyword | Keyword[]; // CURRENT ROW | GROUPS | TIES | NO OTHERS
};

// other...

interface Alias<T = Expr> extends BaseNode {
  type: "alias";
  expr: T;
  asKw?: Keyword;
  alias: Identifier;
}

type AllColumns = BaseNode & {
  type: "all_columns";
};

interface ExprList<T = Node> extends BaseNode {
  type: "expr_list";
  items: T[];
}

interface ParenExpr<T = Node> extends BaseNode {
  type: "paren_expr";
  expr: T;
}

type BinaryExpr = BaseNode & {
  type: "binary_expr";
  left: Expr;
  operator: string | Keyword | Keyword[];
  right: Expr;
};

type PrefixOpExpr = BaseNode & {
  type: "prefix_op_expr";
  operator: string | Keyword[];
  expr: Expr;
};

type PostfixOpExpr = BaseNode & {
  type: "postfix_op_expr";
  operator: string | Keyword[];
  expr: Expr;
};

type FuncCall = BaseNode & {
  type: "func_call";
  name: Identifier;
  args?: ParenExpr<ExprList<Expr | AllColumns | DistinctArg>>;
  filter?: FilterArg;
  over?: OverArg;
};

type FilterArg = BaseNode & {
  type: "filter_arg";
  filterKw: Keyword; // FILTER
  where: ParenExpr<WhereClause>;
};

type OverArg = BaseNode & {
  type: "over_arg";
  overKw: Keyword;
  window: ParenExpr<WindowDefinition> | Identifier;
};

type DistinctArg = BaseNode & {
  type: "distinct_arg";
  distinctKw: Keyword;
  value: Expr;
};

type CastExpr = BaseNode & {
  type: "cast_expr";
  castKw: Keyword;
  args: ParenExpr<CastArg>;
};

type CastArg = BaseNode & {
  type: "cast_arg";
  expr: Expr;
  asKw: Keyword;
  dataType: DataType;
};

type BetweenExpr = BaseNode & {
  type: "between_expr";
  left: Expr;
  betweenKw: Keyword[];
  begin: Expr;
  andKw: Keyword;
  end: Expr;
};

type CaseExpr = BaseNode & {
  type: "case_expr";
  expr?: Expr;
  caseKw: Keyword;
  endKw: Keyword;
  clauses: (CaseWhen | CaseElse)[];
};

type CaseWhen = BaseNode & {
  type: "case_when";
  whenKw: Keyword;
  condition: Expr;
  thenKw: Keyword;
  result: Expr;
};

type CaseElse = BaseNode & {
  type: "case_else";
  elseKw: Keyword;
  result: Expr;
};

type IntervalExpr = BaseNode & {
  type: "interval_expr";
  intervalKw: Keyword;
  expr: Expr;
  unitKw: Keyword;
};

type StringWithCharset = BaseNode & {
  type: "string_with_charset";
  charset: string;
  string: StringLiteral;
};

type StringLiteral = BaseNode & {
  type: "string";
  text: string;
};

type NumberLiteral = BaseNode & {
  type: "number";
  text: string;
};

type BooleanLiteral = BaseNode & {
  type: "boolean";
  text: string;
};

type NullLiteral = BaseNode & {
  type: "null";
  text: string;
};

type DateTimeLiteral = BaseNode & {
  type: "datetime";
  kw: Keyword;
  string: StringLiteral;
};

type ColumnRef = BaseNode & {
  type: "column_ref";
  table?: Identifier;
  column: Identifier | AllColumns;
};

type TableRef = BaseNode & {
  type: "table_ref";
  schema?: Identifier;
  table: Identifier;
};

type Identifier = BaseNode & {
  type: "identifier";
  text: string;
};

type Keyword = BaseNode & {
  type: "keyword";
  text: string;
};

export type ParserOptions = {
  preserveComments?: boolean;
  preserveNewlines?: boolean;
  preserveSpaces?: boolean;
  includeRange?: boolean;
};

export function parse(str: string, options?: ParserOptions): Program;
