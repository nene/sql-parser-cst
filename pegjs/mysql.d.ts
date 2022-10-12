type Ast = Statement;

type Comments = {
  leadingComments?: Comment[];
  trailingComments?: Comment[];
};

type Comment = {
  type: "block_comment" | "line_comment";
  text: string;
};

type Node = Statement | Clause | Expr | Keyword;

type Statement = SelectStatement;

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

type SelectStatement = Comments & {
  type: "select_statement";
  select: SelectClause;
  from?: FromClause;
};

type Clause = SelectClause | FromClause;

type SelectClause = Comments & {
  type: "select_clause";
  selectKw: Keyword;
  columns: Expr[];
};

type FromClause = Comments & {
  type: "from_clause";
  kwFrom: Keyword;
  tables: Expr[];
};

type Alias = Comments & {
  type: "alias";
  expr: Expr;
  kwAs?: Keyword;
  alias: Identifier;
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
  column: Identifier;
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
