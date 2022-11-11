import { Node } from "./cst/Node";

// Types are getting somewhat intimidating in this file.
// Learned this TypeScript-Fu from here:
// https://stackoverflow.com/questions/64092736/alternative-to-switch-statement-for-typescript-discriminated-union

/**
 * A map with a transform function for each Node type, like:
 *
 *     { select_clause: (node: SelectClause) => {},
 *       from_clause: (node: FromClause) => {},
 *       paren_expr: (node: ParenExpr) => {},
 *       ... }
 */
export type FullTransformMap<T> = {
  [K in Node["type"]]: (node: Extract<Node, { type: K }>) => T;
};

/**
 * Creates a function that transforms the whole syntax tree to data type T.
 * @param map An object with a transform function for each CST node type
 */
export function cstTransformer<T>(
  map: Partial<FullTransformMap<T>>
): (node: Node) => T {
  return (node: Node) => {
    const fn = map[node.type] as (
      e: Extract<Node, { type: typeof node["type"] }>
    ) => T;
    if (!fn) {
      if (!node.type) {
        throw new Error(`No type field on node: ${JSON.stringify(node)}`);
      }
      throw new Error(`No transform map entry for ${node.type}`);
    }
    return fn(node);
  };
}
