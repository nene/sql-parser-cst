import { Node } from "./cst/Node";
import { isObject, isString } from "./utils/generic";

export enum VisitorAction {
  /** Return from visitor function to skip iterating over child nodes. */
  SKIP = 1,
}

/**
 * A map with a visitor function for each Node type, like:
 *
 *     { select_clause: (node: SelectClause) => {},
 *       from_clause: (node: FromClause) => {},
 *       paren_expr: (node: ParenExpr) => {},
 *       ... }
 */
export type FullVisitorMap = {
  [K in Node["type"]]: (
    node: Extract<Node, { type: K }>
  ) => VisitorAction | void;
};

/**
 * Creates a function that visits the whole syntax tree.
 * @param map An object with a visitor functions
 */
export function cstVisitor(map: Partial<FullVisitorMap>): (node: Node) => void {
  const visit = (node: Node) => {
    const visitType = map[node.type] as (
      e: Extract<Node, { type: (typeof node)["type"] }>
    ) => VisitorAction | void;

    // Visit the node itself
    const action = visitType?.(node);

    if (action !== VisitorAction.SKIP) {
      // Visit all children
      for (const child of Object.values(node)) {
        if (isNode(child)) {
          visit(child);
        } else if (child instanceof Array) {
          child.filter(isNode).forEach((childNode) => visit(childNode));
        }
      }
    }
  };
  return visit;
}

const isNode = (value: any): value is Node =>
  isObject(value) && isString(value.type);
