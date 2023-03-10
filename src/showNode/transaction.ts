import { show } from "../show";
import { AllTransactionNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const transactionMap: FullTransformMap<string, AllTransactionNodes> = {
  start_transaction_stmt: (node) =>
    show([node.startKw, node.behaviorKw, node.transactionKw]),
  commit_transaction_stmt: (node) => show([node.commitKw, node.transactionKw]),
  rollback_transaction_stmt: (node) =>
    show([node.rollbackKw, node.transactionKw, node.savepoint]),
  rollback_to_savepoint: (node) =>
    show([node.toKw, node.savepointKw, node.savepoint]),
  savepoint_stmt: (node) => show([node.savepointKw, node.savepoint]),
  release_savepoint_stmt: (node) =>
    show([node.releaseKw, node.savepointKw, node.savepoint]),
};
