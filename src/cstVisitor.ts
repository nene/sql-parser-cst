import { Node } from "./sql";

/**
 * A map with a visitor function for each Node type, like:
 *
 *     { select_clause: (node: SelectClause) => {},
 *       from_clause: (node: FromClause) => {},
 *       paren_expr: (node: ParenExpr) => {},
 *       ... }
 */
export type FullVisitorMap = {
  [K in Node["type"]]: (node: Extract<Node, { type: K }>) => void;
};

/**
 * Creates a function that visits the whole syntax tree.
 * @param map An object with a visitor functions
 */
export function cstVisitor(map: Partial<FullVisitorMap>): (node: Node) => void {
  const visit = (node: Node) => {
    const visitType = map[node.type] as (
      e: Extract<Node, { type: typeof node["type"] }>
    ) => void;

    // Visit the node itself
    if (visitType) {
      visitType(node);
    }

    // Visit all children
    for (const child of Object.values(node)) {
      if (isNode(child)) {
        visit(child);
      } else if (child instanceof Array) {
        child.filter(isNode).forEach((childNode) => visit(childNode));
      }
    }
  };
  return visit;
}

const isNode = (value: any): value is Node =>
  typeof value === "object" && typeof value.type === "string";
