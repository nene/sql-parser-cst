import { DialectName, ParamType, ParserOptions } from "src/ParserOptions";
import { Whitespace } from "src/cst/Node";

export let getRange: () => [number, number];

/** Injects function to access source location range data */
export const setRangeFunction = (fn: () => [number, number]) => {
  getRange = fn;
};

export let getOptions: () => ParserOptions;

/** Injects function to access options object */
export const setOptionsFunction = (fn: () => any) => {
  getOptions = fn as () => ParserOptions;
};

export const getDialect = (): DialectName => getOptions().dialect;

export const isBigquery = () => getDialect() === "bigquery";
export const isMysql = () => getDialect() === "mysql";
export const isMariadb = () => getDialect() === "mariadb";
export const isSqlite = () => getDialect() === "sqlite";

export const hasParamType = (name: ParamType) => {
  return getOptions().paramTypes?.includes(name);
};

export const isEnabledWhitespace = (ws: Whitespace) =>
  (getOptions().includeComments &&
    (ws.type === "line_comment" || ws.type === "block_comment")) ||
  (getOptions().includeNewlines && ws.type === "newline") ||
  (getOptions().includeSpaces && ws.type === "space");
