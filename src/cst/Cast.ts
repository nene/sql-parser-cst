import { BaseNode, Keyword } from "./Base";
import { NamedDataType } from "./Node";

export type AllCastNodes = CastDefinition;

export interface CastDefinition extends BaseNode {
  type: "cast_definition";
  from: NamedDataType;
  asKw: Keyword<"AS">;
  to: NamedDataType;
}
