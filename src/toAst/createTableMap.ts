import { TransformMap } from "../cstTransformer";
import { AllCreateTableNodes } from "../cst/Node";
import { CreateTableStmt, Node as AstNode } from "../ast/Node";
import { cstToAst } from "../cstToAst";
import { keywordToBoolean } from "./transformUtils";

export const createTableMap: TransformMap<AstNode, AllCreateTableNodes> = {
  create_table_stmt: (node): CreateTableStmt => ({
    type: "create_table_stmt",
    orReplace: keywordToBoolean(node.orReplaceKw),
    temporary: keywordToBoolean(node.temporaryKw),
    external: keywordToBoolean(node.externalKw),
    snapshot: keywordToBoolean(node.snapshotKw),
    name: cstToAst(node.name),
    ifNotExists: keywordToBoolean(node.ifNotExistsKw),
    columns: cstToAst(node.columns?.expr.items),
  }),
  column_definition: (node) => ({
    type: "column_definition",
    name: cstToAst(node.name),
    dataType: cstToAst(node.dataType),
  }),
};
