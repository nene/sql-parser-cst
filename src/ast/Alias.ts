import { BaseNode } from "./Base";
import { Identifier } from "./Expr";
import { Node } from "./Node";

export interface Alias<T = Node> extends BaseNode {
  type: "alias";
  expr: T;
  alias: Identifier;
}
