import { DialectName } from "src/ParserOptions";
import { bigqueryKeywords } from "../keywords/bigquery.keywords";
import { mysqlKeywords } from "../keywords/mysql.keywords";
import { mariadbKeywords } from "../keywords/mariadb.keywords";
import { sqliteKeywords } from "../keywords/sqlite.keywords";
import { postgresqlKeywords } from "../keywords/postgresql.keywords";
import { getDialect } from "./parserState";

const keywordMap: Record<DialectName, Record<string, boolean>> = {
  bigquery: bigqueryKeywords,
  mysql: mysqlKeywords,
  mariadb: mariadbKeywords,
  sqlite: sqliteKeywords,
  postgresql: postgresqlKeywords,
};

export const isReservedKeyword = (name: string) => {
  return keywordMap[getDialect()][name.toUpperCase()];
};
