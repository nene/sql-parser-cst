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
import { exprMap } from "./showNode/expr";
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
  ...exprMap,

  // Data types
  data_type: (node) => show([node.nameKw, node.params]),
  generic_type_params: (node) => show(["<", node.params, ">"]),
  array_type_param: (node) => show([node.dataType, node.constraints]),
  struct_type_param: (node) =>
    show([node.name, node.dataType, node.constraints]),

  alias: (node) => show([node.expr, node.asKw, node.alias]),

  // Basic language elements
  keyword: (node) => node.text,
  all_columns: () => "*",

  // Cast to FullTransformMap, so TypeScript ensures all node types are covered
} as FullTransformMap<string>);
