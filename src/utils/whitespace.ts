import { BaseNode, Whitespace } from "../cst/Node";
import { isObject, last } from "./generic";

/** Attaches optional leading whitespace to AST node, or to array of AST nodes (to the first in array) */
export function leading<T extends BaseNode>(node: T, ws: Whitespace[]): T;
export function leading<T extends BaseNode>(node: T[], ws: Whitespace[]): T[];
export function leading<T extends BaseNode>(
  node: T | T[],
  ws: Whitespace[]
): T | T[] {
  if (node instanceof Array) {
    // Add leading whitespace to first item in array
    return setFirst(node, leading(node[0], ws));
  }
  if (!isObject(node)) {
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
}

/** Attaches optional trailing whitespace to AST node, or to array of AST nodes (to the last in array) */
export function trailing<T extends BaseNode>(node: T, ws: Whitespace[]): T;
export function trailing<T extends BaseNode>(node: T[], ws: Whitespace[]): T[];
export function trailing<T extends BaseNode>(
  node: T | T[],
  ws: Whitespace[]
): T | T[] {
  if (node instanceof Array) {
    // Add trailing whitespace to last item in array
    return setLast(node, trailing(last(node), ws));
  }
  if (!isObject(node)) {
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
}

/** Shorthand for attaching both trailing or leading whitespace */
export function surrounding<T extends BaseNode>(
  leadingWs: Whitespace[],
  node: T,
  trailingWs: Whitespace[]
): T;
export function surrounding<T extends BaseNode>(
  leadingWs: Whitespace[],
  node: T[],
  trailingWs: Whitespace[]
): T[];
export function surrounding<T extends BaseNode>(
  leadingWs: Whitespace[],
  node: T | T[],
  trailingWs: Whitespace[]
): T | T[] {
  return trailing(leading(node as T, leadingWs), trailingWs);
}

// Creates new array with first item replaced by value
const setFirst = <T>([_oldFirst, ...rest]: T[], value: T): T[] => {
  return [value, ...rest];
};

// Creates new array with last item replaced by value
const setLast = <T>(array: T[], value: T): T[] => {
  const rest = array.slice(0, -1);
  return [...rest, value];
};
