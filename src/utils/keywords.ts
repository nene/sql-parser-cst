import { DialectName } from "src/ParserOptions";
import { bigqueryKeywords } from "../keywords/bigquery.keywords";
import { mysqlKeywords } from "../keywords/mysql.keywords";
import { sqliteKeywords } from "../keywords/sqlite.keywords";
import { getDialect } from "./parserState";

const keywordMap: Record<DialectName, Record<string, boolean>> = {
  bigquery: bigqueryKeywords,
  mysql: mysqlKeywords,
  sqlite: sqliteKeywords,
};

export const isReservedKeyword = (name: string) => {
  return keywordMap[getDialect()][name.toUpperCase()];
};
