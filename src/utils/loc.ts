import { Node } from "src/sql";
import { getOptions, getRange } from "./parserState";

/** Attaches source location data to node (if includeRange setting enabled) */
export const loc = (node: Node): Node => {
  if (!getOptions().includeRange) {
    return node;
  }
  return { ...node, range: getRange() };
};
