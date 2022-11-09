import { isString } from "../utils/generic";
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

function unrollArray(array: Layout[]): Layout[] {
  const flatArray = array.flatMap(unroll);

  // No need to split when dealing with homogenous array
  if (flatArray.every(isLine) || flatArray.every(isString)) {
    return flatArray;
  }

  const lines: Line[] = [];
  flatArray.forEach((item, i) => {
    if (isLine(item)) {
      if (item.trailing && lines.length > 0) {
        lines[lines.length - 1].items.push(...item.items);
      } else {
        lines.push(item);
      }
      if (isString(flatArray[i + 1])) {
        lines.push({ layout: "line", items: [] });
      }
    } else {
      if (lines.length === 0) {
        lines.push({ layout: "line", items: [item] });
      } else {
        lines[lines.length - 1].items.push(item);
      }
    }
  });
  return lines;
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
