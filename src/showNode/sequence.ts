import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { AllSequenceNodes } from "../cst/Node";

export const sequenceMap: FullTransformMap<string, AllSequenceNodes> = {
  // CREATE SEQUENCE
  create_sequence_stmt: (node) =>
    show([
      node.createKw,
      node.kind,
      node.sequenceKw,
      node.ifNotExistsKw,
      node.name,
      node.options,
    ]),
  sequence_kind: (node) => show(node.kindKw),
  sequence_option_as_type: (node) => show([node.asKw, node.dataType]),
  sequence_option_increment: (node) =>
    show([node.incrementKw, node.byKw, node.value]),

  // DROP SEQUENCE
  drop_sequence_stmt: (node) =>
    show([
      node.dropKw,
      node.sequenceKw,
      node.ifExistsKw,
      node.sequences,
      node.behaviorKw,
    ]),
};
