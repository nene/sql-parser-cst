import { alterActionMap } from "./alter_action";
import { alterTableMap } from "./alter_table";
import { analyzeMap } from "./analyze";
import { baseMap } from "./base";
import { constraintMap } from "./constraint";
import { createTableMap } from "./create_table";
import { dataTypeMap } from "./data_type";
import { dclMap } from "./dcl";
import { deleteMap } from "./delete";
import { doMap } from "./do";
import { domainMap } from "./domain";
import { dropTableMap } from "./drop_table";
import { explainMap } from "./explain";
import { exprMap } from "./expr";
import { functionMap } from "./function";
import { indexMap } from "./index";
import { insertMap } from "./insert";
import { mergeMap } from "./merge";
import { policyMap } from "./policy";
import { preparedStatementsMap } from "./prepared_statements";
import { proceduralLanguageMap } from "./procedural_language";
import { procedureMap } from "./procedure";
import { procClauseMap } from "./proc_clause";
import { roleMap } from "./role";
import { schemaMap } from "./schema";
import { selectMap } from "./select";
import { sequenceMap } from "./sequence";
import { setParameterMap } from "./set_parameter";
import { typeMap } from "./type";
import { transactionMap } from "./transaction";
import { triggerMap } from "./trigger";
import { truncateMap } from "./truncate";
import { updateMap } from "./update";
import { viewMap } from "./view";
import { frameMap } from "./window_frame";
import { FullTransformMap } from "../cstTransformer";
import { renameTableMap } from "./rename_table";
import { otherClausesMap } from "./other_clauses";

import { bigqueryMap } from "./dialects/bigquery";
import { postgresqlMap } from "./dialects/postgresql";
import { sqliteMap } from "./dialects/sqlite";
import { mysqlMap } from "./dialects/mysql";
import { unsupportedGrammarMap } from "./unsupported_grammar";

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
  ...renameTableMap,

  // CREATE/DROP/ALTER SCHEMA/VIEW/INDEX/TRIGGER/SEQUENCE/TYPE/DOMAIN/ROLE/POLICY
  ...schemaMap,
  ...viewMap,
  ...indexMap,
  ...triggerMap,
  ...sequenceMap,
  ...typeMap,
  ...domainMap,
  ...roleMap,
  ...policyMap,

  // CREATE/DROP FUNCTION/PROCEDURE
  ...functionMap,
  ...procedureMap,
  ...procClauseMap,

  // Other
  ...analyzeMap,
  ...doMap,
  ...setParameterMap,
  ...explainMap,
  ...transactionMap,
  ...dclMap,
  ...proceduralLanguageMap,
  ...preparedStatementsMap,
  ...otherClausesMap,

  // DB-specific statements
  ...sqliteMap,
  ...bigqueryMap,
  ...mysqlMap,
  ...postgresqlMap,

  // Expressions
  ...exprMap,
  ...dataTypeMap,

  ...unsupportedGrammarMap,
};
