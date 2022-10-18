type Ast = Statement[];

type BaseNode = {
  leading?: Whitespace[];
  trailing?: Whitespace[];
};

type Whitespace = {
  type: "block_comment" | "line_comment" | "newline" | "space";
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

type EmptyStatement = BaseNode & {
  type: "empty_statement";
  foo: number;
};

// SELECT

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
  | OrderByClause;

type WithClause = BaseNode & {
  type: "with_clause";
  withKw: Keyword;
  recursiveKw?: Keyword;
  tables: CommonTableExpression[];
};

type CommonTableExpression = BaseNode & {
  type: "common_table_expression";
  table: Identifier;
  columns: Identifier[];
  asKw: Keyword;
  optionKw?: Keyword[];
  expr: Expr;
};

type SelectClause = BaseNode & {
  type: "select_clause";
  selectKw: Keyword;
  options: Keyword[];
  columns: Expr[];
};

type FromClause = BaseNode & {
  type: "from_clause";
  fromKw: Keyword;
  tables: (Expr | Join)[];
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

type OrderByClause = BaseNode & {
  type: "order_by_clause";
  orderByKw: Keyword[];
  specifications: Expr[];
};

type Join = BaseNode & {
  type: "join";
  operator: Keyword[] | ",";
  table: Expr;
  specification?: JoinSpecification;
};

type JoinSpecification = BaseNode & {
  type: "join_specification";
  kw: Keyword;
  expr: Expr;
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
  columns: ColumnDefinition[];
};

type ColumnDefinition = BaseNode & {
  type: "column_definition";
  name: ColumnRef;
  dataType: DataType;
  options: ColumnOption[];
};

type DataType = BaseNode & {
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

type ColumnOptionNullable = BaseNode & {
  type: "column_option_nullable";
  kw: Keyword | Keyword[];
  value: boolean;
};

type ColumnOptionDefault = BaseNode & {
  type: "column_option_default";
  kw: Keyword;
  expr: Expr;
};

type ColumnOptionAutoIncrement = BaseNode & {
  type: "column_option_auto_increment";
  kw: Keyword;
};

type ColumnOptionKey = BaseNode & {
  type: "column_option_key";
  kw: Keyword | Keyword[];
};

type ColumnOptionComment = BaseNode & {
  type: "column_option_comment";
  kw: Keyword;
  value: StringLiteral;
};

// other...

type Alias = BaseNode & {
  type: "alias";
  expr: Expr;
  asKw?: Keyword;
  alias: Identifier;
};

type AllColumns = BaseNode & {
  type: "all_columns";
};

type ExprList = BaseNode & {
  type: "expr_list";
  children: Expr[];
};

type ParenExpr = BaseNode & {
  type: "paren_expr";
  expr: Expr;
};

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

type BetweenExpr = BaseNode & {
  type: "between_expr";
  left: Expr;
  betweenKw: Keyword[];
  begin: Expr;
  andKw: Keyword;
  end: Expr;
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
  db?: Identifier;
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
};

export function parse(str: string, options?: ParserOptions): Ast;
