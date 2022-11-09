import { Node, Whitespace } from "src/sql";
import { leading, trailing } from "./whitespace";

//
// Helpers for reading lists of nodes into array
//

export const readCommaSepList = <T extends Node>(
  head: T,
  tail: [Whitespace[], string, Whitespace[], T][]
): T[] => {
  const items = [head];
  for (const [c1, comma, c2, expr] of tail) {
    const lastIdx = items.length - 1;
    items[lastIdx] = trailing(items[lastIdx], c1) as T;
    items.push(leading(expr, c2) as T);
  }
  return items;
};

export const readSpaceSepList = <T extends Node>(
  head: T,
  tail: [Whitespace[], T][]
): T[] => {
  const items = [head];
  for (const [c, expr] of tail) {
    items.push(leading(expr, c) as T);
  }
  return items;
};
