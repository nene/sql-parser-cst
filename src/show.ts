import {
  Alias,
  BetweenExpr,
  BinaryExpr,
  BoolLiteral,
  ColumnRef,
  Comment,
  DateTimeLiteral,
  ExprList,
  Identifier,
  Keyword,
  Node,
  NullLiteral,
  NumberLiteral,
  ParenExpr,
  Select,
  StringLiteral,
  StringWithCharset,
  UnaryExpr,
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
    case "select":
      return showSelect(node);
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
    case "identifier":
      return showIdentifier(node);
  }
}

const showComments = (c?: Comment[]): string | undefined => {
  if (!c) {
    return undefined;
  }
  return c.map(showComment).join(" ");
};

const showComment = (c: Comment): string =>
  c.type === "line_comment" ? c.text + "\n" : c.text;

const showSelect = (node: Select) => "SELECT " + show(node.columns);

const showAlias = (node: Alias) => {
  return node.kwAs
    ? `${show(node.expr)} ${show(node.kwAs)} ${show(node.alias)}`
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
  return show(node.operator) + " " + show(node.expr);
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

const showIdentifier = (node: Identifier) => node.text;
