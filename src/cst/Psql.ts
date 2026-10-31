import { BaseNode } from "./Base";
import { Statement } from "./Statement";

export interface PsqlCommand extends BaseNode {
  type: "psql_command";
  text: string;
}

export interface PsqlQuery extends BaseNode {
  type: "psql_query";
  query: Statement;
  terminator: string;
}

export interface PsqlVariable extends BaseNode {
  type: "psql_variable";
  text: string;
}

export interface PsqlIdentifier extends BaseNode {
  type: "psql_identifier";
  name: string;
  text: string;
}
