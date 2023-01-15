import { Node, Whitespace } from "src/cst/Node";
import { getOptions, getRange } from "./parserState";

/** Attaches source location data to node (if includeRange setting enabled) */
export const loc = (node: Node | Whitespace): Node | Whitespace => {
  if (!getOptions().includeRange) {
    return node;
  }
  return { ...node, range: getRange() };
};
