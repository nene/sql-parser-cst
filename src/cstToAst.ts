import { Node as CstNode } from "./cst/Node";
import { Node as AstNode } from "./ast/Node";
import { transformToAst } from "./toAst/transformToAst";

export function cstToAst<T extends AstNode[]>(cstNode: CstNode[]): T;
export function cstToAst<T extends AstNode>(cstNode: CstNode): T;
export function cstToAst<T extends AstNode[]>(
  cstNode: CstNode[] | undefined
): T | undefined;
export function cstToAst<T extends AstNode>(
  cstNode: CstNode | undefined
): T | undefined;
export function cstToAst<T extends AstNode>(
  cstNode: CstNode | CstNode[] | undefined
): T | T[] | undefined {
  if (cstNode === undefined) {
    return undefined;
  }
  if (Array.isArray(cstNode)) {
    return cstNode.map(cstToAst) as T[];
  }
  const astNode = transformToAst(cstNode) as T;
  astNode.range = cstNode.range;
  return astNode;
}
