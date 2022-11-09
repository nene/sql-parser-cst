import { DialectName } from "./ParserOptions";
import { __RESERVED_KEYWORDS__ as mysqlKeywords } from "./keywords/mysql.keywords";
import { __RESERVED_KEYWORDS__ as sqliteKeywords } from "./keywords/sqlite.keywords";
import {
  Alias,
  BinaryExpr,
  CompoundSelectStmt,
  Expr,
  ExprList,
  Identifier,
  JoinExpr,
  JoinOnSpecification,
  JoinUsingSpecification,
  Keyword,
  Node,
  ParenExpr,
  PostfixOpExpr,
  PrefixOpExpr,
  SubSelect,
  TableOrSubquery,
  Whitespace,
} from "./sql";
import { leading, surrounding, trailing } from "./utils/whitespace";
import { read } from "./utils/read";
import { getDialect, getOptions, getRange } from "./utils/parserState";

/** Identity function */
export const identity = <T>(x: T): T => x;

const deriveLoc = <T extends { left: Node; right: Node }>(binExpr: T): T => {
  if (!binExpr.left.range || !binExpr.right.range) {
    return binExpr;
  }
  const start = binExpr.left.range[0];
  const end = binExpr.right.range[1];
  return { ...binExpr, range: [start, end] };
};

export function createBinaryExprChain(
  head: Expr,
  tail: [Whitespace[], string | Keyword | Keyword[], Whitespace[], Expr][]
): Expr {
  return tail.reduce(
    (left, [c1, op, c2, right]) =>
      deriveLoc(createBinaryExpr(left, c1, op, c2, right)),
    head
  );
}

export function createBinaryExpr(
  left: Expr,
  c1: Whitespace[],
  op: string | Keyword | Keyword[],
  c2: Whitespace[],
  right: Expr
): BinaryExpr {
  return {
    type: "binary_expr",
    operator: op,
    left: trailing(left, c1) as Expr,
    right: leading(right, c2) as Expr,
  };
}

export function createCompoundSelectStmtChain(
  head: SubSelect,
  tail: [Whitespace[], string | Keyword | Keyword[], Whitespace[], SubSelect][]
): SubSelect {
  return tail.reduce(
    (left, [c1, op, c2, right]) =>
      deriveLoc(createCompoundSelectStmt(left, c1, op, c2, right)),
    head
  );
}

export function createCompoundSelectStmt(
  left: SubSelect,
  c1: Whitespace[],
  op: string | Keyword | Keyword[],
  c2: Whitespace[],
  right: SubSelect
): CompoundSelectStmt {
  return {
    type: "compound_select_stmt",
    operator: op as Keyword | Keyword[],
    left: trailing(left, c1) as SubSelect,
    right: leading(right, c2) as SubSelect,
  };
}

const deriveJoinLoc = (join: JoinExpr): JoinExpr => {
  if (!join.left.range) {
    return join;
  }
  const start = join.left.range[0];
  const end = (join.specification || join.right)?.range?.[1] as number;
  return { ...join, range: [start, end] };
};

export function createJoinExprChain(
  head: JoinExpr | TableOrSubquery,
  tail: [
    Whitespace[],
    Keyword[],
    Whitespace[],
    TableOrSubquery,
    JoinOnSpecification | JoinUsingSpecification | null
  ][]
) {
  return tail.reduce(
    (left, [c1, op, c2, right, spec]) =>
      deriveJoinLoc(createJoinExpr(left, c1, op, c2, right, spec)),
    head
  );
}

function createJoinExpr(
  left: JoinExpr | TableOrSubquery,
  c1: Whitespace[],
  op: Keyword[],
  c2: Whitespace[],
  right: TableOrSubquery,
  spec: JoinOnSpecification | JoinUsingSpecification | null
): JoinExpr {
  return {
    type: "join_expr",
    left: trailing(left, c1) as JoinExpr | TableOrSubquery,
    operator: op,
    right: leading(right, c2) as TableOrSubquery,
    specification: read(spec),
  };
}

export function createPrefixOpExpr(
  op: string | Keyword[],
  expr: Expr
): PrefixOpExpr {
  return {
    type: "prefix_op_expr",
    operator: op,
    expr: expr,
  };
}

export function createPostfixOpExpr(
  op: string | Keyword[],
  expr: Expr
): PostfixOpExpr {
  return {
    type: "postfix_op_expr",
    expr: expr,
    operator: op,
  };
}

export const createKeyword = (text: string): Keyword => ({
  type: "keyword",
  text,
});

export const readCommaSepList = <T extends Node>(
  head: T,
  tail: [Whitespace[], string, Whitespace[], T][]
): T[] => {
  const items = [head];
  for (const [c1, comma, c2, expr] of tail) {
    const lastIdx = items.length - 1;
    items[lastIdx] = trailing(items[lastIdx], c1) as T;
    items.push(leading(expr, c2) as T);
  }
  return items;
};

export const readSpaceSepList = <T extends Node>(
  head: T,
  tail: [Whitespace[], T][]
): T[] => {
  const items = [head];
  for (const [c, expr] of tail) {
    items.push(leading(expr, c) as T);
  }
  return items;
};

export const createIdentifier = (text: string): Identifier => ({
  type: "identifier",
  text,
});

interface PartialAlias {
  asKw?: Keyword;
  alias: Identifier;
}

export const createAlias = <T extends Node>(
  expr: T,
  _alias: [Whitespace[], PartialAlias] | null
): Alias<T> | T => {
  if (!_alias) {
    return expr;
  }
  const [c, partialAlias] = _alias;
  return {
    type: "alias",
    expr: trailing(expr, c) as T,
    ...partialAlias,
  };
};

export const createParenExpr = (
  c1: Whitespace[],
  expr: Expr,
  c2: Whitespace[]
): ParenExpr => {
  return {
    type: "paren_expr",
    expr: surrounding(c1, expr, c2) as Expr,
  };
};

export const createExprList = <T extends Node>(
  head: T,
  tail: [Whitespace[], string, Whitespace[], T][]
): ExprList<T> => {
  return {
    type: "expr_list",
    items: readCommaSepList(head, tail),
  };
};

export const loc = (node: Node): Node => {
  if (!getOptions().includeRange) {
    return node;
  }
  return { ...node, range: getRange() };
};

const keywordMap: Record<DialectName, Record<string, boolean>> = {
  mysql: mysqlKeywords,
  sqlite: sqliteKeywords,
};

export const isReservedKeyword = (name: string) => {
  return keywordMap[getDialect()][name.toUpperCase()];
};
