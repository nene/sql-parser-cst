import {
  Alias,
  AllColumns,
  BetweenExpr,
  BinaryExpr,
  BoolLiteral,
  ColumnDefinition,
  ColumnOptionAutoIncrement,
  ColumnOptionComment,
  ColumnOptionDefault,
  ColumnOptionKey,
  ColumnOptionNullable,
  ColumnRef,
  CommonTableExpression,
  CreateTableStatement,
  DataType,
  DateTimeLiteral,
  EmptyStatement,
  ExprList,
  FromClause,
  GroupByClause,
  HavingClause,
  Identifier,
  Join,
  JoinSpecification,
  Keyword,
  Node,
  NullLiteral,
  NumberLiteral,
  OrderByClause,
  ParenExpr,
  SelectClause,
  SelectStatement,
  SortSpecification,
  StringLiteral,
  StringWithCharset,
  TableRef,
  UnaryExpr,
  WhereClause,
  WithClause,
  LimitClause,
} from "../pegjs/sql";

type TransformMap<T> = {
  empty_statement: TransformFn<EmptyStatement, T>;
  select_statement: TransformFn<SelectStatement, T>;
  with_clause: TransformFn<WithClause, T>;
  common_table_expression: TransformFn<CommonTableExpression, T>;
  select_clause: TransformFn<SelectClause, T>;
  from_clause: TransformFn<FromClause, T>;
  where_clause: TransformFn<WhereClause, T>;
  group_by_clause: TransformFn<GroupByClause, T>;
  having_clause: TransformFn<HavingClause, T>;
  order_by_clause: TransformFn<OrderByClause, T>;
  limit_clause: TransformFn<LimitClause, T>;
  join: TransformFn<Join, T>;
  join_specification: TransformFn<JoinSpecification, T>;
  sort_specification: TransformFn<SortSpecification, T>;
  create_table_statement: TransformFn<CreateTableStatement, T>;
  column_definition: TransformFn<ColumnDefinition, T>;
  column_option_nullable: TransformFn<ColumnOptionNullable, T>;
  column_option_auto_increment: TransformFn<ColumnOptionAutoIncrement, T>;
  column_option_key: TransformFn<ColumnOptionKey, T>;
  column_option_default: TransformFn<ColumnOptionDefault, T>;
  column_option_comment: TransformFn<ColumnOptionComment, T>;
  data_type: TransformFn<DataType, T>;
  alias: TransformFn<Alias, T>;
  all_columns: TransformFn<AllColumns, T>;
  expr_list: TransformFn<ExprList, T>;
  paren_expr: TransformFn<ParenExpr, T>;
  binary_expr: TransformFn<BinaryExpr, T>;
  unary_expr: TransformFn<UnaryExpr, T>;
  between_expr: TransformFn<BetweenExpr, T>;
  string: TransformFn<StringLiteral, T>;
  number: TransformFn<NumberLiteral, T>;
  bool: TransformFn<BoolLiteral, T>;
  null: TransformFn<NullLiteral, T>;
  datetime: TransformFn<DateTimeLiteral, T>;
  keyword: TransformFn<Keyword, T>;
  string_with_charset: TransformFn<StringWithCharset, T>;
  column_ref: TransformFn<ColumnRef, T>;
  table_ref: TransformFn<TableRef, T>;
  identifier: TransformFn<Identifier, T>;
};

type TransformFn<TNode, T> = (node: TNode) => T;

/**
 * Creates a function that transforms the whole syntax tree to data type T.
 * @param map An object with a transform function for each CST node type
 */
export function cstTransformer<T>(map: TransformMap<T>): (node: Node) => T {
  return (node: Node) => {
    // Don't know how to type this :(
    return map[node.type](node as any);
  };
}
