import { Node, Whitespace } from "src/cst/Node";
import { leading, trailing } from "./whitespace";

//
// Helpers for reading lists of nodes into array
//

export const readCommaSepList = <T extends Node>(
  head: T,
  tail: [Whitespace[], string, Whitespace[], T][]
): T[] => {
  const items = [head];
  for (const [c1, _comma, c2, expr] of tail) {
    const lastIdx = items.length - 1;
    items[lastIdx] = trailing(items[lastIdx], c1) as T;
    items.push(leading(expr, c2) as T);
  }
  return items;
};
