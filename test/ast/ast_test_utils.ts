import { ParserOptions } from "../../src/main";
import { cstToAst } from "../../src/cstToAst";
import { parse } from "../test_utils";
import { Node } from "../../src/ast/Node";
import { isObject, isString } from "../../src/utils/generic";

export function parseAst(sql: string, options: Partial<ParserOptions> = {}) {
  return stripUndefinedFields(cstToAst(parse(sql, options)));
}

function stripUndefinedFields<T extends Node>(ast: T): T {
  visitAllAstNodes(ast, (node: Record<any, any>) => {
    for (const key of Object.keys(node)) {
      if (node[key] === undefined) {
        delete node[key];
      }
    }
  });
  return ast;
}

/* Executes a function with all nodes in syntax tree */
const visitAllAstNodes = (node: Node, visit: (node: Node) => void) => {
  visit(node);

  // Visit all children
  for (const child of Object.values(node)) {
    if (isNode(child)) {
      visitAllAstNodes(child, visit);
    } else if (Array.isArray(child)) {
      child
        .filter(isNode)
        .forEach((childNode) => visitAllAstNodes(childNode, visit));
    }
  }
};

const isNode = (obj: any): obj is Node => isObject(obj) && isString(obj.type);
