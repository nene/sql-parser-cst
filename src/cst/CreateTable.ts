import { BaseNode, Keyword } from "./Base";
import { BigqueryOptionDefaultCollate, BigqueryOptions } from "./Bigquery";
import { ColumnConstraint, Constraint, TableConstraint } from "./Constraint";
import { DataType } from "./DataType";
import { Expr, Identifier, ListExpr, ParenExpr, Table } from "./Expr";
import { SubSelect } from "./Select";

export type AllCreateTableNodes =
  | CreateTableStmt
  | CreateTableAs
  | ColumnDefinition
  | TableOption;

// CREATE TABLE
export interface CreateTableStmt extends BaseNode {
  type: "create_table_stmt";
  createKw: Keyword<"CREATE">;
  tableKw: Keyword<"TABLE">;
  temporaryKw?: Keyword<"TEMP" | "TEMPORARY">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  table: Table;
  columns?: ParenExpr<
    ListExpr<ColumnDefinition | TableConstraint | Constraint<TableConstraint>>
  >;
  options?: ListExpr<TableOption> | BigqueryTableOption[];
  as?: CreateTableAs;
}

export interface CreateTableAs extends BaseNode {
  type: "create_table_as";
  asKw: Keyword<"AS">;
  expr: SubSelect;
}

export interface ColumnDefinition extends BaseNode {
  type: "column_definition";
  name: Identifier;
  dataType?: DataType;
  constraints: (ColumnConstraint | Constraint<ColumnConstraint>)[];
}

export interface TableOption extends BaseNode {
  type: "table_option";
  name: TableOptionNameSqlite | TableOptionNameMysql;
  hasEq?: boolean; // True when "=" sign is used
  value?: TableOptionValueMysql | Expr;
}

type TableOptionNameSqlite =
  | Keyword<"STRICT">
  | [Keyword<"WITHOUT">, Keyword<"ROWID">];

type TableOptionNameMysql =
  | [Keyword<"START">, Keyword<"TRANSACTION">]
  | Keyword<"AUTOEXTEND_SIZE">
  | Keyword<"AUTO_INCREMENT">
  | Keyword<"AVG_ROW_LENGTH">
  | [Keyword<"DEFAULT">, Keyword<"CHARACTER">, Keyword<"SET">]
  | [Keyword<"CHARACTER">, Keyword<"SET">]
  | Keyword<"CHECKSUM">
  | [Keyword<"DEFAULT">, Keyword<"COLLATE">]
  | Keyword<"COLLATE">
  | Keyword<"COMMENT">
  | Keyword<"COMPRESSION">
  | Keyword<"CONNECTION">
  | [Keyword<"DATA">, Keyword<"DIRECTORY">]
  | [Keyword<"INDEX">, Keyword<"DIRECTORY">]
  | Keyword<"DELAY_KEY_WRITE">
  | Keyword<"ENCRYPTION">
  | Keyword<"ENGINE">
  | Keyword<"ENGINE_ATTRIBUTE">
  | Keyword<"INSERT_METHOD">
  | Keyword<"KEY_BLOCK_SIZE">
  | Keyword<"MAX_ROWS">
  | Keyword<"MIN_ROWS">
  | Keyword<"PACK_KEYS">
  | Keyword<"PASSWORD">
  | Keyword<"ROW_FORMAT">
  | Keyword<"SECONDARY_ENGINE_ATTRIBUTE">
  | Keyword<"STATS_AUTO_RECALC">
  | Keyword<"STATS_PERSISTENT">
  | Keyword<"STATS_SAMPLE_PAGES">;

type TableOptionValueMysql = Keyword<
  | "DEFAULT"
  | "DYNAMIC"
  | "FIXED"
  | "COMPRESSED"
  | "REDUNDANT"
  | "COMPACT"
  | "NO"
  | "FIRST"
  | "LAST"
>;

type BigqueryTableOption = BigqueryOptions | BigqueryOptionDefaultCollate;
