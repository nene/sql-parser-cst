import { alterActionMap } from "./alter_action";
import { alterTableMap } from "./alter_table";
import { analyzeMap } from "./analyze";
import { baseMap } from "./base";
import { bigqueryMap } from "./bigquery";
import { constraintMap } from "./constraint";
import { createTableMap } from "./create_table";
import { dataTypeMap } from "./data_type";
import { dclMap } from "./dcl";
import { deleteMap } from "./delete";
import { dropTableMap } from "./drop_table";
import { explainMap } from "./explain";
import { exprMap } from "./expr";
import { functionMap } from "./function";
import { indexMap } from "./index";
import { insertMap } from "./insert";
import { mergeMap } from "./merge";
import { preparedStatementsMap } from "./prepared_statements";
import { proceduralLanguageMap } from "./procedural_language";
import { procedureMap } from "./procedure";
import { procClauseMap } from "./proc_clause";
import { schemaMap } from "./schema";
import { selectMap } from "./select";
import { sqliteMap } from "./sqlite";
import { transactionMap } from "./transaction";
import { triggerMap } from "./trigger";
import { truncateMap } from "./truncate";
import { updateMap } from "./update";
import { viewMap } from "./view";
import { frameMap } from "./window_frame";
import { FullTransformMap } from "../cstTransformer";
import { mysqlMap } from "./mysql";

export const transformMap: FullTransformMap<string> = {
  ...baseMap,

  // SELECT, INSERT, UPDATE, DELETE, TRUNCATE, MERGE
  ...selectMap,
  ...frameMap, // window frame
  ...insertMap,
  ...updateMap,
  ...deleteMap,
  ...truncateMap,
  ...mergeMap,

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

  // Other
  ...analyzeMap,
  ...explainMap,
  ...transactionMap,
  ...dclMap,
  ...proceduralLanguageMap,
  ...preparedStatementsMap,

  // DB-specific statements
  ...sqliteMap,
  ...bigqueryMap,
  ...mysqlMap,

  // Expressions
  ...exprMap,
  ...dataTypeMap,
};
