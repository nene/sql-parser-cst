import { Keyword, Node as CstNode } from "../cst/Node";
import { Node as AstNode } from "../ast/Node";

type ClausesMap<TCstNode extends CstNode, TAstNode extends AstNode> = {
  [K in TCstNode["type"]]: (
    node: Extract<TCstNode, { type: K }>
  ) => Partial<TAstNode>;
};

export const mergeClauses = <
  TAstNode extends AstNode,
  TCstNode extends CstNode
>(
  clauses: TCstNode[],
  map: Partial<ClausesMap<TCstNode, TAstNode>>
): Partial<TAstNode> => {
  const result: Partial<TAstNode> = {};
  for (const clause of clauses) {
    const node = clause as Extract<TCstNode, { type: typeof clause["type"] }>;
    const fn = map[node.type] as (e: typeof node) => Partial<TAstNode>;
    if (!fn) {
      throw new Error(`No map entry for clause: ${node.type}`);
    }
    Object.assign(result, fn(node));
  }
  return result;
};

export function keywordToString<T = string>(kw: Keyword | Keyword[]): T;
export function keywordToString<T = string>(
  kw: Keyword | Keyword[] | undefined
): T | undefined;
export function keywordToString<T = string>(
  kw: Keyword | Keyword[] | undefined
): T | undefined {
  if (!kw) {
    return undefined;
  }
  if (Array.isArray(kw)) {
    return kw.map(keywordToString).join(" ") as T;
  }
  return kw.name.toLowerCase() as T;
}

export const keywordToBoolean = (
  kw: Keyword | undefined
): boolean | undefined => {
  return kw ? true : undefined;
};
