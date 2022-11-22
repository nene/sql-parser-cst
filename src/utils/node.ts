import {
  Alias,
  BinaryExpr,
  CompoundSelectStmt,
  Expr,
  ListExpr,
  Identifier,
  JoinExpr,
  Keyword,
  Node,
  ParenExpr,
  PostfixOpExpr,
  PrefixOpExpr,
  SubSelect,
  Whitespace,
  MemberExpr,
} from "../cst/Node";
import { leading, surrounding, trailing } from "./whitespace";
import { read } from "./read";
import { readCommaSepList } from "./list";

//
// Helper functions for creating various types of Node objects
//

const deriveLoc = <T extends { left: Node; right: Node }>(binExpr: T): T => {
  if (!binExpr.left.range || !binExpr.right.range) {
    return binExpr;
  }
  const start = binExpr.left.range[0];
  const end = binExpr.right.range[1];
  return { ...binExpr, range: [start, end] };
};

export function createBinaryExprChain(
  head: BinaryExpr["left"],
  tail: [
    Whitespace[],
    BinaryExpr["operator"],
    Whitespace[],
    BinaryExpr["right"]
  ][]
): Expr {
  return tail.reduce(
    (left, [c1, op, c2, right]) =>
      deriveLoc(createBinaryExpr(left, c1, op, c2, right)),
    head
  );
}

export function createBinaryExpr(
  left: BinaryExpr["left"],
  c1: Whitespace[],
  op: BinaryExpr["operator"],
  c2: Whitespace[],
  right: BinaryExpr["right"]
): BinaryExpr {
  return {
    type: "binary_expr",
    operator: op,
    left: trailing(left, c1) as BinaryExpr["left"],
    right: leading(right, c2) as BinaryExpr["right"],
  };
}

export function createCompoundSelectStmtChain(
  head: CompoundSelectStmt["left"],
  tail: [
    Whitespace[],
    CompoundSelectStmt["operator"],
    Whitespace[],
    CompoundSelectStmt["right"]
  ][]
): SubSelect {
  return tail.reduce(
    (left, [c1, op, c2, right]) =>
      deriveLoc(createCompoundSelectStmt(left, c1, op, c2, right)),
    head
  );
}

export function createCompoundSelectStmt(
  left: CompoundSelectStmt["left"],
  c1: Whitespace[],
  op: CompoundSelectStmt["operator"],
  c2: Whitespace[],
  right: CompoundSelectStmt["right"]
): CompoundSelectStmt {
  return {
    type: "compound_select_stmt",
    operator: op,
    left: trailing(left, c1) as CompoundSelectStmt["left"],
    right: leading(right, c2) as CompoundSelectStmt["right"],
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
  head: JoinExpr["left"],
  tail: [
    Whitespace[],
    JoinExpr["operator"],
    Whitespace[],
    JoinExpr["right"],
    JoinExpr["specification"] | null
  ][]
) {
  return tail.reduce(
    (left, [c1, op, c2, right, spec]) =>
      deriveJoinLoc(createJoinExpr(left, c1, op, c2, right, spec)),
    head
  );
}

function createJoinExpr(
  left: JoinExpr["left"],
  c1: Whitespace[],
  op: JoinExpr["operator"],
  c2: Whitespace[],
  right: JoinExpr["right"],
  spec: JoinExpr["specification"] | null
): JoinExpr {
  return {
    type: "join_expr",
    left: trailing(left, c1) as JoinExpr["left"],
    operator: op,
    right: leading(right, c2) as JoinExpr["right"],
    specification: read(spec),
  };
}

type ArrayMemberExprTailPart = [Whitespace[], MemberExpr["property"]];
type ObjectMemberExprTailPart = [
  Whitespace[],
  ".",
  Whitespace[],
  MemberExpr["property"]
];
type MemberExprTailPart = ArrayMemberExprTailPart | ObjectMemberExprTailPart;

function isObjectMemberExprTailPart(
  part: MemberExprTailPart
): part is ObjectMemberExprTailPart {
  return part[1] === ".";
}

export function createMemberExprChain(
  head: MemberExpr["object"],
  tail: MemberExprTailPart[]
): Expr {
  return tail.reduce(
    (obj, tailPart) => deriveMemberExprLoc(createMemberExpr(obj, tailPart)),
    head
  );
}

function createMemberExpr(
  obj: MemberExpr["object"],
  tailPart: MemberExprTailPart
): MemberExpr {
  if (isObjectMemberExprTailPart(tailPart)) {
    const [c1, _, c2, prop] = tailPart;
    return {
      type: "member_expr",
      object: trailing(obj, c1) as MemberExpr["object"],
      property: leading(prop, c2) as MemberExpr["property"],
    };
  } else {
    const [c1, prop] = tailPart;
    return {
      type: "member_expr",
      object: obj,
      property: leading(prop, c1) as MemberExpr["property"],
    };
  }
}

const deriveMemberExprLoc = (expr: MemberExpr): MemberExpr => {
  if (!expr.object.range || !expr.property.range) {
    return expr;
  }
  const start = expr.object.range[0];
  const end = expr.property.range[1];
  return { ...expr, range: [start, end] };
};

export function createPrefixOpExpr(
  op: PrefixOpExpr["operator"],
  expr: Expr
): PrefixOpExpr {
  return {
    type: "prefix_op_expr",
    operator: op,
    expr: expr,
  };
}

export function createPostfixOpExpr(
  op: PostfixOpExpr["operator"],
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
  name: text.toUpperCase(),
});

export const createIdentifier = (text: string, name: string): Identifier => ({
  type: "identifier",
  text,
  name,
});

interface PartialAlias {
  asKw?: Keyword<"AS">;
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

export const createListExpr = <T extends Node>(
  head: T,
  tail: [Whitespace[], string, Whitespace[], T][]
): ListExpr<T> => {
  return {
    type: "list_expr",
    items: readCommaSepList(head, tail),
  };
};
