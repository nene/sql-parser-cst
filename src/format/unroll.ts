import { Line, isLine, Layout } from "./layout";

export function unroll(item: Layout): Layout {
  if (isLine(item)) {
    return unrollLine(item);
  }
  if (item instanceof Array) {
    return unrollArray(item);
  }
  return item;
}

function unrollArray(arr: Layout[]): Layout[] {
  return arr.flatMap(unroll);
}

function unrollLine(line: Line): Line[] {
  const lineItems = unrollArray(line.items);
  if (lineItems.every(isLine)) {
    return lineItems.map((subLine) => {
      if (line.indent) {
        return { ...subLine, indent: line.indent + (subLine.indent || 0) };
      } else {
        return subLine;
      }
    });
  }
  return [{ ...line, items: lineItems }];
}
