import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { AllCommentNodes } from "../cst/Node";

export const commentMap: FullTransformMap<string, AllCommentNodes> = {
  comment_stmt: (node) =>
    show([node.commentKw, node.onKw, node.target, node.isKw, node.message]),
  comment_target_access_method: (node) =>
    show([node.accessMethodKw, node.name]),
  comment_target_cast: (node) => show([node.castKw, node.args]),
  comment_target_collation: (node) => show([node.collationKw, node.name]),
  comment_target_column: (node) => show([node.columnKw, node.name]),
  comment_target_table_constraint: (node) =>
    show([node.constraintKw, node.name, node.onKw, node.tableName]),
  comment_target_domain_constraint: (node) =>
    show([
      node.constraintKw,
      node.name,
      node.onKw,
      node.domainKw,
      node.domainName,
    ]),
  comment_target_conversion: (node) => show([node.conversionKw, node.name]),
  comment_target_database: (node) => show([node.databaseKw, node.name]),
  comment_target_domain: (node) => show([node.domainKw, node.name]),
  comment_target_extension: (node) => show([node.extensionKw, node.name]),
  comment_target_event_trigger: (node) =>
    show([node.eventTriggerKw, node.name]),
  comment_target_foreign_data_wrapper: (node) =>
    show([node.foreignDataWrapperKw, node.name]),
  comment_target_foreign_table: (node) =>
    show([node.foreignTableKw, node.name]),
  comment_target_index: (node) => show([node.indexKw, node.name]),
  comment_target_large_object: (node) => show([node.largeObjectKw, node.oid]),
  comment_target_materialized_view: (node) =>
    show([node.materializedViewKw, node.name]),
  comment_target_operator_class: (node) =>
    show([node.operatorClassKw, node.name, node.usingKw, node.methodName]),
  comment_target_operator_family: (node) =>
    show([node.operatorFamilyKw, node.name, node.usingKw, node.methodName]),
  comment_target_policy: (node) =>
    show([node.policyKw, node.name, node.onKw, node.tableName]),
  comment_target_language: (node) => show([node.languageKw, node.name]),
  comment_target_publication: (node) => show([node.publicationKw, node.name]),
  comment_target_role: (node) => show([node.roleKw, node.name]),
  comment_target_rule: (node) =>
    show([node.ruleKw, node.name, node.onKw, node.tableName]),
  comment_target_schema: (node) => show([node.schemaKw, node.name]),
  comment_target_sequence: (node) => show([node.sequenceKw, node.name]),
  comment_target_server: (node) => show([node.serverKw, node.name]),
  comment_target_statistics: (node) => show([node.statisticsKw, node.name]),
  comment_target_subscription: (node) => show([node.subscriptionKw, node.name]),
  comment_target_table: (node) => show([node.tableKw, node.name]),
  comment_target_tablespace: (node) => show([node.tablespaceKw, node.name]),
  comment_target_text_search_configuration: (node) =>
    show([node.textSearchConfigurationKw, node.name]),
  comment_target_text_search_dictionary: (node) =>
    show([node.textSearchDictionaryKw, node.name]),
  comment_target_text_search_parser: (node) =>
    show([node.textSearchParserKw, node.name]),
  comment_target_text_search_template: (node) =>
    show([node.textSearchTemplateKw, node.name]),
  comment_target_transform: (node) =>
    show([
      node.transformForKw,
      node.typeName,
      node.languageKw,
      node.languageName,
    ]),
  comment_target_trigger: (node) =>
    show([node.triggerKw, node.name, node.onKw, node.tableName]),
  comment_target_type: (node) => show([node.typeKw, node.name]),
  comment_target_view: (node) => show([node.viewKw, node.name]),
  comment_target_aggregate: (node) =>
    show([node.aggregateKw, node.name, node.params]),
  comment_target_function: (node) =>
    show([node.functionKw, node.name, node.params]),
  comment_target_procedure: (node) =>
    show([node.procedureKw, node.name, node.params]),
  comment_target_routine: (node) =>
    show([node.routineKw, node.name, node.params]),
};
