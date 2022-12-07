import { BaseNode, Keyword } from "./Base";
import { Expr, ListExpr, ParenExpr, Table } from "./Expr";
import { StringLiteral } from "./Literal";

export type AllFunctionStatements = CreateFunctionStmt;

// CREATE FUNCTION
export interface CreateFunctionStmt extends BaseNode {
  type: "create_function_stmt";
  createKw: Keyword<"CREATE">;
  orReplaceKw?: [Keyword<"OR">, Keyword<"REPLACE">];
  temporaryKw?: Keyword<"TEMP" | "TEMPORARY">;
  functionKw: Keyword<"FUNCTION">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: Table;
  params: ParenExpr<ListExpr<Expr>>;
  asKw: Keyword<"AS">;
  expr: ParenExpr<Expr> | StringLiteral;
}
