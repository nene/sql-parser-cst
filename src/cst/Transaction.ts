import { BaseNode, Keyword } from "./Base";
import { Identifier } from "./Expr";

export type AllTransactionNodes =
  | AllTransactionStatements
  | RollbackToSavepoint;

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
}

export interface CommitTransactionStmt extends BaseNode {
  type: "commit_transaction_stmt";
  commitKw: Keyword<"COMMIT" | "END">;
  transactionKw?: Keyword<"TRANSACTION" | "WORK">;
}

export interface RollbackTransactionStmt extends BaseNode {
  type: "rollback_transaction_stmt";
  rollbackKw: Keyword<"ROLLBACK">;
  transactionKw?: Keyword<"TRANSACTION" | "WORK">;
  savepoint?: RollbackToSavepoint;
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
