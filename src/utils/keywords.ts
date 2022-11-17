import { DialectName } from "src/ParserOptions";
import { __RESERVED_KEYWORDS__ as bigqueryKeywords } from "../keywords/bigquery.keywords";
import { __RESERVED_KEYWORDS__ as mysqlKeywords } from "../keywords/mysql.keywords";
import { __RESERVED_KEYWORDS__ as sqliteKeywords } from "../keywords/sqlite.keywords";
import { getDialect } from "./parserState";

const keywordMap: Record<DialectName, Record<string, boolean>> = {
  bigquery: bigqueryKeywords,
  mysql: mysqlKeywords,
  sqlite: sqliteKeywords,
};

export const isReservedKeyword = (name: string) => {
  return keywordMap[getDialect()][name.toUpperCase()];
};
