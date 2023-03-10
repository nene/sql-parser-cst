import { Whitespace, Node } from "./cst/Node";
import { cstTransformer, FullTransformMap } from "./cstTransformer";
import { alterActionMap } from "./showNode/alter_action";
import { alterTableMap } from "./showNode/alter_table";
import { bigqueryMap } from "./showNode/bigquery";
import { constraintMap } from "./showNode/constraint";
import { createTableMap } from "./showNode/create_table";
import { dclMap } from "./showNode/dcl";
import { deleteMap } from "./showNode/delete";
import { dropTableMap } from "./showNode/drop_table";
import { functionMap } from "./showNode/function";
import { indexMap } from "./showNode/index";
import { insertMap } from "./showNode/insert";
import { mergeMap } from "./showNode/merge";
import { preparedStatementsMap } from "./showNode/prepared_statements";
import { proceduralLanguageMap } from "./showNode/procedural_language";
import { procedureMap } from "./showNode/procedure";
import { procClauseMap } from "./showNode/proc_clause";
import { schemaMap } from "./showNode/schema";
import { selectMap } from "./showNode/select";
import { sqliteMap } from "./showNode/sqlite";
import { transactionMap } from "./showNode/transaction";
import { triggerMap } from "./showNode/trigger";
import { truncateMap } from "./showNode/truncate";
import { updateMap } from "./showNode/update";
import { viewMap } from "./showNode/view";
import { frameMap } from "./showNode/window_frame";
import { isDefined, isString } from "./utils/generic";

type NodeArray = (Node | NodeArray | string | undefined)[];

export function show(
  node: Node | NodeArray | string,
  joinString: string = ""
): string {
  if (isString(node)) {
    return node;
  }
  if (node instanceof Array) {
    return node
      .filter(isDefined)
      .map((n) => show(n))
      .join(joinString);
  }

  return [
    showWhitespace(node.leading),
    showNode(node),
    showWhitespace(node.trailing),
  ]
    .filter(isDefined)
    .join("");
}

const showWhitespace = (ws?: Whitespace[]): string | undefined => {
  if (!ws) {
    return undefined;
  }
  return ws.map(showWhitespaceItem).join("");
};

const showWhitespaceItem = (ws: Whitespace): string => ws.text;

const showNode = cstTransformer<string>({
  program: (node) => show(node.statements, ";"),
  empty: () => "",

  // SELECT, INSERT, UPDATE, DELETE, TRUNCATE, MERGE
  ...selectMap,
  ...insertMap,
  ...updateMap,
  ...deleteMap,
  ...truncateMap,
  ...mergeMap,

  // Window frame
  ...frameMap,

  // CREATE/ALTER/DROP TABLE
  ...createTableMap,
  ...constraintMap,
  ...alterTableMap,
  ...alterActionMap,
  ...dropTableMap,

  // CREATE/DROP/ALTER SCHEMA/VIEW/INDEX/TRIGGER
  ...schemaMap,
  ...viewMap,
  ...indexMap,
  ...triggerMap,

  // CREATE/DROP FUNCTION/PROCEDURE
  ...functionMap,
  ...procedureMap,
  ...procClauseMap,

  // ANALYZE statement
  analyze_stmt: (node) => show([node.analyzeKw, node.tableKw, node.tables]),

  // EXPLAIN statement
  explain_stmt: (node) =>
    show([node.explainKw, node.analyzeKw, node.queryPlanKw, node.statement]),

  // Transactions
  ...transactionMap,

  // GRANT & REVOKE
  ...dclMap,

  // Procedural language
  ...proceduralLanguageMap,

  // Prepared statements
  ...preparedStatementsMap,

  // DB-specific statements
  ...sqliteMap,
  ...bigqueryMap,

  // Expressions
  list_expr: (node) => show(node.items, ","),
  paren_expr: (node) => "(" + show(node.expr) + ")",
  pair_expr: (node) => show([node.expr1, node.expr2]),
  binary_expr: (node) => show([node.left, node.operator, node.right]),
  prefix_op_expr: (node) => show([node.operator, node.expr]),
  postfix_op_expr: (node) => show([node.expr, node.operator]),
  func_call: (node) => show([node.name, node.args, node.filter, node.over]),
  func_args: (node) =>
    show([
      node.distinctKw,
      node.args,
      node.nullHandlingKw,
      node.orderBy,
      node.limit,
    ]),
  named_arg: (node) => show([node.name, "=>", node.value]),
  cast_expr: (node) => show([node.castKw, node.args]),
  cast_arg: (node) => show([node.expr, node.asKw, node.dataType, node.format]),
  cast_format: (node) => show([node.formatKw, node.string, node.timezone]),
  cast_format_timezone: (node) => show([node.atTimeZoneKw, node.timezone]),
  raise_expr: (node) => show([node.raiseKw, node.args]),
  raise_expr_type: (node) => show(node.typeKw),
  extract_expr: (node) => show([node.extractKw, node.args]),
  extract_from: (node) => show([node.unit, node.fromKw, node.expr]),
  week_expr: (node) => show([node.weekKw, node.args]),
  filter_arg: (node) => show([node.filterKw, node.where]),
  over_arg: (node) => show([node.overKw, node.window]),
  between_expr: (node) =>
    show([node.left, node.betweenKw, node.begin, node.andKw, node.end]),
  case_expr: (node) => show([node.caseKw, node.expr, node.clauses, node.endKw]),
  case_when: (node) =>
    show([node.whenKw, node.condition, node.thenKw, node.result]),
  case_else: (node) => show([node.elseKw, node.result]),
  interval_expr: (node) => show([node.intervalKw, node.expr, node.unit]),
  interval_unit_range: (node) =>
    show([node.fromUnitKw, node.toKw, node.toUnitKw]),
  typed_expr: (node) => show([node.dataType, node.expr]),
  array_expr: (node) => show(["[", node.expr, "]"]),
  struct_expr: (node) => show(["(", node.expr, ")"]),
  quantifier_expr: (node) => show([node.quantifier, node.expr]),
  full_text_match_expr: (node) =>
    show([node.matchKw, node.columns, node.againstKw, node.args]),
  full_text_match_args: (node) => show([node.expr, node.modifier]),

  // Data types
  data_type: (node) => show([node.nameKw, node.params]),
  generic_type_params: (node) => show(["<", node.params, ">"]),
  array_type_param: (node) => show([node.dataType, node.constraints]),
  struct_type_param: (node) =>
    show([node.name, node.dataType, node.constraints]),

  // Tables & columns
  member_expr: (node) =>
    show(
      [node.object, node.property],
      node.property.type === "array_subscript" ? "" : "."
    ),
  bigquery_quoted_member_expr: (node) => show(["`", node.expr, "`"]),
  array_subscript: (node) => show(["[", node.expr, "]"]),
  array_subscript_specifier: (node) => show([node.specifierKw, node.args]),
  alias: (node) => show([node.expr, node.asKw, node.alias]),
  all_columns: () => "*",

  // special literals
  string_with_charset: (node) => "_" + node.charset + show(node.string),
  datetime_literal: (node) => show([node.datetimeKw, node.string]),
  date_literal: (node) => show([node.dateKw, node.string]),
  time_literal: (node) => show([node.timeKw, node.string]),
  timestamp_literal: (node) => show([node.timestampKw, node.string]),
  json_literal: (node) => show([node.jsonKw, node.string]),
  numeric_literal: (node) => show([node.numericKw, node.string]),
  bignumeric_literal: (node) => show([node.bignumericKw, node.string]),

  // Basic language elements
  keyword: (node) => node.text,
  identifier: (node) => node.text,
  string_literal: (node) => node.text,
  number_literal: (node) => node.text,
  blob_literal: (node) => node.text,
  boolean_literal: (node) => show(node.valueKw),
  null_literal: (node) => show(node.nullKw),
  variable: (node) => node.text,
  parameter: (node) => node.text,

  // Cast to FullTransformMap, so TypeScript ensures all node types are covered
} as FullTransformMap<string>);
