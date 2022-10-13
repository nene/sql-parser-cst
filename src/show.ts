import {
  Alias,
  BetweenExpr,
  BinaryExpr,
  BoolLiteral,
  ColumnRef,
  Comment,
  DateTimeLiteral,
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
} from "pegjs/mysql";
import { isDefined } from "./util";

export function show(node: Node | Node[] | string): string {
  if (typeof node === "string") {
    return node;
  }
  if (node instanceof Array) {
    return node.map(show).join(" ");
  }

  return [
    showComments(node.leadingComments),
    showNode(node),
    showComments(node.trailingComments),
  ]
    .filter(isDefined)
    .join(" ");
}

function showNode(node: Node): string {
  switch (node.type) {
    case "select_statement":
      return showSelectStatement(node);
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
    case "alias":
      return showAlias(node);
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

const showAll = (
  nodes: (Node | Node[] | string | undefined)[],
  joinString: string = " "
) => nodes.filter(isDefined).map(show).join(joinString);

const showComments = (c?: Comment[]): string | undefined => {
  if (!c) {
    return undefined;
  }
  return c.map(showComment).join(" ");
};

const showComment = (c: Comment): string =>
  c.type === "line_comment" ? c.text + "\n" : c.text;

const showSelectStatement = (node: SelectStatement) =>
  showAll([
    node.select,
    node.from,
    node.where,
    node.groupBy,
    node.having,
    node.orderBy,
  ]);

const showSelectClause = (node: SelectClause) =>
  show(node.selectKw) + " " + showAll(node.columns, ", ");

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
  showAll([node.operator, node.table, node.specification]);

const showJoinSpecification = (node: JoinSpecification) =>
  showAll([node.kw, node.expr]);

const showWhereClause = (node: WhereClause) =>
  showAll([node.whereKw, node.expr]);

const showGroupByClause = (node: GroupByClause) =>
  show(node.groupByKw) + " " + showAll(node.columns, ", ");

const showHavingClause = (node: HavingClause) =>
  showAll([node.havingKw, node.expr]);

const showOrderByClause = (node: OrderByClause) =>
  show(node.orderByKw) + " " + showAll(node.specifications, ", ");

const showSortSpecification = (node: SortSpecification) =>
  showAll([node.expr, node.orderKw]);

const showAlias = (node: Alias) => showAll([node.expr, node.asKw, node.alias]);

const showLiteral = (
  node: StringLiteral | NumberLiteral | BoolLiteral | NullLiteral
) => node.text;

const showDateTimeLiteral = (node: DateTimeLiteral) =>
  showAll([node.kw, node.string]);

const showExprList = (node: ExprList) => showAll(node.children, ", ");

const showParenExpr = (node: ParenExpr) => "(" + show(node.expr) + ")";

const showBinaryExpr = (node: BinaryExpr) =>
  showAll([node.left, node.operator, node.right]);

const showUnaryExpr = (node: UnaryExpr) => {
  if (typeof node.operator === "string") {
    return showAll([node.operator, node.expr], "");
  } else {
    return showAll([node.operator, node.expr], " ");
  }
};

const showBetweenExpr = (node: BetweenExpr) =>
  showAll([node.left, node.betweenKw, node.begin, node.andKw, node.end]);

const showKeyword = (kw: Keyword) => kw.text;

const showStringWithCharset = (node: StringWithCharset) =>
  node.charset + " " + show(node.string);

const showColumnRef = (node: ColumnRef) =>
  showAll([node.table, node.column], ".");

const showTableRef = (node: TableRef) => showAll([node.db, node.table], ".");

const showIdentifier = (node: Identifier) => node.text;
