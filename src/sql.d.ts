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
  | AllColumns
  | DistinctArg
  | CastArg
  | CommonTableExpression
  | DataType
  | NamedWindow
  | WindowDefinition
  | OverArg
  | FrameNode
  | CaseWhen
  | CaseElse
  | DefaultValues
  | Default
  | InsertOption
  | ColumnAssignment
  | Alias;

type Program = BaseNode & {
  type: "program";
  statements: Statement[];
};

type Statement =
  | EmptyStatement
  | CompoundSelectStatement
  | SelectStatement
  | CreateTableStatement
  | DropTableStatement
  | InsertStatement
  | DeleteStatement
  | UpdateStatement;

type Expr =
  | ExprList
  | ParenExpr
  | BinaryExpr
  | UnaryExpr
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
  | BoolLiteral
  | NullLiteral
  | DateTimeLiteral;

type EmptyStatement = BaseNode & {
  type: "empty_statement";
  foo: number;
};

// SELECT
type CompoundSelectStatement = BaseNode & {
  type: "compound_select_statement";
  left: SubSelect;
  operator: Keyword | Keyword[]; // { UNION | EXCEPT | INTERSECT } [ALL | DISTINCT]
  right: SubSelect;
};

type SubSelect =
  | SelectStatement
  | CompoundSelectStatement
  | ParenExpr<SubSelect>;

type SelectStatement = BaseNode & {
  type: "select_statement";
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
  | PartitionByClause
  | LimitClause
  | ValuesClause;

type WithClause = BaseNode & {
  type: "with_clause";
  withKw: Keyword;
  recursiveKw?: Keyword;
  tables: CommonTableExpression[];
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
  columns: (Expr | Alias<Expr>)[];
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
  columns: Expr[];
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
  specifications: Expr[];
};

type PartitionByClause = BaseNode & {
  type: "partition_by_clause";
  partitionByKw: Keyword[];
  specifications: Expr[];
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
  orderKw?: Keyword;
};

// CREATE TABLE
type CreateTableStatement = BaseNode & {
  type: "create_table_statement";
  createKw: Keyword;
  tableKw: Keyword;
  temporaryKw?: Keyword;
  ifNotExistsKw?: Keyword[];
  table: TableRef;
  columns: ParenExpr<
    ExprList<ColumnDefinition | TableConstraint | Constraint<TableConstraint>>
  >;
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
};

type ConstraintCheck = BaseNode & {
  type: "constraint_check";
  checkKw: Keyword;
  expr: ParenExpr<Expr>;
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

// DROP TABLE
type DropTableStatement = BaseNode & {
  type: "drop_table_statement";
  dropKw: Keyword;
  temporaryKw?: Keyword;
  tableKw: Keyword;
  ifExistsKw?: Keyword[];
  tables: TableRef[];
  behaviorKw?: Keyword; // CASCADE | RESTRICT
};

// INSERT INTO
type InsertStatement = BaseNode & {
  type: "insert_statement";
  insertKw: Keyword; // INSERT | REPLACE
  options: InsertOption[];
  intoKw?: Keyword;
  table: TableRef | Alias<TableRef>;
  columns?: ParenExpr<ExprList<ColumnRef>>;
  source: ValuesClause | SubSelect | DefaultValues;
};

type InsertOption = BaseNode & {
  type: "insert_option";
  kw: Keyword | Keyword[];
};

type ValuesClause = BaseNode & {
  type: "values_clause";
  valuesKw: Keyword; // VALUES | VALUE
  values: ExprList<ParenExpr<ExprList<Expr | Default>>>;
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
type DeleteStatement = BaseNode & {
  type: "delete_statement";
  deleteKw: Keyword;
  fromKw: Keyword;
  table: TableRef | Alias<TableRef>;
  where?: WhereClause;
};

// UPDATE
type UpdateStatement = BaseNode & {
  type: "update_statement";
  updateKw: Keyword;
  tables: TableRef[];
  setKw: Keyword;
  assignments: ColumnAssignment[];
  where?: WhereClause;
};

type ColumnAssignment = BaseNode & {
  type: "column_assignment";
  column: ColumnRef;
  expr: Expr | Default;
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

type UnaryExpr = BaseNode & {
  type: "unary_expr";
  operator: string | Keyword[];
  expr: Expr;
};

type FuncCall = BaseNode & {
  type: "func_call";
  name: Identifier;
  args: ParenExpr<ExprList<Expr | AllColumns | DistinctArg>>;
  over?: OverArg;
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

type BoolLiteral = BaseNode & {
  type: "bool";
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
