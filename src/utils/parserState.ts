import { DialectName, ParamType, ParserOptions } from "src/ParserOptions";
import { Whitespace } from "src/sql";

export let getRange: () => [number, number];

/** Injects function to access source location range data */
export const setRangeFunction = (fn: () => [number, number]) => {
  getRange = fn;
};

export let getOptions: () => ParserOptions;

/** Injects function to access options object */
export const setOptionsFunction = (fn: Function) => {
  getOptions = fn as () => ParserOptions;
};

export const getDialect = (): DialectName => getOptions().dialect;

export const isSqlite = () => getDialect() === "sqlite";
export const isMysql = () => getDialect() === "mysql";

export const hasParamType = (name: ParamType) => {
  return getOptions().paramTypes?.includes(name);
};

export const isEnabledWhitespace = (ws: Whitespace) =>
  (getOptions().preserveComments &&
    (ws.type === "line_comment" || ws.type === "block_comment")) ||
  (getOptions().preserveNewlines && ws.type === "newline") ||
  (getOptions().preserveSpaces && ws.type === "space");
