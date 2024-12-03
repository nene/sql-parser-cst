import { BaseNode, Keyword } from "./Base";
import { Identifier, ListExpr } from "./Expr";

export type AllTransactionNodes =
  | AllTransactionStatements
  | RollbackToSavepoint
  | TransactionChainClause
  | TransactionNoChainClause
  | TransactionMode;

export type AllTransactionStatements =
  | StartTransactionStmt
  | CommitTransactionStmt
  | RollbackTransactionStmt
  | SavepointStmt
  | ReleaseSavepointStmt;

export interface StartTransactionStmt extends BaseNode {
  type: "start_transaction_stmt";
  startKw: Keyword<"START" | "BEGIN">;
  behaviorKw?: Keyword<"DEFERRED" | "IMMEDIATE" | "EXCLUSIVE">;
  transactionKw?: Keyword<"TRANSACTION" | "WORK">;
  modes?: ListExpr<TransactionMode>;
}

type TransactionMode =
  | TransactionModeDeferrable
  | TransactionModeNotDeferrable
  | TransactionModeReadWrite
  | TransactionModeReadOnly
  | TransactionModeIsolationLevel;

export interface TransactionModeDeferrable extends BaseNode {
  type: "transaction_mode_deferrable";
  deferrableKw: Keyword<"DEFERRABLE">;
}

export interface TransactionModeNotDeferrable extends BaseNode {
  type: "transaction_mode_not_deferrable";
  notDeferrableKw: [Keyword<"NOT">, Keyword<"DEFERRABLE">];
}

export interface TransactionModeReadWrite extends BaseNode {
  type: "transaction_mode_read_write";
  readWriteKw: [Keyword<"READ">, Keyword<"WRITE">];
}

export interface TransactionModeReadOnly extends BaseNode {
  type: "transaction_mode_read_only";
  readOnlyKw: [Keyword<"READ">, Keyword<"ONLY">];
}

export interface TransactionModeIsolationLevel extends BaseNode {
  type: "transaction_mode_isolation_level";
  isolationLevelKw: [Keyword<"ISOLATION">, Keyword<"LEVEL">];
  levelKw:
    | Keyword<"SERIALIZABLE">
    | [Keyword<"REPEATABLE">, Keyword<"READ">]
    | [Keyword<"READ">, Keyword<"COMMITTED">]
    | [Keyword<"READ">, Keyword<"UNCOMMITTED">];
}

export interface CommitTransactionStmt extends BaseNode {
  type: "commit_transaction_stmt";
  commitKw: Keyword<"COMMIT" | "END">;
  transactionKw?: Keyword<"TRANSACTION" | "WORK">;
  chain?: TransactionChainClause | TransactionNoChainClause;
}

export interface RollbackTransactionStmt extends BaseNode {
  type: "rollback_transaction_stmt";
  rollbackKw: Keyword<"ROLLBACK" | "ABORT">;
  transactionKw?: Keyword<"TRANSACTION" | "WORK">;
  savepoint?: RollbackToSavepoint;
  chain?: TransactionChainClause | TransactionNoChainClause;
}

export interface RollbackToSavepoint extends BaseNode {
  type: "rollback_to_savepoint";
  toKw: Keyword<"TO">;
  savepointKw?: Keyword<"SAVEPOINT">;
  savepoint: Identifier;
}

export interface SavepointStmt extends BaseNode {
  type: "savepoint_stmt";
  savepointKw: Keyword<"SAVEPOINT">;
  savepoint: Identifier;
}

export interface ReleaseSavepointStmt extends BaseNode {
  type: "release_savepoint_stmt";
  releaseKw: Keyword<"RELEASE">;
  savepointKw?: Keyword<"SAVEPOINT">;
  savepoint: Identifier;
}

export interface TransactionChainClause extends BaseNode {
  type: "transaction_chain_clause";
  andChainKw: [Keyword<"AND">, Keyword<"CHAIN">];
}

export interface TransactionNoChainClause extends BaseNode {
  type: "transaction_no_chain_clause";
  andNoChainKw: [Keyword<"AND">, Keyword<"NO">, Keyword<"CHAIN">];
}
