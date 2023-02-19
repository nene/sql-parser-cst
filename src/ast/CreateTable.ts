import { BaseNode } from "./Base";
import { DataType } from "./DataType";
import { Identifier, EntityName } from "./Expr";

export type AllCreateTableNodes = CreateTableStmt | ColumnDefinition;

export interface CreateTableStmt extends BaseNode {
  type: "create_table_stmt";
  orReplace?: boolean;
  temporary?: boolean;
  external?: boolean;
  snapshot?: boolean;
  ifNotExists?: boolean;
  name: EntityName;
  columns?: ColumnDefinition[];
}

export interface ColumnDefinition extends BaseNode {
  type: "column_definition";
  name: Identifier;
  dataType?: DataType;
}
