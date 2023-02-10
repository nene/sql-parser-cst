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
  PivotExpr,
  UnpivotExpr,
  TablesampleExpr,
  FuncCall,
  ForSystemTimeAsOfExpr,
} from "../cst/Node";
import { leading, surrounding, trailing } from "./whitespace";
import { readCommaSepList } from "./list";
import { isObject } from "./generic";

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

const derivePivotlikeLoc = <T extends { left: Node; args: Node }>(
  pivot: T
): T => {
  if (!pivot.left.range || !pivot.args.range) {
    return pivot;
  }
  const start = pivot.left.range[0];
  const end = pivot.args.range[1];
  return { ...pivot, range: [start, end] };
};

const deriveForSystemTimeLoc = (
  expr: ForSystemTimeAsOfExpr
): ForSystemTimeAsOfExpr => {
  if (!expr.left.range || !expr.expr.range) {
    return expr;
  }
  const start = expr.left.range[0];
  const end = expr.expr.range[1];
  return { ...expr, range: [start, end] };
};

interface JoinExprRight {
  type: "join_expr_right";
  operator: JoinExpr["operator"];
  right: JoinExpr["right"];
  specification: JoinExpr["specification"];
}

interface PivotExprRight {
  type: "pivot_expr_right";
  pivotKw: PivotExpr["pivotKw"];
  args: PivotExpr["args"];
}

interface UnpivotExprRight {
  type: "unpivot_expr_right";
  unpivotKw: UnpivotExpr["unpivotKw"];
  nullHandlingKw: UnpivotExpr["nullHandlingKw"];
  args: UnpivotExpr["args"];
}

interface TablesampleExprRight {
  type: "tablesample_expr_right";
  tablesampleKw: TablesampleExpr["tablesampleKw"];
  args: TablesampleExpr["args"];
}

interface ForSystemTimeAsOfExprRight {
  type: "for_system_time_as_of_expr_right";
  forSystemTimeAsOfKw: ForSystemTimeAsOfExpr["forSystemTimeAsOfKw"];
  expr: ForSystemTimeAsOfExpr["expr"];
}

export function createJoinExprChain(
  head: JoinExpr["left"],
  tail: [
    Whitespace[],
    (
      | JoinExprRight
      | PivotExprRight
      | UnpivotExprRight
      | TablesampleExprRight
      | ForSystemTimeAsOfExprRight
    )
  ][]
) {
  return tail.reduce((left, [c1, right]) => {
    switch (right.type) {
      case "join_expr_right":
        return deriveJoinLoc(createJoinExpr(left, c1, right));
      case "pivot_expr_right":
        return derivePivotlikeLoc(createPivotExpr(left, c1, right));
      case "unpivot_expr_right":
        return derivePivotlikeLoc(createUnpivotExpr(left, c1, right));
      case "tablesample_expr_right":
        return derivePivotlikeLoc(createTablesampleExpr(left, c1, right));
      case "for_system_time_as_of_expr_right":
        return deriveForSystemTimeLoc(
          createForSystemTimeAsOfExpr(left, c1, right)
        );
    }
  }, head);
}

function createJoinExpr(
  left: JoinExpr["left"],
  c1: Whitespace[],
  right: JoinExprRight
): JoinExpr {
  return {
    type: "join_expr",
    left: trailing(left, c1) as JoinExpr["left"],
    operator: right.operator,
    right: right.right,
    specification: right.specification,
  };
}

function createPivotExpr(
  left: PivotExpr["left"],
  c1: Whitespace[],
  right: PivotExprRight
): PivotExpr {
  return {
    type: "pivot_expr",
    left: trailing(left, c1) as PivotExpr["left"],
    pivotKw: right.pivotKw,
    args: right.args,
  };
}

function createUnpivotExpr(
  left: UnpivotExpr["left"],
  c1: Whitespace[],
  right: UnpivotExprRight
): UnpivotExpr {
  return {
    type: "unpivot_expr",
    left: trailing(left, c1) as UnpivotExpr["left"],
    unpivotKw: right.unpivotKw,
    nullHandlingKw: right.nullHandlingKw,
    args: right.args,
  };
}

function createTablesampleExpr(
  left: TablesampleExpr["left"],
  c1: Whitespace[],
  right: TablesampleExprRight
): TablesampleExpr {
  return {
    type: "tablesample_expr",
    left: trailing(left, c1) as TablesampleExpr["left"],
    tablesampleKw: right.tablesampleKw,
    args: right.args,
  };
}

function createForSystemTimeAsOfExpr(
  left: ForSystemTimeAsOfExpr["left"],
  c1: Whitespace[],
  right: ForSystemTimeAsOfExprRight
): ForSystemTimeAsOfExpr {
  return {
    type: "for_system_time_as_of_expr",
    left: trailing(left, c1) as ForSystemTimeAsOfExpr["left"],
    forSystemTimeAsOfKw: right.forSystemTimeAsOfKw,
    expr: right.expr,
  };
}

interface FuncCallRight {
  type: "func_call_right";
  args: FuncCall["args"];
  filter: FuncCall["filter"];
  over: FuncCall["over"];
}
type FuncCallTailPart = [Whitespace[], FuncCallRight];

type ArrayMemberExprTailPart = [Whitespace[], MemberExpr["property"]];
type ObjectMemberExprTailPart = [
  Whitespace[],
  ".",
  Whitespace[],
  MemberExpr["property"]
];
type MemberExprTailPart = ArrayMemberExprTailPart | ObjectMemberExprTailPart;

function isObjectMemberExprTailPart(
  part: MemberExprTailPart | FuncCallTailPart
): part is ObjectMemberExprTailPart {
  return part[1] === ".";
}

function isFuncCallMemberExprTailPart(
  part: MemberExprTailPart | FuncCallTailPart
): part is FuncCallTailPart {
  return isObject(part[1]) && part[1].type === "func_call_right";
}

export function createMemberExprChain(
  head: MemberExpr["object"],
  tail: (MemberExprTailPart | FuncCallTailPart)[]
): Expr {
  return tail.reduce((obj, tailPart) => {
    if (isFuncCallMemberExprTailPart(tailPart)) {
      return deriveFuncCallLoc(
        createFuncCall(obj as FuncCall["name"], tailPart)
      );
    } else {
      return deriveMemberExprLoc(createMemberExpr(obj, tailPart));
    }
  }, head);
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

export function createFuncCall(
  name: FuncCall["name"],
  [c1, fn]: FuncCallTailPart
): FuncCall {
  return {
    type: "func_call",
    name: trailing(name, c1) as FuncCall["name"],
    args: fn.args,
    filter: fn.filter,
    over: fn.over,
  };
}

const deriveMemberExprLoc = (expr: MemberExpr): MemberExpr => {
  if (!expr.object.range || !expr.property.range) {
    return expr;
  }
  const start = expr.object.range[0];
  const end = expr.property.range[1];
  return { ...expr, range: [start, end] };
};

const deriveFuncCallLoc = (fn: FuncCall): FuncCall => {
  const right = fn.over || fn.filter || fn.args;
  if (!right) {
    throw new Error("Unexpected argument-less function call.");
  }
  if (!fn.name.range || !right.range) {
    return fn;
  }
  const start = fn.name.range[0];
  const end = right.range[1];
  return { ...fn, range: [start, end] };
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
