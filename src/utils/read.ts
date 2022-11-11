import { Node, Whitespace } from "src/cst/Node";
import { leading, trailing } from "./whitespace";

/**
 * Given array of syntax nodes and whitespace or single node or null,
 * associates whitespace with syntax nodes.
 *
 * @param {(Node | Whitespace)[] | Node | null} items
 * @return {Node[] | Node | undefined}
 */
export const read = (items: any) => {
  if (!items) {
    return undefined; // convert null to undefined
  }
  if (!(items instanceof Array)) {
    return items; // leave single syntax node as-is
  }

  // associate leading/trailing whitespace with nodes
  const nodes: any[] = [];
  let leadingWhitespace = undefined;
  for (const it of items) {
    if (isWhitespace(it)) {
      if (nodes.length > 0) {
        nodes[nodes.length - 1] = trailing(nodes[nodes.length - 1], it);
      } else {
        leadingWhitespace = it;
      }
    } else {
      if (leadingWhitespace) {
        nodes.push(leading(it, leadingWhitespace));
        leadingWhitespace = undefined;
      } else {
        nodes.push(it);
      }
    }
  }
  return nodes.length > 1 ? nodes : nodes[0];
};

// True when dealing with whitespace array (as returned by __ rule)
const isWhitespace = (
  item: Node[] | Whitespace[] | Node
): item is Whitespace[] => {
  if (!(item instanceof Array)) {
    return false;
  }
  if (item.length === 0) {
    return true;
  }
  return Boolean(whitespaceType[item[0].type]);
};

const whitespaceType: Record<string, boolean> = {
  space: true,
  newline: true,
  line_comment: true,
  block_comment: true,
};
