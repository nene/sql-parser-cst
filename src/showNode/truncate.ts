import { show } from "../show";
import { TruncateStmt } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const truncateMap: FullTransformMap<string, TruncateStmt> = {
  truncate_stmt: (node) =>
    show([
      node.truncateKw,
      node.tableKw,
      node.tables,
      node.restartOrContinueKw,
      node.cascadeOrRestrictKw,
    ]),
};
