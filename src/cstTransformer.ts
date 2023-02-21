import { Node } from "./cst/Node";

// Types are getting somewhat intimidating in this file.
// Learned this TypeScript-Fu from here:
// https://stackoverflow.com/questions/64092736/alternative-to-switch-statement-for-typescript-discriminated-union

type NodeByType<TType, TNode> = Extract<TNode, { type: TType }>;

/**
 * A map with a transform function for each Node type, like:
 *
 *     { select_clause: (node: SelectClause) => {},
 *       from_clause: (node: FromClause) => {},
 *       paren_expr: (node: ParenExpr) => {},
 *       ... }
 */
export type FullTransformMap<T, TNode extends Node = Node> = {
  [TType in TNode["type"]]: (node: NodeByType<TType, TNode>) => T;
};

export type TransformMap<T, TNode extends Node = Node> = Partial<
  FullTransformMap<T, TNode>
>;

/**
 * Creates a function that transforms the whole syntax tree to data type T.
 * @param map An object with a transform function for each CST node type
 */
export function cstTransformer<T>(map: TransformMap<T>): (node: Node) => T {
  return (node: Node) => {
    const fn = map[node.type] as (
      param: NodeByType<typeof node["type"], Node>
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
