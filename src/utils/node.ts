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
  ArrayDataType,
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

export function createStringConcatExprChain(
  head: BinaryExpr["left"],
  tail: [Whitespace[], BinaryExpr["right"]][]
): Expr {
  return tail.reduce(
    (left, [c1, right]) => deriveLoc(createBinaryExpr(left, c1, "", [], right)),
    head
  );
}

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

export function createJoinExprChain(
  head: JoinExpr["left"],
  tail: ((
    left: JoinExpr["left"]
  ) =>
    | JoinExpr
    | PivotExpr
    | UnpivotExpr
    | TablesampleExpr
    | ForSystemTimeAsOfExpr)[]
) {
  return tail.reduce((left, createNodeFn) => {
    const node = createNodeFn(left);
    switch (node.type) {
      case "join_expr":
        return deriveJoinLoc(node);
      case "pivot_expr":
        return derivePivotlikeLoc(node);
      case "unpivot_expr":
        return derivePivotlikeLoc(node);
      case "tablesample_expr":
        return derivePivotlikeLoc(node);
      case "for_system_time_as_of_expr":
        return deriveForSystemTimeLoc(node);
    }
  }, head);
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
    expr: surrounding(c1, expr, c2),
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

export function createArrayDataTypeChain(
  head: ArrayDataType["dataType"],
  tail: [Whitespace[], ArrayDataType["bounds"]][]
): ArrayDataType["dataType"] {
  return tail.reduce(
    (left, [c1, right]) =>
      deriveArrayDataTypeLoc(createArrayDataType(left, c1, right)),
    head
  );
}

const deriveArrayDataTypeLoc = (array: ArrayDataType): ArrayDataType => {
  if (!array.dataType.range || !array.bounds.range) {
    return array;
  }
  const start = array.dataType.range[0];
  const end = array.bounds.range[1];
  return { ...array, range: [start, end] };
};

function createArrayDataType(
  dataType: ArrayDataType["dataType"],
  c1: Whitespace[],
  bounds: ArrayDataType["bounds"]
): ArrayDataType {
  return {
    type: "array_data_type",
    dataType: trailing(dataType, c1) as ArrayDataType["dataType"],
    bounds: bounds,
  };
}
