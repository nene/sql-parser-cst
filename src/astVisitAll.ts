import { isObject, isString } from "./utils/generic";
import { Node } from "./ast/Node";

/* Executes a function with all nodes in syntax tree */
export const astVisitAll = (node: Node, visit: (node: Node) => void) => {
  visit(node);

  // Visit all children
  for (const child of Object.values(node)) {
    if (isNode(child)) {
      astVisitAll(child, visit);
    } else if (Array.isArray(child)) {
      child
        .filter(isNode)
        .forEach((childNode) => astVisitAll(childNode, visit));
    }
  }
};

const isNode = (obj: any): obj is Node => isObject(obj) && isString(obj.type);
