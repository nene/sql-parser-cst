import { cstTransformer } from "../cstTransformer";
import { Node as AstNode } from "../ast/Node";
import { aliasMap } from "./aliasMap";
import { baseMap } from "./baseMap";
import { dataTypeMap } from "./dataTypeMap";
import { exprMap } from "./exprMap";
import { insertMap } from "./insertMap";
import { programMap } from "./programMap";
import { selectMap } from "./selectMap";
import { updateMap } from "./updateMap";
import { windowFrameMap } from "./windowFrameMap";

export const transformToAst = cstTransformer<AstNode>({
  ...aliasMap,
  ...baseMap,
  ...dataTypeMap,
  ...exprMap,
  ...insertMap,
  ...programMap,
  ...selectMap,
  ...updateMap,
  ...windowFrameMap,
});
