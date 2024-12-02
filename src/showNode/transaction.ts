import { show } from "../show";
import { AllTransactionNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const transactionMap: FullTransformMap<string, AllTransactionNodes> = {
  start_transaction_stmt: (node) =>
    show([node.startKw, node.behaviorKw, node.transactionKw, node.modes]),
  commit_transaction_stmt: (node) =>
    show([node.commitKw, node.transactionKw, node.chain]),
  rollback_transaction_stmt: (node) =>
    show([node.rollbackKw, node.transactionKw, node.savepoint, node.chain]),
  rollback_to_savepoint: (node) =>
    show([node.toKw, node.savepointKw, node.savepoint]),
  savepoint_stmt: (node) => show([node.savepointKw, node.savepoint]),
  release_savepoint_stmt: (node) =>
    show([node.releaseKw, node.savepointKw, node.savepoint]),
  transaction_chain_clause: (node) => show([node.andChainKw]),
  transaction_no_chain_clause: (node) => show([node.andNoChainKw]),
  transaction_mode_deferrable: (node) => show([node.deferrableKw]),
  transaction_mode_not_deferrable: (node) => show([node.notDeferrableKw]),
  transaction_mode_read_write: (node) => show([node.readWriteKw]),
  transaction_mode_read_only: (node) => show([node.readOnlyKw]),
  transaction_mode_isolation_level: (node) =>
    show([node.isolationLevelKw, node.levelKw]),
};
