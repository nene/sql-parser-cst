import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { AllCastNodes } from "../cst/Node";

export const castMap: FullTransformMap<string, AllCastNodes> = {
  cast_definition: (node) => show([node.from, node.asKw, node.to]),
};
