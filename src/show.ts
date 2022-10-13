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
  Identifier,
  Join,
  JoinSpecification,
  Keyword,
  Node,
  NullLiteral,
  NumberLiteral,
  ParenExpr,
  SelectClause,
  SelectStatement,
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
    case "join":
      return showJoin(node);
    case "join_specification":
      return showJoinSpecification(node);
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
  // Theoretically unreachable,
  // but in practice the pegjs-generated parser code is not type-safe,
  // so we can end up here as a result of a simple typo.
  // throw new Error(
  //   `Unexpected node type: ${(node as any).type} ${JSON.stringify(node)}`
  // );
}

const showComments = (c?: Comment[]): string | undefined => {
  if (!c) {
    return undefined;
  }
  return c.map(showComment).join(" ");
};

const showComment = (c: Comment): string =>
  c.type === "line_comment" ? c.text + "\n" : c.text;

const showSelectStatement = (node: SelectStatement) =>
  [node.select, node.from, node.where, node.groupBy]
    .filter(isDefined)
    .map(show)
    .join(" ");

const showSelectClause = (node: SelectClause) =>
  show(node.selectKw) + " " + node.columns.map(show).join(", ");

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

const showJoin = (node: Join) => {
  const spec = node.specification ? " " + show(node.specification) : "";
  return show(node.operator) + " " + show(node.table) + spec;
};

const showJoinSpecification = (node: JoinSpecification) =>
  show(node.kw) + " " + show(node.expr);

const showWhereClause = (node: WhereClause) =>
  show(node.whereKw) + " " + show(node.expr);

const showGroupByClause = (node: GroupByClause) =>
  show(node.groupByKw) + " " + node.columns.map(show).join(", ");

const showAlias = (node: Alias) => {
  return node.asKw
    ? `${show(node.expr)} ${show(node.asKw)} ${show(node.alias)}`
    : `${show(node.expr)} ${show(node.alias)}`;
};

const showLiteral = (
  node: StringLiteral | NumberLiteral | BoolLiteral | NullLiteral
) => node.text;

const showDateTimeLiteral = (node: DateTimeLiteral) =>
  show(node.kw) + " " + show(node.string);

const showExprList = (node: ExprList) => node.children.map(show).join(", ");

const showParenExpr = (node: ParenExpr) => "(" + show(node.expr) + ")";

const showBinaryExpr = (node: BinaryExpr) => {
  return show(node.left) + " " + show(node.operator) + " " + show(node.right);
};

const showUnaryExpr = (node: UnaryExpr) => {
  if (typeof node.operator === "string") {
    return show(node.operator) + show(node.expr);
  } else {
    return show(node.operator) + " " + show(node.expr);
  }
};

const showBetweenExpr = (node: BetweenExpr) => {
  return [
    show(node.left),
    show(node.betweenKw),
    show(node.begin),
    show(node.andKw),
    show(node.end),
  ].join(" ");
};

const showKeyword = (kw: Keyword) => kw.text;

const showStringWithCharset = (node: StringWithCharset) =>
  node.charset + " " + show(node.string);

const showColumnRef = (node: ColumnRef) =>
  node.table ? show(node.table) + "." + show(node.column) : show(node.column);

const showTableRef = (node: TableRef) =>
  node.db ? show(node.db) + "." + show(node.table) : show(node.table);

const showIdentifier = (node: Identifier) => node.text;
