import { BaseNode, Keyword } from "./Base";
import { EntityName } from "./Expr";
import { NullLiteral, StringLiteral } from "./Literal";

export type AllCommentNodes = AllCommentStatements | CommentTarget;

export type AllCommentStatements = CommentStmt;

// PostgreSQL specific
export interface CommentStmt extends BaseNode {
  type: "comment_stmt";
  commentKw: Keyword<"COMMENT">;
  onKw: Keyword<"ON">;
  target: CommentTarget;
  isKw: Keyword<"IS">;
  message: StringLiteral | NullLiteral;
}

type CommentTarget =
  | CommentTargetColumn
  | CommentTargetSchema
  | CommentTargetTable;

export interface CommentTargetColumn extends BaseNode {
  type: "comment_target_column";
  columnKw: Keyword<"COLUMN">;
  name: EntityName;
}

export interface CommentTargetSchema extends BaseNode {
  type: "comment_target_schema";
  schemaKw: Keyword<"SCHEMA">;
  name: EntityName;
}

export interface CommentTargetTable extends BaseNode {
  type: "comment_target_table";
  tableKw: Keyword<"TABLE">;
  name: EntityName;
}
