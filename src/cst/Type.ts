import { BaseNode, Keyword } from "./Base";
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

type TypeDefinition = EnumTypeDefinition;

export interface EnumTypeDefinition extends BaseNode {
  type: "enum_type_definition";
  asEnumKw: [Keyword<"AS">, Keyword<"ENUM">];
  values: ParenExpr<ListExpr<StringLiteral>>;
}
