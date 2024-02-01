import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { AllSequenceNodes } from "../cst/Node";

export const sequenceMap: FullTransformMap<string, AllSequenceNodes> = {
  create_sequence_stmt: (node) =>
    show([node.createKw, node.sequenceKw, node.ifNotExistsKw, node.name]),
};
