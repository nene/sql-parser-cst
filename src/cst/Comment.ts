import { BaseNode, Keyword } from "./Base";
import { CastDefinition } from "./Cast";
import { EntityName, Expr, Identifier, ParenExpr } from "./Expr";
import { NullLiteral, StringLiteral } from "./Literal";
import { NamedDataType } from "./Node";

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
  | CommentTargetAccessMethod
  | CommentTargetCast
  | CommentTargetCollation
  | CommentTargetColumn
  | CommentTargetTableConstraint
  | CommentTargetDomainConstraint
  | CommentTargetConversion
  | CommentTargetDatabase
  | CommentTargetDomain
  | CommentTargetExtension
  | CommentTargetEventTrigger
  | CommentTargetForeignDataWrapper
  | CommentTargetForeignTable
  | CommentTargetIndex
  | CommentTargetLargeObject
  | CommentTargetMaterializedView
  | CommentTargetOperatorClass
  | CommentTargetOperatorFamily
  | CommentTargetPolicy
  | CommentTargetLanguage
  | CommentTargetPublication
  | CommentTargetRole
  | CommentTargetRule
  | CommentTargetSchema
  | CommentTargetSequence
  | CommentTargetServer
  | CommentTargetStatistics
  | CommentTargetSubscription
  | CommentTargetTable
  | CommentTargetTablespace
  | CommentTargetTextSearchConfiguration
  | CommentTargetTextSearchDictionary
  | CommentTargetTextSearchParser
  | CommentTargetTextSearchTemplate
  | CommentTargetTransform
  | CommentTargetTrigger
  | CommentTargetType
  | CommentTargetView;

export interface CommentTargetAccessMethod extends BaseNode {
  type: "comment_target_access_method";
  accessMethodKw: [Keyword<"ACCESS">, Keyword<"METHOD">];
  name: EntityName;
}

export interface CommentTargetCast extends BaseNode {
  type: "comment_target_cast";
  castKw: Keyword<"CAST">;
  args: ParenExpr<CastDefinition>;
}

export interface CommentTargetCollation extends BaseNode {
  type: "comment_target_collation";
  collationKw: Keyword<"COLLATION">;
  name: EntityName;
}

export interface CommentTargetColumn extends BaseNode {
  type: "comment_target_column";
  columnKw: Keyword<"COLUMN">;
  name: EntityName;
}

export interface CommentTargetTableConstraint extends BaseNode {
  type: "comment_target_table_constraint";
  constraintKw: Keyword<"CONSTRAINT">;
  name: EntityName;
  onKw: Keyword<"ON">;
  tableName: EntityName;
}

export interface CommentTargetDomainConstraint extends BaseNode {
  type: "comment_target_domain_constraint";
  constraintKw: Keyword<"CONSTRAINT">;
  name: EntityName;
  onKw: Keyword<"ON">;
  domainKw: Keyword<"DOMAIN">;
  domainName: EntityName;
}

export interface CommentTargetConversion extends BaseNode {
  type: "comment_target_conversion";
  conversionKw: Keyword<"CONVERSION">;
  name: EntityName;
}

export interface CommentTargetDatabase extends BaseNode {
  type: "comment_target_database";
  databaseKw: Keyword<"DATABASE">;
  name: EntityName;
}

export interface CommentTargetDomain extends BaseNode {
  type: "comment_target_domain";
  domainKw: Keyword<"DOMAIN">;
  name: EntityName;
}

export interface CommentTargetExtension extends BaseNode {
  type: "comment_target_extension";
  extensionKw: Keyword<"EXTENSION">;
  name: EntityName;
}

export interface CommentTargetEventTrigger extends BaseNode {
  type: "comment_target_event_trigger";
  eventTriggerKw: [Keyword<"EVENT">, Keyword<"TRIGGER">];
  name: EntityName;
}

export interface CommentTargetForeignDataWrapper extends BaseNode {
  type: "comment_target_foreign_data_wrapper";
  foreignDataWrapperKw: [
    Keyword<"FOREIGN">,
    Keyword<"DATA">,
    Keyword<"WRAPPER">
  ];
  name: EntityName;
}

export interface CommentTargetForeignTable extends BaseNode {
  type: "comment_target_foreign_table";
  foreignTableKw: [Keyword<"FOREIGN">, Keyword<"TABLE">];
  name: EntityName;
}

export interface CommentTargetIndex extends BaseNode {
  type: "comment_target_index";
  indexKw: Keyword<"INDEX">;
  name: EntityName;
}

export interface CommentTargetLargeObject extends BaseNode {
  type: "comment_target_large_object";
  largeObjectKw: [Keyword<"LARGE">, Keyword<"OBJECT">];
  oid: Expr;
}

export interface CommentTargetMaterializedView extends BaseNode {
  type: "comment_target_materialized_view";
  materializedViewKw: [Keyword<"MATERIALIZED">, Keyword<"VIEW">];
  name: EntityName;
}

export interface CommentTargetOperatorClass extends BaseNode {
  type: "comment_target_operator_class";
  operatorClassKw: [Keyword<"OPERATOR">, Keyword<"CLASS">];
  name: EntityName;
  usingKw: Keyword<"USING">;
  methodName: Identifier;
}

export interface CommentTargetOperatorFamily extends BaseNode {
  type: "comment_target_operator_family";
  operatorFamilyKw: [Keyword<"OPERATOR">, Keyword<"FAMILY">];
  name: EntityName;
  usingKw: Keyword<"USING">;
  methodName: Identifier;
}

export interface CommentTargetPolicy extends BaseNode {
  type: "comment_target_policy";
  policyKw: Keyword<"POLICY">;
  name: EntityName;
  onKw: Keyword<"ON">;
  tableName: EntityName;
}

export interface CommentTargetLanguage extends BaseNode {
  type: "comment_target_language";
  languageKw:
    | Keyword<"LANGUAGE">
    | [Keyword<"PROCEDURAL">, Keyword<"LANGUAGE">];
  name: EntityName;
}

export interface CommentTargetPublication extends BaseNode {
  type: "comment_target_publication";
  publicationKw: Keyword<"PUBLICATION">;
  name: EntityName;
}

export interface CommentTargetRole extends BaseNode {
  type: "comment_target_role";
  roleKw: Keyword<"ROLE">;
  name: EntityName;
}

export interface CommentTargetRule extends BaseNode {
  type: "comment_target_rule";
  ruleKw: Keyword<"RULE">;
  name: EntityName;
  onKw: Keyword<"ON">;
  tableName: EntityName;
}

export interface CommentTargetSchema extends BaseNode {
  type: "comment_target_schema";
  schemaKw: Keyword<"SCHEMA">;
  name: EntityName;
}

export interface CommentTargetSequence extends BaseNode {
  type: "comment_target_sequence";
  sequenceKw: Keyword<"SEQUENCE">;
  name: EntityName;
}

export interface CommentTargetServer extends BaseNode {
  type: "comment_target_server";
  serverKw: Keyword<"SERVER">;
  name: EntityName;
}

export interface CommentTargetStatistics extends BaseNode {
  type: "comment_target_statistics";
  statisticsKw: Keyword<"STATISTICS">;
  name: EntityName;
}

export interface CommentTargetSubscription extends BaseNode {
  type: "comment_target_subscription";
  subscriptionKw: Keyword<"SUBSCRIPTION">;
  name: EntityName;
}

export interface CommentTargetTable extends BaseNode {
  type: "comment_target_table";
  tableKw: Keyword<"TABLE">;
  name: EntityName;
}

export interface CommentTargetTablespace extends BaseNode {
  type: "comment_target_tablespace";
  tablespaceKw: Keyword<"TABLESPACE">;
  name: EntityName;
}

export interface CommentTargetTextSearchConfiguration extends BaseNode {
  type: "comment_target_text_search_configuration";
  textSearchConfigurationKw: [
    Keyword<"TEXT">,
    Keyword<"SEARCH">,
    Keyword<"CONFIGURATION">
  ];
  name: EntityName;
}

export interface CommentTargetTextSearchDictionary extends BaseNode {
  type: "comment_target_text_search_dictionary";
  textSearchDictionaryKw: [
    Keyword<"TEXT">,
    Keyword<"SEARCH">,
    Keyword<"DICTIONARY">
  ];
  name: EntityName;
}

export interface CommentTargetTextSearchParser extends BaseNode {
  type: "comment_target_text_search_parser";
  textSearchParserKw: [Keyword<"TEXT">, Keyword<"SEARCH">, Keyword<"PARSER">];
  name: EntityName;
}

export interface CommentTargetTextSearchTemplate extends BaseNode {
  type: "comment_target_text_search_template";
  textSearchTemplateKw: [
    Keyword<"TEXT">,
    Keyword<"SEARCH">,
    Keyword<"TEMPLATE">
  ];
  name: EntityName;
}

export interface CommentTargetTransform extends BaseNode {
  type: "comment_target_transform";
  transformForKw: [Keyword<"TRANSFORM">, Keyword<"FOR">];
  typeName: NamedDataType;
  languageKw: Keyword<"LANGUAGE">;
  languageName: EntityName;
}

export interface CommentTargetTrigger extends BaseNode {
  type: "comment_target_trigger";
  triggerKw: Keyword<"TRIGGER">;
  name: EntityName;
  onKw: Keyword<"ON">;
  tableName: EntityName;
}

export interface CommentTargetType extends BaseNode {
  type: "comment_target_type";
  typeKw: Keyword<"TYPE">;
  name: NamedDataType;
}

export interface CommentTargetView extends BaseNode {
  type: "comment_target_view";
  viewKw: Keyword<"VIEW">;
  name: EntityName;
}
