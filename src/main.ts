export * from "./cst/Node";
export * from "./cstVisitor";
export * from "./cstTransformer";
export { DialectName, ParserOptions } from "./ParserOptions";
export { FormattedSyntaxError } from "./FormattedSyntaxError";

import { Node, Program } from "./cst/Node";
import { parse as parseSql, PeggySyntaxError } from "./parser";
import { show as showSql } from "./show";
import { ParserOptions, validDialectNames } from "./ParserOptions";
import { FormattedSyntaxError } from "./FormattedSyntaxError";

export function parse(sql: string, options: ParserOptions): Program {
  if (!options || !options.dialect) {
    throw new Error(`No SQL dialect specified.`);
  }
  if (!validDialectNames[options.dialect]) {
    throw new Error(`Unsupported dialect name: "${options.dialect}"`);
  }
  try {
    return parseSql(sql, options) as Program;
  } catch (e) {
    if (e instanceof PeggySyntaxError) {
      throw new FormattedSyntaxError(e, sql, options.filename);
    }
    throw e;
  }
}

/**
 * Converts any syntax tree node back to SQL string.
 *
 * It's a very primitive serializer that won't insert any whitespace on its own.
 * It will only restore the whitespace from leading/trailing fields.
 * Not having this information available can lead to invalid SQL being generated.
 *
 * Therefore only feed it syntax trees parsed with options:
 *
 *     { includeSpaces: true, includeComments: true, includeNewlines: true }
 */
export function show(node: Node): string {
  // This might look like an unnecessary wrapper around show() from src/show.
  // The goal here is to restrict the input type to just Node,
  // not allowing all the additional types that are largely an implementation detail.
  return showSql(node);
}
