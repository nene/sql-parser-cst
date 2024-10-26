import { BaseNode, Keyword } from "./Base";
import { ColumnDefinition } from "./CreateTable";
import { EntityName, ListExpr, ParenExpr } from "./Expr";
import { StringLiteral } from "./Literal";

export type AllTypeNodes = AllTypeStatements | TypeDefinition;

export type AllTypeStatements = CreateTypeStmt;

// CREATE TYPE
export interface CreateTypeStmt extends BaseNode {
  type: "create_type_stmt";
  createTypeKw: [Keyword<"CREATE">, Keyword<"TYPE">];
  name: EntityName;
  definition: TypeDefinition;
}

type TypeDefinition = EnumTypeDefinition | CompositeTypeDefinition;

export interface CompositeTypeDefinition extends BaseNode {
  type: "composite_type_definition";
  asKw: Keyword<"AS">;
  columns: ParenExpr<ListExpr<ColumnDefinition>>;
}

export interface EnumTypeDefinition extends BaseNode {
  type: "enum_type_definition";
  asEnumKw: [Keyword<"AS">, Keyword<"ENUM">];
  values: ParenExpr<ListExpr<StringLiteral>>;
}
