import { BaseNode, Keyword } from "./Base";
import { Identifier } from "./Expr";
import { Node } from "./Node";

export interface Alias<T = Node> extends BaseNode {
  type: "alias";
  expr: T;
  asKw?: Keyword<"AS">;
  alias: Identifier;
}
