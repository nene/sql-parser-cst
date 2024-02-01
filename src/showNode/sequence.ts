import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { AllSequenceNodes } from "../cst/Node";

export const sequenceMap: FullTransformMap<string, AllSequenceNodes> = {
  create_sequence_stmt: (node) =>
    show([
      node.createKw,
      node.kind,
      node.sequenceKw,
      node.ifNotExistsKw,
      node.name,
    ]),
  sequence_kind: (node) => show(node.kindKw),
  drop_sequence_stmt: (node) =>
    show([
      node.dropKw,
      node.sequenceKw,
      node.ifExistsKw,
      node.sequences,
      node.behaviorKw,
    ]),
};
