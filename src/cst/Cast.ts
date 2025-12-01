import { BaseNode, Keyword } from "./Base";
import { ModifiedDataType } from "./Node";

export type AllCastNodes = CastDefinition;

export interface CastDefinition extends BaseNode {
  type: "cast_definition";
  from: ModifiedDataType;
  asKw: Keyword<"AS">;
  to: ModifiedDataType;
}
