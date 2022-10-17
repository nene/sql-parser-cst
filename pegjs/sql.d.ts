type Ast = Statement[];

type Comments = {
  leadingComments?: Comment[];
  trailingComments?: Comment[];
};

type Comment = {
  type: "block_comment" | "line_comment";
  text: string;
};

type Node =
  | Statement
  | Clause
  | Expr
  | Keyword
  | Join
  | JoinSpecification
  | SortSpecification
  | ColumnDefinition
  | ColumnOption
  | AllColumns
  | CommonTableExpression
  | DataType;

type Statement = EmptyStatement | SelectStatement | CreateTableStatement;

type Expr =
  | SelectStatement
  | Alias
  | ExprList
  | ParenExpr
  | BinaryExpr
  | UnaryExpr
  | BetweenExpr
  | StringWithCharset
  | StringLiteral
  | NumberLiteral
  | BoolLiteral
  | NullLiteral
  | DateTimeLiteral
  | ColumnRef
  | TableRef
  | Identifier;

type EmptyStatement = Comments & {
  type: "empty_statement";
  foo: number;
};

// SELECT

type SelectStatement = Comments & {
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
  | OrderByClause;

type WithClause = Comments & {
  type: "with_clause";
  withKw: Keyword;
  tables: CommonTableExpression[];
};

type CommonTableExpression = Comments & {
  type: "common_table_expression";
  table: Identifier;
  columns: Identifier[];
  asKw: Keyword;
  expr: Expr;
};

type SelectClause = Comments & {
  type: "select_clause";
  selectKw: Keyword;
  options: Keyword[];
  columns: Expr[];
};

type FromClause = Comments & {
  type: "from_clause";
  fromKw: Keyword;
  tables: (Expr | Join)[];
};

type WhereClause = Comments & {
  type: "where_clause";
  whereKw: Keyword;
  expr: Expr;
};

type GroupByClause = Comments & {
  type: "group_by_clause";
  groupByKw: Keyword[];
  columns: Expr[];
};

type HavingClause = Comments & {
  type: "having_clause";
  havingKw: Keyword;
  expr: Expr;
};

type OrderByClause = Comments & {
  type: "order_by_clause";
  orderByKw: Keyword[];
  specifications: Expr[];
};

type Join = Comments & {
  type: "join";
  operator: Keyword[] | ",";
  table: Expr;
  specification?: JoinSpecification;
};

type JoinSpecification = Comments & {
  type: "join_specification";
  kw: Keyword;
  expr: Expr;
};

type SortSpecification = Comments & {
  type: "sort_specification";
  expr: Expr;
  orderKw?: Keyword;
};

// CREATE TABLE
type CreateTableStatement = Comments & {
  type: "create_table_statement";
  createKw: Keyword;
  tableKw: Keyword;
  temporaryKw?: Keyword;
  ifNotExistsKw?: Keyword[];
  table: TableRef;
  columns: ColumnDefinition[];
};

type ColumnDefinition = Comments & {
  type: "column_definition";
  name: ColumnRef;
  dataType: DataType;
  options: ColumnOption[];
};

type DataType = Comments & {
  type: "data_type";
  nameKw: Keyword | Keyword[];
  params?: Expr[];
};

type ColumnOption =
  | ColumnOptionNullable
  | ColumnOptionDefault
  | ColumnOptionAutoIncrement
  | ColumnOptionKey
  | ColumnOptionComment;

type ColumnOptionNullable = Comments & {
  type: "column_option_nullable";
  kw: Keyword | Keyword[];
  value: boolean;
};

type ColumnOptionDefault = Comments & {
  type: "column_option_default";
  kw: Keyword;
  expr: Expr;
};

type ColumnOptionAutoIncrement = Comments & {
  type: "column_option_auto_increment";
  kw: Keyword;
};

type ColumnOptionKey = Comments & {
  type: "column_option_key";
  kw: Keyword | Keyword[];
};

type ColumnOptionComment = Comments & {
  type: "column_option_comment";
  kw: Keyword;
  value: StringLiteral;
};

// other...

type Alias = Comments & {
  type: "alias";
  expr: Expr;
  asKw?: Keyword;
  alias: Identifier;
};

type AllColumns = Comments & {
  type: "all_columns";
};

type ExprList = Comments & {
  type: "expr_list";
  children: Expr[];
};

type ParenExpr = Comments & {
  type: "paren_expr";
  expr: Expr;
};

type BinaryExpr = Comments & {
  type: "binary_expr";
  left: Expr;
  operator: string | Keyword | Keyword[];
  right: Expr;
};

type UnaryExpr = Comments & {
  type: "unary_expr";
  operator: string | Keyword[];
  expr: Expr;
};

type BetweenExpr = Comments & {
  type: "between_expr";
  left: Expr;
  betweenKw: Keyword[];
  begin: Expr;
  andKw: Keyword;
  end: Expr;
};

type StringWithCharset = Comments & {
  type: "string_with_charset";
  charset: string;
  string: StringLiteral;
};

type StringLiteral = Comments & {
  type: "string";
  text: string;
};

type NumberLiteral = Comments & {
  type: "number";
  text: string;
};

type BoolLiteral = Comments & {
  type: "bool";
  text: string;
};

type NullLiteral = Comments & {
  type: "null";
  text: string;
};

type DateTimeLiteral = Comments & {
  type: "datetime";
  kw: Keyword;
  string: StringLiteral;
};

type ColumnRef = Comments & {
  type: "column_ref";
  table?: Identifier;
  column: Identifier | AllColumns;
};

type TableRef = Comments & {
  type: "table_ref";
  db?: Identifier;
  table: Identifier;
};

type Identifier = Comments & {
  type: "identifier";
  text: string;
};

type Keyword = Comments & {
  type: "keyword";
  text: string;
};

export function parse(str: string): Ast;
