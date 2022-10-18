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
  Whitespace,
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
} from "../pegjs/sql";
import { isDefined } from "./util";

type NodeArray = (Node | NodeArray | string | undefined)[];

export function show(
  node: Node | NodeArray | string,
  joinString: string = " "
): string {
  if (typeof node === "string") {
    return node;
  }
  if (node instanceof Array) {
    return node
      .filter(isDefined)
      .map((n) => show(n))
      .join(joinString);
  }

  return [
    showWhitespace(node.leadingComments),
    showNode(node),
    showWhitespace(node.trailingComments),
  ]
    .filter(isDefined)
    .join(" ");
}

function showNode(node: Node): string {
  switch (node.type) {
    case "empty_statement":
      return showEmptyStatement(node);
    case "select_statement":
      return showSelectStatement(node);
    case "with_clause":
      return showWithClause(node);
    case "common_table_expression":
      return showCommonTableExpression(node);
    case "select_clause":
      return showSelectClause(node);
    case "from_clause":
      return showFromClause(node);
    case "where_clause":
      return showWhereClause(node);
    case "group_by_clause":
      return showGroupByClause(node);
    case "having_clause":
      return showHavingClause(node);
    case "order_by_clause":
      return showOrderByClause(node);
    case "join":
      return showJoin(node);
    case "join_specification":
      return showJoinSpecification(node);
    case "sort_specification":
      return showSortSpecification(node);
    case "create_table_statement":
      return showCreateTableStatement(node);
    case "column_definition":
      return showColumnDefinition(node);
    case "column_option_nullable":
    case "column_option_auto_increment":
    case "column_option_key":
      return showColumnOption(node);
    case "column_option_default":
      return showColumnOptionDefault(node);
    case "column_option_comment":
      return showColumnOptionComment(node);
    case "data_type":
      return showDataType(node);
    case "alias":
      return showAlias(node);
    case "all_columns":
      return showAllColumns(node);
    case "expr_list":
      return showExprList(node);
    case "paren_expr":
      return showParenExpr(node);
    case "binary_expr":
      return showBinaryExpr(node);
    case "unary_expr":
      return showUnaryExpr(node);
    case "between_expr":
      return showBetweenExpr(node);
    case "string":
      return showLiteral(node);
    case "number":
      return showLiteral(node);
    case "bool":
      return showLiteral(node);
    case "null":
      return showLiteral(node);
    case "datetime":
      return showDateTimeLiteral(node);
    case "keyword":
      return showKeyword(node);
    case "string_with_charset":
      return showStringWithCharset(node);
    case "column_ref":
      return showColumnRef(node);
    case "table_ref":
      return showTableRef(node);
    case "identifier":
      return showIdentifier(node);
  }
}

const showWhitespace = (ws?: Whitespace[]): string | undefined => {
  if (!ws) {
    return undefined;
  }
  return ws.map(showWhitespaceItem).join(" ");
};

const showWhitespaceItem = (ws: Whitespace): string =>
  ws.type === "line_comment" ? ws.text + "\n" : ws.text;

const showEmptyStatement = (node: EmptyStatement) => "";

const showSelectStatement = (node: SelectStatement) => show(node.clauses);

const showWithClause = (node: WithClause) =>
  show([node.withKw, node.recursiveKw, show(node.tables, ", ")]);

const showCommonTableExpression = (node: CommonTableExpression) =>
  show([
    node.table,
    node.columns.length > 0 ? `(${show(node.columns, ", ")})` : undefined,
    node.asKw,
    node.optionKw,
    node.expr,
  ]);

const showSelectClause = (node: SelectClause) =>
  show([node.selectKw, node.options.length > 0 ? node.options : undefined]) +
  " " +
  show(node.columns, ", ");

const showFromClause = (node: FromClause) => {
  // first one is always a table reference expression, the rest are joins
  const [first, ...rest] = node.tables;
  return (
    show(node.fromKw) +
    " " +
    rest.reduce((str, join) => {
      if (join.type === "join" && join.operator === ",") {
        return str + show(join); // no space before comma
      } else {
        return str + " " + show(join);
      }
    }, show(first))
  );
};

const showJoin = (node: Join) =>
  show([node.operator, node.table, node.specification]);

const showJoinSpecification = (node: JoinSpecification) =>
  show([node.kw, node.expr]);

const showWhereClause = (node: WhereClause) => show([node.whereKw, node.expr]);

const showGroupByClause = (node: GroupByClause) =>
  show(node.groupByKw) + " " + show(node.columns, ", ");

const showHavingClause = (node: HavingClause) =>
  show([node.havingKw, node.expr]);

const showOrderByClause = (node: OrderByClause) =>
  show(node.orderByKw) + " " + show(node.specifications, ", ");

const showSortSpecification = (node: SortSpecification) =>
  show([node.expr, node.orderKw]);

const showCreateTableStatement = (node: CreateTableStatement) =>
  show([
    node.createKw,
    node.temporaryKw,
    node.tableKw,
    node.ifNotExistsKw,
    node.table,
    "(" + show(node.columns, ", ") + ")",
  ]);

const showColumnDefinition = (node: ColumnDefinition) =>
  show([
    node.name,
    node.dataType,
    node.options.length > 0 ? node.options : undefined,
  ]);

const showColumnOption = (
  node: ColumnOptionNullable | ColumnOptionAutoIncrement | ColumnOptionKey
) => show(node.kw);

const showColumnOptionDefault = (node: ColumnOptionDefault) =>
  show([node.kw, node.expr]);

const showColumnOptionComment = (node: ColumnOptionComment) =>
  show([node.kw, node.value]);

const showDataType = (node: DataType) =>
  show(node.nameKw) + (node.params ? "(" + show(node.params, ", ") + ")" : "");

const showAlias = (node: Alias) => show([node.expr, node.asKw, node.alias]);

const showAllColumns = (node: AllColumns) => "*";

const showLiteral = (
  node: StringLiteral | NumberLiteral | BoolLiteral | NullLiteral
) => node.text;

const showDateTimeLiteral = (node: DateTimeLiteral) =>
  show([node.kw, node.string]);

const showExprList = (node: ExprList) => show(node.children, ", ");

const showParenExpr = (node: ParenExpr) => "(" + show(node.expr) + ")";

const showBinaryExpr = (node: BinaryExpr) =>
  show([node.left, node.operator, node.right]);

const showUnaryExpr = (node: UnaryExpr) => {
  if (typeof node.operator === "string") {
    return show([node.operator, node.expr], "");
  } else {
    return show([node.operator, node.expr], " ");
  }
};

const showBetweenExpr = (node: BetweenExpr) =>
  show([node.left, node.betweenKw, node.begin, node.andKw, node.end]);

const showKeyword = (kw: Keyword) => kw.text;

const showStringWithCharset = (node: StringWithCharset) =>
  "_" + node.charset + " " + show(node.string);

const showColumnRef = (node: ColumnRef) => show([node.table, node.column], ".");

const showTableRef = (node: TableRef) => show([node.db, node.table], ".");

const showIdentifier = (node: Identifier) => node.text;
