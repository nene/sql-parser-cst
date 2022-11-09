/** Identity function */
export const identity = (x: any) => x;

/** Last item in array */
const last = (arr: any) => arr[arr.length - 1];

/** Creates new array with first item replaced by value */
const setFirst = ([oldFirst, ...rest]: any, value: any) => {
  return [value, ...rest];
};

/** Creates new array with last item replaced by value */
const setLast = (array: any, value: any) => {
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

const deriveLoc = (binExpr: any) => {
  if (!binExpr.left.range) {
    return binExpr;
  }
  const start = binExpr.left.range[0];
  const end = binExpr.right.range[1];
  return { ...binExpr, range: [start, end] };
};

export function createBinaryExprChain(
  head: any,
  tail: any,
  type: any = "binary_expr"
) {
  return tail.reduce(
    (left: any, [c1, op, c2, right]: any[]) =>
      deriveLoc(createBinaryExpr(left, c1, op, c2, right, type)),
    head
  );
}

export function createBinaryExpr(
  left: any,
  c1: any,
  op: any,
  c2: any,
  right: any,
  type: any = "binary_expr"
) {
  return {
    type,
    operator: op,
    left: trailing(left, c1),
    right: leading(right, c2),
  };
}

const deriveJoinLoc = (join: any) => {
  if (!join.left.range) {
    return join;
  }
  const start = join.left.range[0];
  const end = (join.spec || join.right).range[1];
  return { ...join, range: [start, end] };
};

export function createJoinExprChain(head: any, tail: any) {
  return tail.reduce(
    (left: any, [c1, op, c2, right, spec]: any[]) =>
      deriveJoinLoc(createJoinExpr(left, c1, op, c2, right, spec)),
    head
  );
}

function createJoinExpr(
  left: any,
  c1: any,
  op: any,
  c2: any,
  right: any,
  spec: any
) {
  return {
    type: "join_expr",
    left: trailing(left, c1),
    operator: op,
    right: leading(right, c2),
    specification: read(spec),
  };
}

export function createPrefixOpExpr(op: any, expr: any) {
  return {
    type: "prefix_op_expr",
    operator: op,
    expr: expr,
  };
}

export function createPostfixOpExpr(op: any, expr: any) {
  return {
    type: "postfix_op_expr",
    expr: expr,
    operator: op,
  };
}

export const createKeyword = (text: any) => ({ type: "keyword", text });

const whitespaceType: Record<string, boolean> = {
  space: true,
  newline: true,
  line_comment: true,
  block_comment: true,
};

// True when dealing with whitespace array (as returned by __ rule)
const isWhitespace = (item: any) => {
  if (!(item instanceof Array)) {
    return false;
  }
  if (item.length === 0) {
    return true;
  }
  return Boolean(whitespaceType[item[0].type as string]);
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

export const createIdentifier = (text: any) => ({ type: "identifier", text });

export const createAlias = (expr: any, _alias: any) => {
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

export const createParenExpr = (c1: any, expr: any, c2: any) => {
  return {
    type: "paren_expr",
    expr: surrounding(c1, expr, c2),
  };
};

export const createExprList = (head: any, tail: any) => {
  return {
    type: "expr_list",
    items: readCommaSepList(head, tail),
  };
};

export const hasParamType = (name: any, options: any) => {
  return options?.paramTypes?.includes(name);
};

const isEnabledWhitespace = (ws: any, options: any) =>
  (options?.preserveComments &&
    (ws.type === "line_comment" || ws.type === "block_comment")) ||
  (options?.preserveNewlines && ws.type === "newline") ||
  (options?.preserveSpaces && ws.type === "space");

export const filterEnabledWhitespace = (items: any, options: any) => {
  return items.filter((ws: any) => isEnabledWhitespace(ws, options));
};

let getRange: Function;

export const setRangeFunction = (fn: Function) => {
  getRange = fn;
};

let getOptions: Function;

export const setOptionsFunction = (fn: Function) => {
  getOptions = fn;
};

export const loc = (node: any) => {
  if (!getOptions()?.includeRange) {
    return node;
  }
  const { start, end } = getRange();
  return { ...node, range: [start, end] };
};
