import { BaseNode } from "./Base";
import { Expr, Identifier, EntityName } from "./Expr";
import { SortSpecification } from "./Select";

export type AllConstraintNodes =
  | Constraint<TableConstraint>
  | TableConstraint
  | ReferencesSpecification
  | ReferentialAction
  | ReferentialMatch;

export interface Constraint<T> extends BaseNode {
  type: "constraint";
  name?: Identifier;
  constraint: T;
}

export type TableConstraint =
  | ConstraintPrimaryKey
  | ConstraintForeignKey
  | ConstraintUnique
  | ConstraintCheck
  | ConstraintIndex;

export interface ConstraintPrimaryKey extends BaseNode {
  type: "constraint_primary_key";
  order?: "asc" | "desc";
  columns?: (SortSpecification | Identifier)[];
  onConflict?: OnConflictResolution;
}

export interface ConstraintForeignKey extends BaseNode {
  type: "constraint_foreign_key";
  columns: Identifier[];
  references: ReferencesSpecification;
}

export interface ReferencesSpecification extends BaseNode {
  type: "references_specification";
  table: EntityName;
  columns?: Identifier[];
  options: (ReferentialAction | ReferentialMatch)[];
}

export interface ReferentialAction extends BaseNode {
  type: "referential_action";
  event: "delete" | "update";
  action: "restrict" | "cascade" | "set null" | "set default" | "no action";
}

export interface ReferentialMatch extends BaseNode {
  type: "referential_match";
  matchType: "full" | "partial" | "simple";
}

export interface ConstraintUnique extends BaseNode {
  type: "constraint_unique";
  columns?: Identifier[];
  onConflict?: OnConflictResolution;
}

export interface ConstraintCheck extends BaseNode {
  type: "constraint_check";
  expr: Expr;
  onConflict?: OnConflictResolution;
}

export interface ConstraintIndex extends BaseNode {
  type: "constraint_index";
  indexType?: "fulltext" | "spatial";
  columns?: Identifier[];
}

type OnConflictResolution =
  | "rollback"
  | "abort"
  | "fail"
  | "ignore"
  | "replace";
