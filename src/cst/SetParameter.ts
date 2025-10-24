import { BaseNode, Keyword } from "./Base";
import { Identifier, ListExpr } from "./Expr";
import { Default } from "./Insert";
import { Literal } from "./Literal";

export interface SetParameterStmt extends BaseNode {
  type: "set_parameter_stmt";
  setKw: Keyword<"SET">;
  modifierKw?: Keyword<"LOCAL" | "SESSION">;
  name: Identifier;
  operator: Keyword<"TO"> | "=";
  value: ListExpr<Literal | Identifier | Default>;
}
