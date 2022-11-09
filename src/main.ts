import { Node, Program } from "./sql";
import { parse as parseSql } from "./parser";
import { show as showSql } from "./show";
import { DialectName, ParserOptions } from "./ParserOptions";
export { format } from "./format/format";
export * from "./cstVisitor";
export * from "./cstTransformer";

export { DialectName, ParserOptions };

export function parse(sql: string, options: ParserOptions): Program {
  return parseSql(sql, options);
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
 *     { preserveSpaces: true, preserveComments: true, preserveNewlines: true }
 */
export function show(node: Node): string {
  // This might look like an unnecessary wrapper around show() from src/show.
  // The goal here is to restrict the input type to just Node,
  // not allowing all the additional types that are largely an implementation detail.
  return showSql(node);
}
