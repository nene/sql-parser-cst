import { BaseNode, Keyword } from "./Base";
import { StringLiteral } from "./Literal";
import { Expr, Identifier, ListExpr, ParenExpr, EntityName } from "./Expr";
import {
  SortDirectionAsc,
  SortDirectionDesc,
  SortSpecification,
  WhereClause,
} from "./Select";
import { BigqueryOptions } from "./dialects/Bigquery";
import { Default } from "./Insert";
import {
  UsingAccessMethodClause,
  PostgresqlOperator,
  PostgresqlOperatorExpr,
} from "./Node";

export type AllConstraintNodes =
  | Constraint<ColumnConstraint | TableConstraint>
  | ConstraintNull
  | ConstraintNotNull
  | ConstraintDefault
  | ConstraintAutoIncrement
  | ConstraintUnique
  | ConstraintPrimaryKey
  | ReferencesSpecification
  | ConstraintComment
  | ConstraintCheck
  | ConstraintIndex
  | ConstraintGenerated
  | IdentityColumn
  | ConstraintCollate
  | ConstraintVisible
  | ConstraintColumnFormat
  | ConstraintStorage
  | ConstraintEngineAttribute
  | ConstraintCompression
  | ConstraintPrimaryKey
  | ConstraintForeignKey
  | ConstraintUnique
  | ConstraintCheck
  | ConstraintIndex
  | ConstraintName
  | ConstraintModifier
  | ConstraintExclude
  | ExclusionParam
  | ReferencesSpecification
  | ReferentialAction
  | ReferentialMatch
  | OnConflictClause;

export interface Constraint<T> extends BaseNode {
  type: "constraint";
  name?: ConstraintName;
  constraint: T;
  modifiers: ConstraintModifier[];
}

export interface ConstraintName extends BaseNode {
  type: "constraint_name";
  constraintKw: Keyword<"CONSTRAINT">;
  name?: Identifier;
}

export interface ConstraintModifier extends BaseNode {
  type: "constraint_modifier";
  kw:
    | Keyword<"DEFERRABLE">
    | [Keyword<"NOT">, Keyword<"DEFERRABLE">]
    | [Keyword<"INITIALLY">, Keyword<"IMMEDIATE" | "DEFERRED">]
    | [Keyword<"NO">, Keyword<"INHERIT">]; // PostgreSQL
}

export type TableConstraint =
  | ConstraintPrimaryKey
  | ConstraintForeignKey
  | ConstraintUnique
  | ConstraintCheck
  | ConstraintIndex
  | ConstraintExclude;

export type ColumnConstraint =
  | ConstraintNull
  | ConstraintNotNull
  | ConstraintDefault
  | ConstraintAutoIncrement
  | ConstraintUnique
  | ConstraintPrimaryKey
  | ReferencesSpecification
  | ConstraintComment
  | ConstraintCheck
  | ConstraintIndex
  | ConstraintGenerated
  | ConstraintCollate
  | ConstraintVisible
  | ConstraintColumnFormat
  | ConstraintStorage
  | ConstraintEngineAttribute
  | ConstraintCompression
  | BigqueryOptions;

export interface ConstraintPrimaryKey extends BaseNode {
  type: "constraint_primary_key";
  primaryKeyKw: [Keyword<"PRIMARY">, Keyword<"KEY">];
  direction?: SortDirectionAsc | SortDirectionDesc; // SQLite
  columns?: ParenExpr<ListExpr<SortSpecification | Identifier>>;
  onConflict?: OnConflictClause;
}

export interface ConstraintForeignKey extends BaseNode {
  type: "constraint_foreign_key";
  foreignKeyKw: [Keyword<"FOREIGN">, Keyword<"KEY">];
  indexName?: Identifier;
  columns: ParenExpr<ListExpr<Identifier>>;
  references: ReferencesSpecification;
}

export interface ReferencesSpecification extends BaseNode {
  type: "references_specification";
  referencesKw: Keyword<"REFERENCES">;
  table: EntityName;
  columns?: ParenExpr<ListExpr<Identifier>>;
  options: (ReferentialAction | ReferentialMatch)[];
}

export interface ReferentialAction extends BaseNode {
  type: "referential_action";
  onKw: Keyword<"ON">;
  eventKw: Keyword<"DELETE" | "UPDATE">;
  actionKw:
    | Keyword<"RESTRICT" | "CASCADE">
    | [Keyword<"SET">, Keyword<"NULL" | "DEFAULT">]
    | [Keyword<"NO">, Keyword<"ACTION">];
  // PostgreSQL
  columns?: ParenExpr<ListExpr<Identifier>>;
}

export interface ReferentialMatch extends BaseNode {
  type: "referential_match";
  matchKw: Keyword<"MATCH">;
  typeKw: Keyword<"FULL" | "PARTIAL" | "SIMPLE">;
}

export interface ConstraintUnique extends BaseNode {
  type: "constraint_unique";
  uniqueKw: Keyword<"UNIQUE"> | [Keyword<"UNIQUE">, Keyword<"KEY" | "INDEX">];
  // PostgreSQL
  nullsKw?:
    | [Keyword<"NULLS">, Keyword<"DISTINCT">]
    | [Keyword<"NULLS">, Keyword<"NOT">, Keyword<"DISTINCT">];
  columns?: ParenExpr<ListExpr<Identifier>>;
  onConflict?: OnConflictClause;
}

export interface ConstraintCheck extends BaseNode {
  type: "constraint_check";
  checkKw: Keyword<"CHECK">;
  expr: ParenExpr<Expr>;
  onConflict?: OnConflictClause;
}

// MySQL, MariaDB
export interface ConstraintIndex extends BaseNode {
  type: "constraint_index";
  indexTypeKw?: Keyword<"FULLTEXT" | "SPATIAL">;
  indexKw: Keyword<"INDEX" | "KEY">;
  columns?: ParenExpr<ListExpr<Identifier>>;
}

// MySQL, MariaDB, SQLite, PostgreSQL
export interface ConstraintNull extends BaseNode {
  type: "constraint_null";
  nullKw: Keyword<"NULL">;
}

export interface ConstraintNotNull extends BaseNode {
  type: "constraint_not_null";
  notNullKw: [Keyword<"NOT">, Keyword<"NULL">];
  onConflict?: OnConflictClause;
}

export interface ConstraintDefault extends BaseNode {
  type: "constraint_default";
  defaultKw: Keyword<"DEFAULT">;
  expr: Expr;
}

// MySQL, MariaDB, SQLite
export interface ConstraintAutoIncrement extends BaseNode {
  type: "constraint_auto_increment";
  autoIncrementKw: Keyword<"AUTO_INCREMENT" | "AUTOINCREMENT">;
}

// MySQL, MariaDB
export interface ConstraintComment extends BaseNode {
  type: "constraint_comment";
  commentKw: Keyword<"COMMENT">;
  value: StringLiteral;
}

// MySQL, MariaDB, SQLite
export interface ConstraintGenerated extends BaseNode {
  type: "constraint_generated";
  generatedKw?:
    | [Keyword<"GENERATED">, Keyword<"ALWAYS">]
    // PostgreSQL
    | [Keyword<"GENERATED">, Keyword<"BY">, Keyword<"DEFAULT">];
  asKw: Keyword<"AS">;
  expr: ParenExpr<Expr> | IdentityColumn;
  storageKw?: Keyword<"STORED" | "VIRTUAL">;
}

// PostgreSQL
export interface IdentityColumn extends BaseNode {
  type: "identity_column";
  identityKw: Keyword<"IDENTITY">;
}

// MySQL, MariaDB, SQLite, BigQuery, PostgreSQL
export interface ConstraintCollate extends BaseNode {
  type: "constraint_collate";
  collateKw: Keyword<"COLLATE">;
  collation: Identifier | StringLiteral;
}

// MySQL, MariaDB
export interface ConstraintVisible extends BaseNode {
  type: "constraint_visible";
  visibleKw: Keyword<"VISIBLE" | "INVISIBLE">;
}

// MySQL, MariaDB
export interface ConstraintColumnFormat extends BaseNode {
  type: "constraint_column_format";
  columnFormatKw: Keyword<"COLUMN_FORMAT">;
  formatKw: Keyword<"FIXED" | "DYNAMIC" | "DEFAULT">;
}

// MySQL, MariaDB, PostgreSQL
export interface ConstraintStorage extends BaseNode {
  type: "constraint_storage";
  storageKw: Keyword<"STORAGE">;
  typeKw: Keyword<
    // MySQL, MariaDB
    | "DISK"
    | "MEMORY"
    // PostgreSQL
    | "PLAIN"
    | "EXTERNAL"
    | "EXTENDED"
    | "MAIN"
    | "DEFAULT"
  >;
}

// MySQL
export interface ConstraintEngineAttribute extends BaseNode {
  type: "constraint_engine_attribute";
  engineAttributeKw: Keyword<"ENGINE_ATTRIBUTE" | "SECONDARY_ENGINE_ATTRIBUTE">;
  hasEq: boolean; // True when "=" sign is used
  value: StringLiteral;
}

// PostgreSQL
export interface ConstraintCompression extends BaseNode {
  type: "constraint_compression";
  compressionKw: Keyword<"COMPRESSION">;
  method: Identifier | Default;
}

// PostgreSQL
export interface ConstraintExclude extends BaseNode {
  type: "constraint_exclude";
  excludeKw: Keyword<"EXCLUDE">;
  using?: UsingAccessMethodClause;
  params: ParenExpr<ListExpr<ExclusionParam>>;
  where?: WhereClause;
}

export interface ExclusionParam extends BaseNode {
  type: "exclusion_param";
  expr: Expr;
  withKw: Keyword<"WITH">;
  operator: PostgresqlOperatorExpr | PostgresqlOperator;
}

export interface OnConflictClause extends BaseNode {
  type: "on_conflict_clause";
  onConflictKw: [Keyword<"ON">, Keyword<"CONFLICT">];
  resolutionKw: Keyword<"ROLLBACK" | "ABORT" | "FAIL" | "IGNORE" | "REPLACE">;
}
