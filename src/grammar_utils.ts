import { DialectName, ParamType, ParserOptions } from "./ParserOptions";
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

let getRange: () => [number, number];

/** Injects function to access source location range data */
export const setRangeFunction = (fn: () => [number, number]) => {
  getRange = fn;
};

let getOptions: () => ParserOptions;

/** Injects function to access options object */
export const setOptionsFunction = (fn: Function) => {
  getOptions = fn as () => ParserOptions;
};

/** Identity function */
export const identity = <T>(x: T): T => x;

/** Last item in array */
const last = <T>(arr: T[]): T => arr[arr.length - 1];

/** Creates new array with first item replaced by value */
const setFirst = <T>([_oldFirst, ...rest]: T[], value: T): T[] => {
  return [value, ...rest];
};

/** Creates new array with last item replaced by value */
const setLast = <T>(array: T[], value: T): T[] => {
  const rest = array.slice(0, -1);
  return [...rest, value];
};

/** Attaches optional leading whitespace to AST node, or to array of AST nodes (to the first in array) */
export const leading = (node: any, ws: any): any => {
  if (node instanceof Array) {
    // Add leading whitespace to first item in array
    return setFirst(node, leading(node[0], ws));
  }
  if (typeof node !== "object") {
    throw new Error(
      `Expected Node object, instead got ${JSON.stringify(node)}`
    );
  }
  if (ws && ws.length) {
    if (node.leading) {
      throw new Error("leading(): Node already has leading whitespace");
    }
    return { ...node, leading: ws };
  }
  return node;
};

/** Attaches optional trailing whitespace to AST node, or to array of AST nodes (to the last in array) */
export const trailing = (node: any, ws: any): any => {
  if (node instanceof Array) {
    // Add trailing whitespace to last item in array
    return setLast(node, trailing(last(node), ws));
  }
  if (typeof node !== "object") {
    throw new Error(
      `Expected Node object, instead got ${JSON.stringify(node)}`
    );
  }
  if (ws && ws.length) {
    if (node.trailing) {
      throw new Error("trailing(): Node already has trailing whitespace");
    }
    return { ...node, trailing: ws };
  }
  return node;
};

// Shorthand for attaching both trailing or leading whitespace
export const surrounding = (leadingWs: any, node: any, trailingWs: any) =>
  trailing(leading(node, leadingWs), trailingWs);

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
    left: trailing(left, c1),
    right: leading(right, c2),
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
    left: trailing(left, c1),
    right: leading(right, c2),
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
    JoinExpr | TableOrSubquery,
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
  right: JoinExpr | TableOrSubquery,
  spec: JoinOnSpecification | JoinUsingSpecification | null
): JoinExpr {
  return {
    type: "join_expr",
    left: trailing(left, c1),
    operator: op,
    right: leading(right, c2),
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

const whitespaceType: Record<string, boolean> = {
  space: true,
  newline: true,
  line_comment: true,
  block_comment: true,
};

// True when dealing with whitespace array (as returned by __ rule)
const isWhitespace = (
  item: Node[] | Whitespace[] | Node
): item is Whitespace[] => {
  if (!(item instanceof Array)) {
    return false;
  }
  if (item.length === 0) {
    return true;
  }
  return Boolean(whitespaceType[item[0].type]);
};

/**
 * Given array of syntax nodes and whitespace or single node or null,
 * associates whitespace with syntax nodes.
 *
 * @param {(Node | Whitespace)[] | Node | null} items
 * @return {Node[] | Node | undefined}
 */
export const read = (items: any) => {
  if (!items) {
    return undefined; // convert null to undefined
  }
  if (!(items instanceof Array)) {
    return items; // leave single syntax node as-is
  }

  // associate leading/trailing whitespace with nodes
  const nodes: any[] = [];
  let leadingWhitespace = undefined;
  for (const it of items) {
    if (isWhitespace(it)) {
      if (nodes.length > 0) {
        nodes[nodes.length - 1] = trailing(nodes[nodes.length - 1], it);
      } else {
        leadingWhitespace = it;
      }
    } else {
      if (leadingWhitespace) {
        nodes.push(leading(it, leadingWhitespace));
        leadingWhitespace = undefined;
      } else {
        nodes.push(it);
      }
    }
  }
  return nodes.length > 1 ? nodes : nodes[0];
};

export const readCommaSepList = (head: any, tail: any) => {
  const items = [head];
  for (const [c1, comma, c2, expr] of tail) {
    const lastIdx = items.length - 1;
    items[lastIdx] = trailing(items[lastIdx], c1);
    items.push(leading(expr, c2));
  }
  return items;
};

export const readSpaceSepList = (head: any, tail: any) => {
  const items = [head];
  for (const [c, expr] of tail) {
    items.push(leading(expr, c));
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

export const createAlias = <T = Node>(
  expr: T,
  _alias: [Whitespace[], PartialAlias] | null
): Alias<T> | T => {
  if (!_alias) {
    return expr;
  }
  const [c, partialAlias] = _alias;
  return {
    type: "alias",
    expr: trailing(expr, c),
    ...partialAlias,
  };
};

export const createParenExpr = (c1: any, expr: any, c2: any): ParenExpr => {
  return {
    type: "paren_expr",
    expr: surrounding(c1, expr, c2),
  };
};

export const createExprList = (head: any, tail: any): ExprList => {
  return {
    type: "expr_list",
    items: readCommaSepList(head, tail),
  };
};

export const hasParamType = (name: ParamType) => {
  return getOptions().paramTypes?.includes(name);
};

export const isEnabledWhitespace = (ws: Whitespace) =>
  (getOptions().preserveComments &&
    (ws.type === "line_comment" || ws.type === "block_comment")) ||
  (getOptions().preserveNewlines && ws.type === "newline") ||
  (getOptions().preserveSpaces && ws.type === "space");

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

const getDialect = (): DialectName => getOptions().dialect;

export const isSqlite = () => getDialect() === "sqlite";
export const isMysql = () => getDialect() === "mysql";
