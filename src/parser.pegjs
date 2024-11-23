{
  import { identity } from "./utils/generic";
  import { readCommaSepList } from "./utils/list";
  import {
    parseHexBlob,
    parseBitBlob,
    parseTextBlob,
  } from "./utils/blob";
  import {
    createBinaryExprChain,
    createBinaryExpr,
    createCastOperatorExprChain,
    createCompoundSelectStmtChain,
    createStringConcatExprChain,
    createJoinExprChain,
    createMemberExprChain,
    createFuncCall,
    createPrefixOpExpr,
    createPostfixOpExpr,
    createKeyword,
    createIdentifier,
    createAlias,
    createParenExpr,
    createListExpr,
    createArrayDataTypeChain,
  } from "./utils/node";
  import {
    trailing,
    surrounding,
  } from "./utils/whitespace";
  import { read } from "./utils/read";
  import {
    setRangeFunction,
    setOptionsFunction,
    isBigquery,
    isMysql,
    isMariadb,
    isSqlite,
    isPostgresql,
    hasParamType,
    isEnabledWhitespace,
    isAcceptUnsupportedGrammar,
  } from "./utils/parserState";
  import { isReservedKeyword } from "./utils/keywords";
  import { loc } from "./utils/loc";

  setRangeFunction(() => [peg$savedPos, peg$currPos]);

  setOptionsFunction(() => options);
}

start
  = c1:__ program:program c2:__ {
    return surrounding(c1, program, c2);
  }

program
  = head:(statement / empty) tail:(__ ";" __ (statement / empty))* {
    return loc({
      type: "program",
      statements: readCommaSepList(head, tail),
    });
  }

statement
  = dml_statement
  / ddl_statement
  / dcl_statement
  / &sqlite x:statement_sqlite { return x; }
  / &mysql x:statement_mysql { return x; }
  / &bigquery x:statement_bigquery { return x; }
  / &postgres x:statement_postgres { return x; }
  / transaction_statement // math BEGIN transaction after BEGIN..END block
  / &{ return isAcceptUnsupportedGrammar(); } x:unsupported_grammar_stmt { return x; }

statement_sqlite
  = analyze_stmt
  / explain_stmt
  / sqlite_statement


statement_mysql
  = proc_statement
  / analyze_stmt
  / explain_stmt
  / execute_stmt

statement_bigquery
  = proc_statement
  / execute_stmt
  / bigquery_statement

statement_postgres
  = analyze_stmt
  / explain_stmt
  / execute_stmt

ddl_statement
  = create_view_stmt
  / drop_view_stmt
  / create_index_stmt
  / drop_index_stmt
  / &postgres x:alter_index_stmt { return x; }
  / &postgres x:alter_index_all_in_tablespace_stmt { return x; }
  / (&postgres / &sqlite) x:reindex_stmt { return x; }
  / &sqlite x:ddl_statement_sqlite { return x; }
  / &mysql x:ddl_statement_mysql { return x; }
  / &bigquery x:ddl_statement_bigquery { return x; }
  / &postgres x:ddl_statement_postgres { return x; }
  / create_table_stmt // CREATE TABLE must be matched after CREATE TABLE FUNCTION
  / drop_table_stmt
  / alter_table_stmt

ddl_statement_sqlite
  = create_trigger_stmt
  / drop_trigger_stmt

ddl_statement_mysql
  = alter_view_stmt
  / rename_table_stmt
  / create_trigger_stmt
  / drop_trigger_stmt
  / create_schema_stmt
  / drop_schema_stmt
  / alter_schema_stmt

ddl_statement_bigquery
  = alter_view_stmt
  / create_function_stmt
  / drop_function_stmt
  / create_procedure_stmt
  / drop_procedure_stmt
  / create_schema_stmt
  / drop_schema_stmt
  / alter_schema_stmt

ddl_statement_postgres
  = alter_view_stmt
  / refresh_materialized_view_stmt
  / create_function_stmt
  / drop_function_stmt
  / alter_function_stmt
  / create_procedure_stmt
  / drop_procedure_stmt
  / alter_procedure_stmt
  / alter_table_all_in_tablespace_stmt
  / create_schema_stmt
  / drop_schema_stmt
  / alter_schema_stmt
  / create_sequence_stmt
  / alter_sequence_stmt
  / drop_sequence_stmt
  / create_trigger_stmt
  / drop_trigger_stmt
  / create_type_stmt
  / alter_type_stmt
  / drop_type_stmt
  / create_domain_stmt
  / alter_domain_stmt
  / drop_domain_stmt
  / create_role_stmt
  / alter_role_stmt
  / drop_role_stmt
  / set_role_stmt
  / reset_role_stmt

dml_statement
  = compound_select_stmt
  / insert_stmt
  / update_stmt
  / delete_stmt
  / (&bigquery / &mysql / &postgres) x:truncate_stmt { return x; }
  / (&bigquery / &postgres) x:merge_stmt { return x; }

empty
  = (&. / end_of_file) {
    return loc({ type: "empty" });
  }

inner_program
  = head:inner_program_statement tail:(__ ";" __ (inner_program_statement / empty))+ {
    return loc({
      type: "program",
      statements: readCommaSepList(head, tail),
    });
  }
  / empty {
    return ({
      type: "program",
      statements: [],
    });
  }

inner_program_statement
  = statement
  / &postgres x:return_stmt { return x; }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * SELECT                                                                               *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
compound_select_stmt
  = head:intersect_select_stmt tail:(__ compound_op __ intersect_select_stmt)* {
    return createCompoundSelectStmtChain(head, tail);
  }

compound_op
  = kws:((UNION / EXCEPT) __ (ALL / DISTINCT)) { return read(kws); }
  / UNION
  / EXCEPT

intersect_select_stmt
  = head:sub_select tail:(__ intersect_op __ sub_select)* {
    return createCompoundSelectStmtChain(head, tail);
  }

sub_select
  = select_stmt
  / paren$compound_select_stmt

intersect_op
  = kws:(INTERSECT __ (ALL / DISTINCT)) { return read(kws); }
  / INTERSECT

select_stmt
  = cte:(with_clause __)?
    select:(select_main_clause / paren$compound_select_stmt)
    otherClauses:(__ other_clause)* {
      return loc({
        type: "select_stmt",
        clauses: [read(cte), read(select), ...otherClauses.map(read)].filter(identity),
      });
  }

select_main_clause
  = select_clause
  / v:values_clause !bigquery { return v; }
  / t:table_clause (&mysql / &postgres) { return t; }

table_clause
  = kw:(TABLE __) table:relation_expr {
    return loc({
      type: "table_clause",
      tableKw: read(kw),
      table,
    });
  }

// Used in cases where we only want to allow TABLE statement, not just any SELECT statement.
// Like in BigQuery VECTOR_SEARCH() function.
table_stmt
  = tableCls:table_clause {
    return loc({
      type: "select_stmt",
      clauses: [tableCls],
    });
  }

/**
 * SELECT .. WITH
 * --------------------------------------------------------------------------------------
 */
with_clause
  = withKw:WITH
    recursiveKw:(__ RECURSIVE)?
    tables:(__ list$common_table_expr) {
      return loc({
        type: "with_clause",
        withKw,
        recursiveKw: read(recursiveKw),
        tables: read(tables),
      });
    }

common_table_expr
  = table:ident
    columns:(__ paren$list$column)?
    asKw:(__ AS)
    materialized:(__ cte_materialized)?
    expr:(__ paren$cte_expr)
    search:(__ cte_search_clause)?
    cycle:(__ cte_cycle_clause)? {
      return loc({
        type: "common_table_expr",
        table: table,
        columns: read(columns),
        asKw: read(asKw),
        materializedKw: read(materialized),
        expr: read(expr),
        search: read(search),
        cycle: read(cycle),
      });
    }

cte_materialized
  = kws:(NOT __ MATERIALIZED / MATERIALIZED) { return read(kws); }

cte_expr
  = compound_select_stmt
  / stmt:(update_stmt / insert_stmt / delete_stmt) &postgres { return stmt; }

cte_search_clause
  = kw:(SEARCH __ (BREADTH / DEPTH) __ FIRST __ BY __) columns:list$ident
    setKw:(__ SET __) result:ident &postgres {
      return loc({
        type: "cte_search_clause",
        searchKw: read(kw),
        columns: columns,
        setKw: read(setKw),
        resultColumn: result,
      });
    }

cte_cycle_clause
  = kw:(CYCLE __) columns:list$ident setKw:(__ SET __) resultColumn:ident
    values:(__ cte_cycle_clause_values)?
    usingKw:(__ USING __) pathColumn:ident &postgres {
      return loc({
        type: "cte_cycle_clause",
        cycleKw: read(kw),
        columns: columns,
        setKw: read(setKw),
        resultColumn: resultColumn,
        values: read(values),
        usingKw: read(usingKw),
        pathColumn: pathColumn,
      });
    }

cte_cycle_clause_values
  = toKw:(TO __) markValue:literal defaultKw:(__ DEFAULT __) defaultValue:literal {
    return loc({
      type: "cte_cycle_clause_values",
      toKw: read(toKw),
      markValue: markValue,
      defaultKw: read(defaultKw),
      defaultValue: defaultValue,
    });
  }

// Other clauses of SELECT statement (besides WITH & SELECT)
other_clause
  = from_clause
  / where_clause
  / group_by_clause
  / having_clause
  / order_by_clause
  / limit_clause
  / window_clause
  / &bigquery x:qualify_clause { return x; }
  / (&postgres / &only_mariadb) x:offset_clause { return x; }
  / (&postgres / &only_mariadb) x:fetch_clause { return x; }
  / &mysql x:(into_variables_clause / into_dumpfile_clause / into_outfile_clause) { return x; }
  / &postgres x:into_table_clause { return x; }
  / (&postgres / &mysql) x:for_clause { return x; }
  / &mysql x:lock_in_share_mode_clause { return x; }

/**
 * SELECT .. columns
 * --------------------------------------------------------------------------------------
 */
select_clause
  = &postgres
    selectKw:SELECT
    modifiers:(__ select_distinct)|0..1|
    columns:(__ select_columns)? {
      return loc({
        type: "select_clause",
        selectKw,
        modifiers: modifiers.map(read),
        columns: read(columns),
      });
    }
  / &mysql
    selectKw:SELECT
    modifiers:(__ (select_distinct / mysql_select_modifier))*
    columns:(__ select_columns) {
      return loc({
        type: "select_clause",
        selectKw,
        modifiers: modifiers.map(read),
        columns: read(columns),
      });
    }
  / &bigquery
    selectKw:SELECT
    modifiers:(__ (select_distinct / bigquery_select_as))|0..2|
    columns:(__ select_columns) {
      return loc({
        type: "select_clause",
        selectKw,
        modifiers: modifiers.map(read),
        columns: read(columns),
      });
    }
  / &sqlite
    selectKw:SELECT
    modifiers:(__ select_distinct)|0..1|
    columns:(__ select_columns) {
      return loc({
        type: "select_clause",
        selectKw,
        modifiers: modifiers.map(read),
        columns: read(columns),
      });
    }

select_distinct
  = kw:ALL {
    return loc({ type: "select_all", allKw: kw });
  }
  / kw:(DISTINCT __ ON __) columns:paren$list$expr &postgres {
    return loc({ type: "select_distinct_on", distinctOnKw: read(kw), columns });
  }
  / kw:DISTINCT {
    return loc({ type: "select_distinct", distinctKw: kw });
  }
  / kw:DISTINCTROW &mysql {
    return loc({ type: "select_distinct", distinctKw: kw });
  }

bigquery_select_as
  = kw:(AS __ STRUCT) {
    return loc({ type: "select_as_struct", asStructKw: read(kw) });
  }
  / kw:(AS __ VALUE) {
    return loc({ type: "select_as_value", asValueKw: read(kw) });
  }

mysql_select_modifier
  = &mysql kw:(
    HIGH_PRIORITY
  / STRAIGHT_JOIN
  / SQL_CALC_FOUND_ROWS
  / k:SQL_CACHE &only_mariadb { return k }
  / SQL_NO_CACHE
  / SQL_BIG_RESULT
  / SQL_SMALL_RESULT
  / SQL_BUFFER_RESULT) {
    return loc({
      type: "mysql_modifier",
      modifierKw: kw,
    });
  }

select_columns
  = head:column_list_item tail:(__ "," __ column_list_item)* trailing:(__ "," __ empty)? {
      return loc(createListExpr(head, trailing ? [...tail, trailing] : tail));
    }

column_list_item
  = expr:star_or_qualified_star kw:(__ EXCEPT __) columns:paren$list$column {
    return loc({
      type: "except_columns",
      expr,
      exceptKw: read(kw),
      columns,
    });
  }
  / expr:star_or_qualified_star kw:(__ REPLACE __) columns:paren$list$alias$expr {
    return loc({
      type: "replace_columns",
      expr,
      replaceKw: read(kw),
      columns,
    });
  }
  / star_or_qualified_star
  / expr:expr alias:(__ alias)? {
    return loc(createAlias(expr, alias));
  }

star_or_qualified_star
  = star
  / qualified_star

qualified_star
  = table:(ident __) "." star:(__ star) {
    return loc({
      type: "member_expr",
      object: read(table),
      property: read(star),
    });
  }

star
  = "*" { return loc({ type: "all_columns" }) }

alias
  = explicit_alias
  / implicit_alias

explicit_alias
  = kw:AS id:(__ explicit_alias_ident) columnAliases:(__ column_aliases)? {
    return {
      asKw: kw,
      alias: read(id),
      columnAliases: read(columnAliases),
    };
  }

// BigQuery allows PIVOT and UNPIVOT as implicit alias names.
// But implicit alias can where PIVOT/UNPIVOT expression can appear.
// So we check if we can treat it as pivot/unpivot_expr, and only if not,
// will we treat it as alias.
implicit_alias
  = &bigquery !(pivot_expr_right / unpivot_expr_right) id:implicit_alias_ident {
    return { alias: id, columnAliases: undefined };
  }
  / !bigquery id:implicit_alias_ident columnAliases:(__ column_aliases)? {
    return { alias: id, columnAliases: read(columnAliases) };
  }

column_aliases = x:paren$list$column (&mysql / &postgres) { return x; }

/**
 * SELECT .. FROM
 * --------------------------------------------------------------------------------------
 */
from_clause
  = kw:(FROM __) expr:(join_expr / dual_table) {
    return loc({
      type: "from_clause",
      fromKw: read(kw),
      expr,
    });
  }

// Exactly like FROM clause, but instead of FROM keyword the USING keyword is used.
// Used by MySQL DELETE statement.
from_using_clause
  = kw:(USING __) expr:(join_expr / dual_table) {
    return loc({
      type: "from_clause",
      fromKw: read(kw),
      expr,
    });
  }

dual_table
  = &mysql kw:DUAL {
    return loc({
      type: "dual_table",
      dualKw: kw,
    });
  }

join_expr
  = head:alias$table_factor
    tail:(
        join_expr_right
      / pivot_expr_right
      / unpivot_expr_right
      / tablesample_expr_right
      / for_system_time_as_of_expr_right
    )* {
      return createJoinExprChain(head, tail);
    }

join_expr_right
  = c1:__ op:(join_op / ",") right:(__ alias$table_factor) spec:(__ join_specification)? {
    return (left: any) => ({
      type: "join_expr",
      left: trailing(left, c1),
      operator: op,
      right: read(right),
      specification: read(spec),
    });
  }

table_factor
  = unnest_with_offset_expr
  / with_ordinality_expr
  / table_func_call
  / lateral_derived_table
  / paren$join_expr
  / paren$compound_select_stmt
  / partitioned_table
  / rows_from_expr
  / relation_expr

relation_expr
  = pg_table_with_inheritance
  / pg_table_without_inheritance
  / sqlite_indexed_table
  / sqlite_not_indexed_table
  / entity_name

sqlite_indexed_table
  = &sqlite table:(alias$entity_name __) kw:(INDEXED __ BY) id:(__ ident) {
    return loc({
      type: "indexed_table",
      table: read(table),
      indexedByKw: read(kw),
      index: read(id),
    });
  }

sqlite_not_indexed_table
  = &sqlite table:(alias$entity_name __) kw:(NOT __ INDEXED) {
    return loc({
      type: "not_indexed_table",
      table: read(table),
      notIndexedKw: read(kw),
    });
  }

pg_table_with_inheritance
  = &postgres table:(entity_name __) "*" {
    return loc({
      type: "table_with_inheritance",
      table: read(table),
    });
  }

pg_table_without_inheritance
  = &postgres kw:(ONLY __) table:(paren$entity_name / entity_name) {
    return loc({
      type: "table_without_inheritance",
      onlyKw: read(kw),
      table: read(table),
    });
  }

table_func_call
  = fn:func_call asKw:(__ AS __) columns:paren$list$column_definition &postgres {
    return loc({
      type: "func_call_with_column_definitions",
      funcCall: fn,
      asKw: read(asKw),
      columns: columns,
    });
  }
  / alias:alias$func_call &{ return alias.type === "alias"; }
    columns:(__ paren$list$column_definition) &postgres {
      return loc({
        type: "func_call_with_column_definitions",
        funcCall: alias,
        asKw: undefined,
        columns: read(columns),
      });
    }
  / func_call

with_ordinality_expr
  = expr:(table_func_call / rows_from_expr) kw:(__ WITH __ ORDINALITY) &postgres {
    return loc({
      type: "with_ordinality_expr",
      expr,
      withOrdinalityKw: read(kw),
    });
  }

lateral_derived_table
  = kw:(LATERAL __) expr:paren$compound_select_stmt (&mysql / &postgres) {
    return loc({
      type: "lateral_derived_table",
      lateralKw: read(kw),
      expr,
    });
  }
  / kw:(LATERAL __) expr:(with_ordinality_expr / rows_from_expr / table_func_call) &postgres {
    return loc({
      type: "lateral_derived_table",
      lateralKw: read(kw),
      expr,
    });
  }

rows_from_expr
  = kw:(ROWS __ FROM __) expr:paren$list$table_func_call &postgres {
    return loc({
      type: "rows_from_expr",
      rowsFromKw: read(kw),
      expr,
    });
  }

partitioned_table
  = &mysql table:(alias$entity_name __) kw:(PARTITION __) partitions:paren$list$ident {
    return loc({
      type: "partitioned_table",
      table: read(table),
      partitionKw: read(kw),
      partitions,
    });
  }

join_op
  = natural_join
  / cross_join
  / join_type
  / kw:STRAIGHT_JOIN &mysql { return kw; }

natural_join
  = kw:(NATURAL __) jt:join_type (&mysql / &sqlite) {
    return [read(kw), ...(jt instanceof Array ? jt : [jt])];
  }

cross_join
  = kws:(CROSS __ JOIN) { return read(kws); }

join_type
  = kws:(
      (left_right_full_kw) __ OUTER __ JOIN
    / (left_right_full_kw) __ JOIN
    / INNER __ JOIN
    / JOIN
  ) { return read(kws); }

left_right_full_kw
  = LEFT
  / RIGHT
  / kw:FULL (&sqlite / &bigquery) { return kw; }

join_specification
  = using_clause / on_clause

using_clause
  = kw:USING expr:(__ paren$list$column) {
    return loc({
      type: "join_using_specification",
      usingKw: kw,
      expr: read(expr),
    });
  }

on_clause
  = kw:ON expr:(__ expr) {
    return loc({
      type: "join_on_specification",
      onKw: kw,
      expr: read(expr),
    });
  }

//
// BigQuery-specific FROM-clause syntax: UNNEST / PIVOT / UNPIVOT / TABLESAMPLE
//

// UNNEST .......................................................
unnest_with_offset_expr
  = &bigquery unnest:alias$unnest_or_member_expr kw:(__ WITH __ OFFSET) {
    return loc({
      type: "unnest_with_offset_expr",
      unnest,
      withOffsetKw: read(kw),
    });
  }
  / &bigquery e:unnest_expr { return e; }

unnest_or_member_expr
  = unnest_expr / member_expr

unnest_expr
  = kw:(UNNEST __) expr:paren$expr {
    return loc({
      type: "unnest_expr",
      unnestKw: read(kw),
      expr,
    });
  }

// PIVOT ........................................................
pivot_expr_right
  = &bigquery c1:__ kw:(PIVOT __) args:paren$pivot_for_in {
    return (left: any) => ({
      type: "pivot_expr",
      left: trailing(left, c1),
      pivotKw: read(kw),
      args,
    });
  }

pivot_for_in
  = fns:(list$alias$func_call __) forKw:(FOR __) col:(column __) inKw:(IN __) pCols:paren$list$alias$expr {
    return loc({
      type: "pivot_for_in",
      aggregations: read(fns),
      forKw: read(forKw),
      inputColumn: read(col),
      inKw: read(inKw),
      pivotColumns: pCols,
    });
  }

// UNPIVOT ......................................................
unpivot_expr_right
  = &bigquery c1:__ kw:(UNPIVOT __)
    nulls:((INCLUDE / EXCLUDE) __ NULLS __)?
    args:paren$unpivot_for_in {
      return (left: any) => ({
        type: "unpivot_expr",
        left: trailing(left, c1),
        unpivotKw: read(kw),
        nullHandlingKw: read(nulls),
        args,
      });
    }

unpivot_for_in
  = vCol:((column / paren$list$column) __)
    forKw:(FOR __) nCol:(column __) inKw:(IN __)
    upCols:(paren$list$alias$column / paren$list$alias$paren$list$column) {
      return loc({
        type: "unpivot_for_in",
        valuesColumn: read(vCol),
        forKw: read(forKw),
        nameColumn: read(nCol),
        inKw: read(inKw),
        unpivotColumns: upCols,
      });
    }

// TABLESAMPLE ........................................................
tablesample_expr_right
  = (&bigquery / &postgres) c1:__ kw:(TABLESAMPLE __)
    method:((tablesample_method / ident) __) args:paren$list$tablesample_arg
    repeatable:(__ tablesample_repeatable)? {
      return (left: any) => ({
        type: "tablesample_expr",
        left: trailing(left, c1),
        tablesampleKw: read(kw),
        method: read(method),
        args,
        repeatable: read(repeatable),
      });
    }

tablesample_method
  = kw:(BERNOULLI / SYSTEM) {
    return loc({ type: "tablesample_method", methodKw: read(kw) });
  }

tablesample_arg = tablesample_percent / expr

tablesample_percent
  = p:(literal / parameter) kw:(__ PERCENT) {
    return loc({
      type: "tablesample_percent",
      percent: p,
      percentKw: read(kw),
    });
  }

tablesample_repeatable
  = kw:(REPEATABLE __) seed:paren$expr {
    return loc({
      type: "tablesample_repeatable",
      repeatableKw: read(kw),
      seed,
    });
  }

// FOR SYSTEM_TIME AS OF ........................................................
for_system_time_as_of_expr_right
  = &bigquery c1:__ kw:(FOR __ SYSTEM_TIME __ AS __ OF __) expr:expr {
    return (left: any) => ({
      type: "for_system_time_as_of_expr",
      left: trailing(left, c1),
      forSystemTimeAsOfKw: read(kw),
      expr,
    });
  }

/**
 * SELECT .. WHERE
 * --------------------------------------------------------------------------------------
 */
where_clause
  = kw:WHERE expr:(__ expr) {
    return loc({
      type: "where_clause",
      whereKw: kw,
      expr: read(expr),
    });
  }

/**
 * SELECT .. GROUP BY
 * --------------------------------------------------------------------------------------
 */
group_by_clause
  = kws:(GROUP __ BY __)
    distinctKw:(group_by_distinct __)?
    list:list$grouping_element
    rolKw:(__ WITH __ ROLLUP)? {
    return loc({
      type: "group_by_clause",
      groupByKw: read(kws),
      distinctKw: read(distinctKw),
      columns: list,
      withRollupKw: read(rolKw),
    });
  }

group_by_distinct
  = kw:(ALL / DISTINCT) &postgres { return kw; }

grouping_element
  = group_by_rollup
  / group_by_cube
  / group_by_grouping_sets
  / paren$empty_list
  / expr

group_by_rollup
  = kw:(ROLLUP __) cols:paren$list$expr (&bigquery / &postgres) {
    return loc({
      type: "group_by_rollup",
      rollupKw: read(kw),
      columns: cols,
    });
  }

group_by_cube
  = kw:(CUBE __) cols:paren$list$expr (&bigquery / &postgres) {
    return loc({
      type: "group_by_cube",
      cubeKw: read(kw),
      columns: cols,
    });
  }

group_by_grouping_sets
  = kw:(GROUPING __ SETS __) columns:paren$list$grouping_element (&bigquery / &postgres) {
    return loc({
      type: "group_by_grouping_sets",
      groupingSetsKw: read(kw),
      columns,
    });
  }

/**
 * SELECT .. HAVING
 * --------------------------------------------------------------------------------------
 */
having_clause
  = kw:HAVING expr:(__ expr) {
    return loc({
      type: "having_clause",
      havingKw: kw,
      expr: read(expr),
    });
  }

/**
 * SELECT .. PARTITION BY
 * --------------------------------------------------------------------------------------
 */
partition_by_clause
  = kws:(PARTITION __ BY __) list:list$expr {
    return loc({
      type: "partition_by_clause",
      partitionByKw: read(kws),
      specifications: list,
    });
  }

/**
 * SELECT? .. PARTITION BY
 * --------------------------------------------------------------------------------------
 */
cluster_by_clause
  = kws:(CLUSTER __ BY __) columns:list$column {
    return loc({
      type: "cluster_by_clause",
      clusterByKw: read(kws),
      columns,
    });
  }

/**
 * SELECT .. ORDER BY
 * --------------------------------------------------------------------------------------
 */
order_by_clause
  = kws:(ORDER __ BY __) l:list$sort_specification rolKw:(__ WITH __ ROLLUP)? {
    return loc({
      type: "order_by_clause",
      orderByKw: read(kws),
      specifications: l,
      withRollupKw: read(rolKw),
    });
  }

sort_specification
  = e:expr direction:(__ sort_direction)? nullsKw:(__ null_handling_keyword)? {
    // don't create full sort_specification node when dealing with just a column name
    if (!direction && !nullsKw && e.type === "identifier") {
      return e;
    }

    return loc({
      type: "sort_specification",
      expr: read(e),
      direction: read(direction),
      ...(nullsKw ? {nullHandlingKw: read(nullsKw)} : {}),
    });
  }

// Very similar to sort_specification, but used when referring to indexes.
// Includes PostgreSQL-specific operator class.
index_specification
  = expr:expr opclass:(__ postgresql_operator_class)? direction:(__ sort_direction)? nullsKw:(__ null_handling_keyword)? {
    return loc({
      type: "index_specification",
      expr,
      opclass: read(opclass),
      direction: read(direction),
      nullHandlingKw: read(nullsKw),
    });
  }

sort_direction
  = kw:ASC {
    return loc({ type: "sort_direction_asc", ascKw: kw });
  }
  / kw:DESC {
    return loc({ type: "sort_direction_desc", descKw: kw });
  }
  / kw:(USING __) op:(postgresql_operator_expr / postgresql_operator) &postgres {
    return loc({
      type: "sort_direction_using_operator",
      usingKw: read(kw),
      operator: read(op),
    });
  }

null_handling_keyword
  = kws:(NULLS __ (FIRST / LAST)) (&sqlite / &postgres) {
    return read(kws);
  }

/**
 * SELECT .. LIMIT
 * --------------------------------------------------------------------------------------
 */
limit_clause
  = kw:LIMIT all:(__ limit_all) &postgres {
    return loc({
      type: "limit_clause",
      limitKw: kw,
      count: read(all),
    });
  }
  / kw:LIMIT count:(__ expr __) offkw:OFFSET offset:(__ expr) ex:(__ limit_rows_examined)? {
    return loc({
      type: "limit_clause",
      limitKw: kw,
      count: read(count),
      offsetKw: offkw,
      offset: read(offset),
      rowsExamined: read(ex),
    });
  }
  / kw:LIMIT offset:(__ expr __) "," count:(__ expr) ex:(__ limit_rows_examined)? (&sqlite / &mysql / &bigquery) {
    return loc({
      type: "limit_clause",
      limitKw: kw,
      offset: read(offset),
      count: read(count),
      rowsExamined: read(ex),
    });
  }
  / kw:LIMIT count:(__ expr) ex:(__ limit_rows_examined)? {
    return loc({
      type: "limit_clause",
      limitKw: kw,
      count: read(count),
      rowsExamined: read(ex),
    });
  }
  / kw:LIMIT ex:(__ limit_rows_examined) {
    return loc({
      type: "limit_clause",
      limitKw: kw,
      rowsExamined: read(ex),
    });
  }

limit_all
  = allKw:ALL {
    return loc({ type: "limit_all", allKw });
  }

limit_rows_examined
  = &only_mariadb kw:(ROWS __ EXAMINED __) count:number_literal {
    return loc({ type: "limit_rows_examined", rowsExaminedKw: read(kw), count });
  }

/**
 * SELECT .. OFFSET .. FETCH
 * --------------------------------------------------------------------------------------
 */
offset_clause
  = kw:(OFFSET __) offset:expr rowsKw:(__ (ROW / ROWS))? {
    return loc({
      type: "offset_clause",
      offsetKw: read(kw),
      offset: read(offset),
      rowsKw: read(rowsKw),
    });
  }

fetch_clause
  = kw:(FETCH __ (FIRST / NEXT) __) count:(number_literal __)? rowsKw:((ROW / ROWS) __) tiesKw:(ONLY / WITH __ TIES) {
    return loc({
      type: "fetch_clause",
      fetchKw: read(kw),
      count: read(count),
      rowsKw: read(rowsKw),
      withTiesKw: read(tiesKw),
    });
  }

/**
 * SELECT .. WINDOW
 * --------------------------------------------------------------------------------------
 */
window_clause
  = kw:(WINDOW __) wins:list$named_window {
    return loc({
      type: "window_clause",
      windowKw: read(kw),
      namedWindows: wins,
    });
  }

named_window
  = name:(ident __) kw:(AS __) def:paren$window_definition {
    return loc({
      type: "named_window",
      name: read(name),
      asKw: read(kw),
      window: def,
    });
  }

window_definition
  = name:window_name?
    partitionBy:(__ partition_by_clause)?
    orderBy:(__ order_by_clause)?
    frame:(__ frame_clause)? {
      return loc({
        type: "window_definition",
        baseWindowName: read(name),
        partitionBy: read(partitionBy),
        orderBy: read(orderBy),
        frame: read(frame),
      });
    }

// In Postgres PARTITION, ROWS and RANGE are not reserved keywords,
// so we have to do an extra check to ensure that they aren't used as a window name.
window_name
  = id:ident !{ return ["PARTITION", "ROWS", "RANGE"].includes(id.name.toUpperCase()); } {
    return id;
  }

frame_clause
  = kw:frame_unit extent:(__ (frame_bound / frame_between))
    exclusion:(__ frame_exclusion)? {
      return loc({
        type: "frame_clause",
        unitKw: kw,
        extent: read(extent),
        exclusion: read(exclusion),
      });
    }

frame_unit
  = ROWS
  / RANGE
  / kw:GROUPS &sqlite { return kw; }

frame_between
  = bKw:BETWEEN begin:(__ frame_bound __) andKw:AND end:(__ frame_bound) {
    return loc({
      type: "frame_between",
      betweenKw: bKw,
      begin: read(begin),
      andKw,
      end: read(end),
    });
  }

frame_bound
  = kws:(CURRENT __ ROW) {
    return loc({ type: "frame_bound_current_row", currentRowKw: read(kws) });
  }
  / expr:((frame_unbounded / literal) __) kw:PRECEDING {
    return loc({ type: "frame_bound_preceding", expr: read(expr), precedingKw: kw });
  }
  / expr:((frame_unbounded / literal) __) kw:FOLLOWING {
    return loc({ type: "frame_bound_following", expr: read(expr), followingKw: kw });
  }

frame_unbounded
  = kw:UNBOUNDED {
    return loc({ type: "frame_unbounded", unboundedKw: kw })
  }

frame_exclusion
  = kw:(EXCLUDE __) kindKw:frame_exclusion_kind {
    return loc({
      type: "frame_exclusion",
      excludeKw: read(kw),
      kindKw
    });
  }

frame_exclusion_kind
  = kws:(CURRENT __ ROW / NO __ OTHERS / GROUP / TIES) { return read(kws); }

/**
 * SELECT .. QUALIFY
 * --------------------------------------------------------------------------------------
 */
qualify_clause
  = kw:QUALIFY expr:(__ expr) {
    return loc({
      type: "qualify_clause",
      qualifyKw: kw,
      expr: read(expr),
    });
  }

/**
 * { UPDATE | INSERT | DELETE } ... RETURNING
 * --------------------------------------------------------------------------------------
 */
returning_clause
  = kw:RETURNING cols:(__ select_columns) {
    return loc({
      type: "returning_clause",
      returningKw: kw,
      columns: read(cols),
    });
  }

/**
 * { UPDATE | DELETE } ... WHERE CURRENT OF cursor
 * --------------------------------------------------------------------------------------
 */
where_current_of_clause
  = kw:(WHERE __ CURRENT __ OF __) cursor:ident {
    return loc({
      type: "where_current_of_clause",
      whereCurrentOfKw: read(kw),
      cursor,
    });
  }

/**
 * SELECT .. INTO
 * --------------------------------------------------------------------------------------
 */
into_table_clause
  = kw:(INTO __) kind:(table_kind __)? tableKw:(TABLE __)? name:entity_name {
    return loc({
      type: "into_table_clause",
      intoKw: read(kw),
      kind: read(kind),
      tableKw: read(tableKw),
      name,
    });
  }

into_variables_clause
  = kw:(INTO __) vars:list$variable {
    return loc({
      type: "into_variables_clause",
      intoKw: read(kw),
      variables: vars,
    });
  }

into_dumpfile_clause
  = kw:(INTO __ DUMPFILE __) filename:string_literal {
    return loc({
      type: "into_dumpfile_clause",
      intoDumpfileKw: read(kw),
      filename: read(filename),
    });
  }

into_outfile_clause
  = kw:(INTO __ OUTFILE __) filename:string_literal
    charset:(__ outfile_option_character_set)?
    fields:(__ outfile_fields)?
    lines:(__ outfile_lines)? {
      return loc({
        type: "into_outfile_clause",
        intoOutfileKw: read(kw),
        filename: read(filename),
        charset: read(charset),
        fields: read(fields),
        lines: read(lines),
      });
    }

outfile_option_character_set
  = kw:(CHARACTER __ SET __) value:ident {
    return loc({
      type: "outfile_option_character_set",
      characterSetKw: read(kw),
      value,
    });
  }

outfile_fields
  = kw:(FIELDS / COLUMNS) opts:(__ outfile_fields_option)+ {
    return loc({
      type: "outfile_fields",
      fieldsKw: read(kw),
      options: opts.map(read),
    });
  }

outfile_fields_option
  = outfile_option_terminated_by
  / outfile_option_enclosed_by
  / outfile_option_escaped_by

outfile_lines
  = kw:(LINES) opts:(__ outfile_lines_option)+ {
    return loc({
      type: "outfile_lines",
      linesKw: read(kw),
      options: opts.map(read),
    });
  }

outfile_lines_option
  = outfile_option_starting_by
  / outfile_option_terminated_by

outfile_option_terminated_by
  = kw:(TERMINATED __ BY __) value:string_literal {
    return loc({
      type: "outfile_option_terminated_by",
      terminatedByKw: read(kw),
      value,
    });
  }

outfile_option_enclosed_by
  = opt:(OPTIONALLY __)? kw:(ENCLOSED __ BY __) value:string_literal {
    return loc({
      type: "outfile_option_enclosed_by",
      optionallyKw: read(opt),
      enclosedByKw: read(kw),
      value,
    });
  }

outfile_option_starting_by
  = kw:(STARTING __ BY __) value:string_literal {
    return loc({
      type: "outfile_option_starting_by",
      startingByKw: read(kw),
      value,
    });
  }

outfile_option_escaped_by
  = kw:(ESCAPED __ BY __) value:string_literal {
    return loc({
      type: "outfile_option_escaped_by",
      escapedByKw: read(kw),
      value,
    });
  }

/**
 * SELECT .. FOR
 * --------------------------------------------------------------------------------------
 */
for_clause
  = kw:(FOR __) strength:lock_strength tables:(__ for_clause_tables)? waitingKw:(__ NOWAIT / __ SKIP __ LOCKED)? {
    return loc({
      type: "for_clause",
      forKw: read(kw),
      lockStrengthKw: read(strength),
      tables: read(tables),
      waitingKw: read(waitingKw),
    });
  }

lock_strength
  = UPDATE / NO __ KEY __ UPDATE / SHARE / KEY __ SHARE

for_clause_tables
  = kw:(OF __) tables:list$ident {
    return loc({
      type: "for_clause_tables",
      ofKw: read(kw),
      tables,
    });
  }

/**
 * SELECT .. LOCK IN SHARE MODE
 * --------------------------------------------------------------------------------------
 */
lock_in_share_mode_clause
  = kw:(LOCK __ IN __ SHARE __ MODE) {
    return loc({
      type: "lock_in_share_mode_clause",
      lockInShareModeKw: read(kw),
    });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * INSERT INTO                                                                          *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
insert_stmt
  = withCls:(with_clause __)?
    insertCls:insert_clause
    overridingCls:(__ overriding_clause)?
    source:(__ insert_source)
    aliasCls:(__ row_alias_clause)?
    updateCls:(__ on_duplicate_key_update_clause)?
    upsert:(__ upsert_clause)*
    returning:(__ returning_clause)? {
      return loc({
        type: "insert_stmt",
        clauses: [
          read(withCls),
          insertCls,
          read(overridingCls),
          read(source),
          read(aliasCls),
          read(updateCls),
          ...upsert.map(read),
          read(returning),
        ].filter(identity),
      });
    }

insert_clause
  = insertKw:(INSERT / REPLACE)
    modifiers:(__ mysql_upsert_modifier)*
    orAction:(__ or_alternate_action)?
    intoKw:(__ INTO)?
    table:(__ (partitioned_table / table_or_explicit_alias))
    columns:(__ paren$list$column)? {
      return loc({
        type: "insert_clause",
        insertKw,
        modifiers: modifiers.map(read),
        orAction: read(orAction),
        intoKw: read(intoKw),
        table: read(table),
        columns: read(columns),
      });
    }

mysql_upsert_modifier
  = kw:(LOW_PRIORITY / DELAYED / HIGH_PRIORITY / IGNORE) &mysql {
    return loc({ type: "mysql_modifier", modifierKw: kw });
  }

or_alternate_action
  = or:(OR __) act:(ABORT / FAIL / IGNORE / REPLACE / ROLLBACK) &sqlite {
    return loc({
      type: "or_alternate_action",
      orKw: read(or),
      actionKw: read(act)
    });
  }

table_or_explicit_alias
  = t:entity_name alias:(__ explicit_alias)? {
    return loc(createAlias(t, alias));
  }

overriding_clause
  = kw:(OVERRIDING __ (SYSTEM / USER) __ VALUE) &postgres {
    return loc({
      type: "overriding_clause",
      overridingKw: read(kw),
    });
  }

insert_source
  = values_clause
  / compound_select_stmt
  / default_values
  / &mysql x:set_clause { return x; }

values_clause
  = kw:values_kw values:(__ list$values_row) {
    return loc({
      type: "values_clause",
      valuesKw: kw,
      values: read(values),
    });
  }

values_kw
  = VALUES
  / kw:VALUE &mysql { return kw; }

values_row
  = &sqlite list:paren$list$expr { return list; }
  / (&bigquery / &postgres) list:paren$list$expr_or_default { return list; }
  / &mysql list:(paren$list$expr_or_default / row_constructor) { return list; }

row_constructor
  = kw:(ROW __) row:paren$list$expr_or_default {
    return loc({
      type: "row_constructor",
      rowKw: read(kw),
      row,
    });
  }

array_constructor
  = kw:(ARRAY __) expr:select_stmt {
    return loc({
      type: "array_constructor",
      arrayKw: read(kw),
      expr: expr,
    });
  }

expr_or_default
  = expr / default

default
  = kw:DEFAULT {
    return loc({ type: "default", defaultKw: kw });
  }

default_values
  = kws:(DEFAULT __ VALUES) {
      return loc({ type: "default_values", defaultValuesKw: read(kws) });
    }

upsert_clause
  = kw:(ON __ CONFLICT __) target:(conflict_target __)? where:(where_clause __)?
    doKw:DO action:(__ upsert_action)
    (&sqlite / &postgres) {
      return loc({
        type: "upsert_clause",
        onConflictKw: read(kw),
        conflictTarget: read(target),
        where: read(where),
        doKw,
        action: read(action),
      });
    }

conflict_target
  = paren$list$index_specification
  / conflict_target_on_constraint

conflict_target_on_constraint
  = kw:(ON __ CONSTRAINT __) name:ident {
    return loc({
      type: "conflict_target_on_constraint",
      onConstraintKw: read(kw),
      constraint: name,
    });
  }

upsert_action
  = kw:NOTHING {
    return loc({
      type: "upsert_action_nothing",
      nothingKw: kw,
    });
  }
  / kw:UPDATE set:(__ set_clause) where:(__ where_clause)? {
    return loc({
      type: "upsert_action_update",
      updateKw: kw,
      set: read(set),
      where: read(where),
    });
  }

row_alias_clause
  = &mysql kw:(AS __) row:ident cols:(__ paren$list$ident)? {
    return loc({
      type: "row_alias_clause",
      asKw: read(kw),
      rowAlias: read(row),
      columnAliases: read(cols),
    });
  }

on_duplicate_key_update_clause
  = &mysql kw:(ON __ DUPLICATE __ KEY __ UPDATE __) assignments:list$column_assignment {
    return loc({
      type: "on_duplicate_key_update_clause",
      onDuplicateKeyUpdateKw: read(kw),
      assignments,
    });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * UPDATE                                                                               *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
update_stmt
  = withClause:(with_clause __)?
    updateClause:(update_clause __)
    setClause:set_clause
    clauses:(__ other_update_clause)* {
      return loc({
        type: "update_stmt",
        clauses: [
          read(withClause),
          read(updateClause),
          read(setClause),
          ...clauses.map(read),
        ].filter(identity),
      });
    }

update_clause
  = kw:(UPDATE __)
    modifiers:(mysql_upsert_modifier __)*
    orAction:(or_alternate_action __)?
    tables:list$alias$relation_expr {
      return loc({
        type: "update_clause",
        updateKw: read(kw),
        modifiers: modifiers.map(read),
        orAction: read(orAction),
        tables: tables,
      });
    }

set_clause
  = kw:(SET __) set:list$column_assignment {
    return loc({
      type: "set_clause",
      setKw: read(kw),
      assignments: set,
    });
  }

other_update_clause
  = from_clause
  / x:where_current_of_clause &postgres { return x; }
  / where_clause
  / returning_clause
  / order_by_clause
  / limit_clause

column_assignment
  = col:((optionally_qualified_column / paren$list$column) __) "=" expr:(__ column_value) {
    return loc({
      type: "column_assignment",
      column: read(col),
      expr: read(expr),
    });
  }

column_value
  = x:default (&mysql / &postgres) { return x; }
  / expr

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * DELETE FROM                                                                          *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
delete_stmt
  = withClause:(with_clause __)?
    deleteClause:delete_clause
    clauses:(__ other_delete_clause)* {
      return loc({
        type: "delete_stmt",
        clauses: [
          read(withClause),
          read(deleteClause),
          ...clauses.map(read),
        ].filter(identity),
      });
    }

delete_clause
  = delKw:(DELETE __) modifiers:(mysql_delete_modifier __)* fromKw:(FROM __)?
    tables:(list$delete_clause_table) {
      return loc({
        type: "delete_clause",
        deleteKw: read(delKw),
        modifiers: modifiers.map(read),
        fromKw: read(fromKw),
        tables,
      });
    }

mysql_delete_modifier
  = &mysql kw:(LOW_PRIORITY / QUICK / IGNORE) {
    return loc({ type: "mysql_modifier", modifierKw: kw });
  }

delete_clause_table
  = &mysql x:qualified_star { return x; }
  / partitioned_table
  / alias$relation_expr

other_delete_clause
  = where_current_of_clause
  / where_clause
  / returning_clause
  / order_by_clause
  / limit_clause
  / x:from_using_clause (&mysql / &postgres) { return x; }
  / x:from_clause &mysql { return x; }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * TRUNCATE TABLE                                                                       *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
truncate_stmt
  = kw:(TRUNCATE __) tableKw:(TABLE __)? tables:list$relation_expr
    resConKw:(__ (RESTART / CONTINUE) __ IDENTITY)?
    behaviorKw:(__ (CASCADE / RESTRICT))? {
      return loc({
        type: "truncate_stmt",
        truncateKw: read(kw),
        tableKw: read(tableKw),
        tables: tables,
        restartOrContinueKw: read(resConKw),
        behaviorKw: read(behaviorKw),
      });
    }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * MERGE                                                                                *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
merge_stmt
  = withClause:(with_clause __)?
    mergeClause:merge_clause
    clauses:(__ merge_when_clause)+ {
      return loc({
        type: "merge_stmt",
        clauses: [
          read(withClause),
          read(mergeClause),
          ...clauses.map(read),
        ].filter(identity),
      });
    }

merge_clause
  = mergeKw:(MERGE __) intoKw:(INTO __)? target:(alias$relation_expr __)
    usingKw:(USING __) source:((alias$relation_expr / alias$paren$compound_select_stmt) __)
    onKw:(ON __) condition:expr {
      return loc({
        type: "merge_clause",
        mergeKw: read(mergeKw),
        intoKw: read(intoKw),
        target: read(target),
        usingKw: read(usingKw),
        source: read(source),
        onKw: read(onKw),
        condition,
      });
    }

merge_when_clause
  = whenKw:(WHEN __) matchedKw:(MATCHED __ / NOT __ MATCHED __) byKw:(BY __ (TARGET / SOURCE) __)?
    condition:(merge_when_condition __)?
    thenKw:(THEN __) action:merge_action {
      return loc({
        type: "merge_when_clause",
        whenKw: read(whenKw),
        matchedKw: read(matchedKw),
        byKw: read(byKw),
        condition: read(condition),
        thenKw: read(thenKw),
        action,
      });
    }

merge_when_condition
  = kw:(AND __) e:expr {
    return loc({
      type: "merge_when_condition",
      andKw: read(kw),
      expr: e,
    });
  }

merge_action
  = x:merge_action_do_nothing &postgres { return x; }
  / merge_action_delete
  / merge_action_update
  / merge_action_insert

merge_action_do_nothing
  = kw:(DO __ NOTHING) {
    return loc({
      type: "merge_action_do_nothing",
      doNothingKw: read(kw),
    });
  }

merge_action_delete
  = kw:DELETE {
    return loc({
      type: "merge_action_delete",
      deleteKw: kw,
    });
  }

merge_action_update
  = updateKw:(UPDATE __) set:set_clause {
    return loc({
      type: "merge_action_update",
      updateKw: read(updateKw),
      set,
    });
  }

merge_action_insert
  = insertKw:(INSERT __) columns:(paren$list$column __)?
    overriding:(overriding_clause __)?
    values:(values_clause / default_values / merge_action_insert_row_clause) {
      return loc({
        type: "merge_action_insert",
        insertKw: read(insertKw),
        columns: read(columns),
        clauses: [
          read(overriding),
          values
        ].filter(identity),
      });
    }

merge_action_insert_row_clause
  = rowKw:ROW &bigquery {
    return loc({ type: "merge_action_insert_row_clause", rowKw });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * CREATE VIEW  /  DROP VIEW                                                            *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
create_view_stmt
  = createKw:CREATE
    repKw:(__ OR __ REPLACE)?
    kinds:(__ view_kind)*
    viewKw:(__ VIEW)
    ifKw:(__ if_not_exists)?
    name:(__ entity_name)
    cols:(__ paren$list$view_column_definition)?
    clauses:(__ create_view_clause)+ {
      return loc({
        type: "create_view_stmt",
        createKw,
        orReplaceKw: read(repKw),
        kinds: kinds.map(read),
        viewKw: read(viewKw),
        ifNotExistsKw: read(ifKw),
        name: read(name),
        columns: read(cols),
        clauses: clauses.map(read),
      });
    }

view_kind
  = kw:(TEMP / TEMPORARY) (&sqlite / &postgres) {
    return loc({ type: "relation_kind", kindKw: kw });
  }
  / kw:RECURSIVE &postgres {
    return loc({ type: "relation_kind", kindKw: read(kw) });
  }
  / kw:MATERIALIZED (&bigquery / &postgres) {
    return loc({ type: "relation_kind", kindKw: kw });
  }

// Just like column_definition, but with the only possible constraint being bigquery OPTIONS()
view_column_definition
  = name:ident constraints:(__ bigquery_options)|0..1| {
    return loc({
      type: "column_definition",
      name,
      constraints: constraints.map(read),
    });
  }

create_view_clause
  = as_clause$compound_select_stmt
  / &bigquery op:bigquery_create_view_clause { return op; }
  / &postgres op:postgres_create_view_clause { return op; }

bigquery_create_view_clause
  = bigquery_options
  / cluster_by_clause
  / partition_by_clause
  / as_replica_of_clause

postgres_create_view_clause
  = postgresql_with_options
  / with_check_option_clause
  / using_access_method_clause
  / tablespace_clause
  / with_data_clause

with_check_option_clause
  = kw:(WITH __) levelKw:((LOCAL / CASCADED) __)? checkOptionKw:(CHECK __ OPTION) {
    return loc({
      type: "with_check_option_clause",
      withKw: read(kw),
      levelKw: read(levelKw),
      checkOptionKw: read(checkOptionKw),
    });
  }

as_replica_of_clause
  = kw:(AS __ REPLICA __ OF __) view:entity_name {
    return loc({
      type: "as_replica_of_clause",
      asReplicaOfKw: read(kw),
      view,
    });
  }

drop_view_stmt
  = dropKw:DROP
    kind:(__ view_kind)?
    viewKw:(__ VIEW)
    ifKw:(__ if_exists)?
    views:(__ list$entity_name)
    behaviorKw:(__ (CASCADE / RESTRICT))? {
      return loc({
        type: "drop_view_stmt",
        dropKw: read(dropKw),
        kind: read(kind),
        viewKw: read(viewKw),
        ifExistsKw: read(ifKw),
        views: read(views),
        behaviorKw: read(behaviorKw),
      });
    }

alter_view_stmt
  = alterKw:ALTER
    kind:(__ view_kind)?
    viewKw:(__ VIEW)
    ifKw:(__ if_exists)?
    name:(__ entity_name)
    cols:(__ paren$list$column)?
    actions:(__ list$alter_view_action) {
      return loc({
        type: "alter_view_stmt",
        alterKw,
        kind: read(kind),
        viewKw: read(viewKw),
        ifExistsKw: read(ifKw),
        name: read(name),
        columns: read(cols),
        actions: read(actions),
      });
    }

alter_view_action
  = &bigquery ac:(alter_action_set_bigquery_options / alter_action_alter_column) { return ac; }
  / &mysql ac:as_clause$compound_select_stmt { return ac; }
  / &postgres ac:alter_view_action_postgres { return ac; }

alter_view_action_postgres
  = alter_action_rename
  / alter_action_rename_column
  / alter_action_owner_to
  / alter_action_alter_column
  / alter_action_set_schema
  / alter_action_set_tablespace
  / alter_action_set_access_method
  / alter_action_cluster_on
  / alter_action_set_without_cluster
  / alter_action_set_postgresql_options
  / alter_action_reset_postgresql_options
  / alter_action_depends_on_extension
  / alter_action_no_depends_on_extension

refresh_materialized_view_stmt
  = kw:(REFRESH __ MATERIALIZED __ VIEW __)
    concurrentlyKw:(CONCURRENTLY __)?
    name:entity_name
    clauses:(__ with_data_clause)|0..1| {
      return loc({
        type: "refresh_materialized_view_stmt",
        refreshMaterializedViewKw: read(kw),
        concurrentlyKw: read(concurrentlyKw),
        name,
        clauses: clauses.map(read),
      });
    }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * CREATE INDEX  /  DROP INDEX                                                          *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
create_index_stmt
  = (&mysql / &sqlite / &bigquery)
    kw:(CREATE __)
    orReplaceKw:(OR __ REPLACE __)?
    typeKw:(index_type_kw __)?
    indexKw:(INDEX __)
    ifKw:(if_not_exists __)?
    name:(entity_name __)?
    onKw:(ON __)
    table:(entity_name __)
    columns:(paren$list$index_specification / paren$verbose_all_columns)
    clauses:(__ create_index_subclause)* {
      return loc({
        type: "create_index_stmt",
        createKw: read(kw),
        orReplaceKw: read(orReplaceKw),
        indexTypeKw: read(typeKw),
        indexKw: read(indexKw),
        ifNotExistsKw: read(ifKw),
        name: read(name),
        onKw: read(onKw),
        table: read(table),
        columns,
        clauses: clauses.map(read),
      });
    }
  / &postgres
    kw:(CREATE __)
    typeKw:(index_type_kw __)?
    indexKw:(INDEX __)
    concurrentlyKw:(CONCURRENTLY __)?
    ifKw:(if_not_exists __)?
    name:(entity_name __)?
    onKw:(ON __)
    table:((pg_table_without_inheritance / entity_name) __)
    using:(using_access_method_clause __)?
    columns:paren$list$index_specification
    clauses:(__ create_index_subclause)* {
      return loc({
        type: "create_index_stmt",
        createKw: read(kw),
        indexTypeKw: read(typeKw),
        indexKw: read(indexKw),
        concurrentlyKw: read(concurrentlyKw),
        ifNotExistsKw: read(ifKw),
        name: read(name),
        onKw: read(onKw),
        table: read(table),
        using: read(using),
        columns,
        clauses: clauses.map(read),
      });
    }

index_type_kw
  = x:UNIQUE (&mysql / &sqlite / &postgres) { return x; }
  / x:FULLTEXT &mysql { return x; }
  / x:SPATIAL &mysql { return x; }
  / x:SEARCH &bigquery { return x; }
  / x:VECTOR &bigquery { return x; }

create_index_subclause
  = (&sqlite / &postgres) x:where_clause { return x; }
  / &bigquery x:bigquery_options { return x; }
  / &postgres x:(
      tablespace_clause
    / postgresql_with_options
    / index_include_clause
    / index_nulls_distinct_clause
    / index_nulls_not_distinct_clause
  ) { return x; }

verbose_all_columns
  = &bigquery kws:(ALL __ COLUMNS) {
    return loc({ type: "verbose_all_columns", allColumnsKw: read(kws) })
  }

index_include_clause
  = kw:(INCLUDE __) columns:paren$list$column {
    return loc({
      type: "index_include_clause",
      includeKw: read(kw),
      columns,
    });
  }

index_nulls_distinct_clause
  = kw:(NULLS __ DISTINCT) {
    return loc({ type: "index_nulls_distinct_clause", nullsDistinctKw: read(kw) });
  }

index_nulls_not_distinct_clause
  = kw:(NULLS __ NOT __ DISTINCT) {
    return loc({ type: "index_nulls_not_distinct_clause", nullsNotDistinctKw: read(kw) });
  }

// DROP INDEX
drop_index_stmt
  = (&sqlite / &postgres)
    kw:(DROP __)
    indexKw:(INDEX __)
    concurrentlyKw:(CONCURRENTLY __)?
    ifKw:(if_exists __)?
    indexes:list$entity_name behaviorKw:(__ (CASCADE / RESTRICT))? {
      return loc({
        type: "drop_index_stmt",
        dropKw: read(kw),
        indexKw: read(indexKw),
        concurrentlyKw: read(concurrentlyKw),
        ifExistsKw: read(ifKw),
        indexes: read(indexes),
        behaviorKw: read(behaviorKw),
      });
    }
  / (&mysql / &bigquery)
    kw:(DROP __)
    indexTypeKw:(SEARCH __)?
    indexKw:(INDEX __)
    ifKw:(if_exists __)?
    indexes:(list$entity_name __)
    onKw:(ON __)
    table:entity_name {
      return loc({
        type: "drop_index_stmt",
        dropKw: read(kw),
        indexTypeKw: read(indexTypeKw),
        indexKw: read(indexKw),
        ifExistsKw: read(ifKw),
        indexes: read(indexes),
        onKw: read(onKw),
        table,
      });
    }

alter_index_stmt
  = kw:(ALTER __) indexKw:(INDEX __) ifExistsKw:(if_exists __)?
    index:entity_name
    action:(__ alter_index_action) {
      return loc({
        type: "alter_index_stmt",
        alterKw: read(kw),
        indexKw: read(indexKw),
        ifExistsKw: read(ifExistsKw),
        index,
        action: read(action),
      });
    }

alter_index_action
  = alter_action_rename
  / alter_action_set_tablespace
  / alter_action_depends_on_extension
  / alter_action_no_depends_on_extension
  / alter_action_set_postgresql_options
  / alter_action_reset_postgresql_options
  / alter_action_alter_column
  / alter_action_attach_partition

alter_index_all_in_tablespace_stmt
  = kw:(ALTER __ INDEX __)
    allInTablespaceKw:(ALL __ IN __ TABLESPACE __)
    tablespace:(ident __)
    ownedBy:(owned_by_clause __)?
    action:alter_action_set_tablespace {
      return loc({
        type: "alter_index_all_in_tablespace_stmt",
        alterIndexKw: read(kw),
        allInTablespaceKw: read(allInTablespaceKw),
        tablespace: read(tablespace),
        ownedBy: read(ownedBy),
        action,
      });
    }

reindex_stmt
  = &sqlite kw:REINDEX name:(__ entity_name)? {
      return loc({ type: "reindex_stmt", reindexKw: kw, name: read(name) });
    }
  / &postgres
    kw:REINDEX
    options:(__ paren$list$reindex_option)?
    targetKw:(__ (INDEX / SCHEMA / SYSTEM / TABLE / DATABASE))
    concurrentlyKw:(__ CONCURRENTLY)?
    name:(__ entity_name)? {
      return loc({
        type: "reindex_stmt",
        reindexKw: kw,
        options: read(options),
        targetKw: read(targetKw),
        concurrentlyKw: read(concurrentlyKw),
        name: read(name),
      });
    }

reindex_option
  = reindex_option_concurrently
  / reindex_option_tablespace
  / reindex_option_verbose

reindex_option_concurrently
  = kw:CONCURRENTLY value:(__ boolean_literal)? {
    return loc({ type: "reindex_option_concurrently", concurrentlyKw: read(kw), value: read(value) });
  }

reindex_option_tablespace
  = kw:(TABLESPACE __) name:ident {
    return loc({ type: "reindex_option_tablespace", tablespaceKw: read(kw), name });
  }

reindex_option_verbose
  = kw:VERBOSE value:(__ boolean_literal)? {
    return loc({ type: "reindex_option_verbose", verboseKw: kw, value: read(value) });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * CREATE TABLE                                                                         *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
create_table_stmt
  = createKw:CREATE
    replKw:(__ OR __ REPLACE)?
    kind:(__ table_kind)?
    tableKw:(__ TABLE)
    ifKw:(__ if_not_exists)?
    name:(__ entity_name)
    partitionOf:(__ create_table_partition_of_clause)?
    ofType:(__ create_table_of_type_clause)?
    columns:(__ paren$list$create_definition)?
    options:(__ table_options)?
    clauses:(__ create_table_clause)*
    {
      return loc({
        type: "create_table_stmt",
        createKw,
        orReplaceKw: read(replKw),
        kind: read(kind),
        tableKw: read(tableKw),
        ifNotExistsKw: read(ifKw),
        name: read(name),
        partitionOf: read(partitionOf),
        ofType: read(ofType),
        columns: read(columns),
        options: read(options),
        clauses: clauses.map(read),
      });
    }

table_kind
  = kw:(TEMP / TEMPORARY) {
    return loc({ type: "relation_kind", kindKw: kw });
  }
  / kw:((GLOBAL / LOCAL) __ (TEMPORARY / TEMP)) &postgres {
    return loc({ type: "relation_kind", kindKw: read(kw) });
  }
  / kw:(UNLOGGED / FOREIGN) &postgres {
    return loc({ type: "relation_kind", kindKw: kw });
  }
  / kw:(EXTERNAL / SNAPSHOT) &bigquery {
    return loc({ type: "relation_kind", kindKw: kw });
  }
  / kw:VIRTUAL &sqlite {
    return loc({ type: "relation_kind", kindKw: kw });
  }

if_not_exists
  = kws:(IF __ NOT __ EXISTS) { return read(kws); }

create_definition
  = c:table_constraint { return c; }
  / (&postgres / &mysql) c:create_table_like_clause { return c; }
  / column_definition

column_definition
  = name:ident
    type:(__ data_type)?
    withOptionsKw:(__ WITH __ OPTIONS)?
    constraints:(__ column_constraint)* {
      return loc({
        type: "column_definition",
        name,
        dataType: read(type),
        withOptionsKw: read(withOptionsKw),
        constraints: constraints.map(read),
      });
    }

create_table_partition_of_clause
  = kw:(PARTITION __ OF __) table:entity_name &postgres {
    return loc({
      type: "create_table_partition_of_clause",
      partitionOfKw: read(kw),
      table,
    });
  }

create_table_of_type_clause
  = kw:(OF __) typeName:entity_name &postgres {
    return loc({
      type: "create_table_of_type_clause",
      ofKw: read(kw),
      typeName,
    });
  }

create_table_clause
  = as_clause$compound_select_stmt
  / (&bigquery / &mysql) x:create_table_like_clause { return x; }
  / &bigquery x:create_table_clause_bigquery { return x; }
  / &sqlite x:create_table_using_clause { return x; }
  / &postgres x:create_table_clause_postgresql { return x; }

create_table_like_clause
  = kw:(LIKE __) name:entity_name options:(__ table_like_option)* {
    return loc({
      type: "create_table_like_clause",
      likeKw: read(kw),
      name,
      options: options.map(read),
    });
  }

table_like_option
  = kw:((INCLUDING / EXCLUDING) __)
    optionKw:(COMMENTS / COMPRESSION / CONSTRAINTS / DEFAULTS / GENERATED / IDENTITY / INDEXES / STATISTICS / STORAGE / ALL) {
      return loc({
        type: "table_like_option",
        includingOrExcludingKw: read(kw),
        optionKw,
      });
    }

create_table_clause_bigquery
  = create_table_copy_clause
  / create_table_clone_clause
  / bigquery_options
  / bigquery_option_default_collate
  / partition_by_clause
  / cluster_by_clause
  / with_connection_clause
  / with_partition_columns_clause

create_table_copy_clause
  = kw:(COPY __) name:entity_name {
    return loc({
      type: "create_table_copy_clause",
      copyKw: read(kw),
      name,
    });
  }

create_table_clone_clause
  = kw:(CLONE __) table:(clone_for_system_time_as_of_expr / entity_name) {
    return loc({
      type: "create_table_clone_clause",
      cloneKw: read(kw),
      table,
    });
  }

clone_for_system_time_as_of_expr
  = left:(entity_name __) kw:(FOR __ SYSTEM_TIME __ AS __ OF __) expr:expr {
    return loc({
      type: "for_system_time_as_of_expr",
      left: read(left),
      forSystemTimeAsOfKw: read(kw),
      expr,
    });
  }

with_partition_columns_clause
  = kw:(WITH __ PARTITION __ COLUMNS) columns:(__ paren$list$column_definition)? {
    return loc({
      type: "with_partition_columns_clause",
      withPartitionColumnsKw: read(kw),
      columns: read(columns),
    });
  }

create_table_using_clause
  = usingKw:(USING __) func:(func_call / ident) {
    return loc({
      type: "create_table_using_clause",
      usingKw: read(usingKw),
      module: func.type === "identifier" ? { type: "func_call", name: func } : func,
    });
  }

create_table_clause_postgresql
  = create_table_inherits_clause
  / create_table_partition_by_clause
  / create_table_partition_bound_clause
  / create_table_default_partition_clause
  / create_table_on_commit_clause
  / tablespace_clause
  / using_access_method_clause
  / postgresql_with_options
  / create_table_without_oids_clause
  / with_data_clause
  / create_table_server_clause
  / postgresql_options

create_table_inherits_clause
  = kw:(INHERITS __) tables:paren$list$entity_name {
    return loc({
      type: "create_table_inherits_clause",
      inheritsKw: read(kw),
      tables,
    });
  }

create_table_partition_by_clause
  = kw:(PARTITION __ BY __) strategyKw:((RANGE / LIST / HASH) __) columns:paren$list$index_specification {
    return loc({
      type: "create_table_partition_by_clause",
      partitionByKw: read(kw),
      strategyKw: read(strategyKw),
      columns,
    });
  }

create_table_partition_bound_clause
  = kw:(FOR __ VALUES __) bound:(partition_bound_from_to / partition_bound_in / partition_bound_with) {
    return loc({
      type: "create_table_partition_bound_clause",
      forValuesKw: read(kw),
      bound: read(bound),
    });
  }

partition_bound_from_to
  = fromKw:(FROM __) from:paren$list$partition_bound_from_to_value
    toKw:(__ TO __) to:paren$list$partition_bound_from_to_value {
      return loc({
        type: "partition_bound_from_to",
        fromKw: read(fromKw),
        from,
        toKw: read(toKw),
        to,
      });
    }

partition_bound_from_to_value
  = kw:MINVALUE { return loc({ type: "partition_bound_minvalue", minvalueKw: kw }); }
  / kw:MAXVALUE { return loc({ type: "partition_bound_maxvalue", maxvalueKw: kw }); }
  / expr

partition_bound_in
  = kw:(IN __) values:paren$list$expr {
    return loc({
      type: "partition_bound_in",
      inKw: read(kw),
      values,
    });
  }

partition_bound_with
  = kw:(WITH __) values:paren$list$partition_bound_with_value {
    return loc({
      type: "partition_bound_with",
      withKw: read(kw),
      values,
    });
  }

partition_bound_with_value
  = kw:(MODULUS __) value:number_literal {
    return loc({
      type: "partition_bound_modulus",
      modulusKw: read(kw),
      value,
    });
  }
  / kw:(REMAINDER __) value:number_literal {
    return loc({
      type: "partition_bound_remainder",
      remainderKw: read(kw),
      value,
    });
  }

create_table_default_partition_clause
  = kw:DEFAULT {
    return loc({
      type: "create_table_default_partition_clause",
      defaultKw: read(kw),
    });
  }

create_table_on_commit_clause
  = kw:(ON __ COMMIT __) actionKw:(PRESERVE __ ROWS / DELETE __ ROWS / DROP) {
    return loc({
      type: "create_table_on_commit_clause",
      onCommitKw: read(kw),
      actionKw: read(actionKw),
    });
  }

tablespace_clause
  = kw:(TABLESPACE __) name:ident {
    return loc({
      type: "tablespace_clause",
      tablespaceKw: read(kw),
      name,
    });
  }

using_access_method_clause
  = kw:(USING __) method:ident {
    return loc({
      type: "using_access_method_clause",
      usingKw: read(kw),
      method,
    });
  }

create_table_without_oids_clause
  = kw:(WITHOUT __ OIDS) {
    return loc({
      type: "create_table_without_oids_clause",
      withoutOidsKw: read(kw),
    });
  }

with_data_clause
  = kw:(WITH __ DATA / WITH __ NO __ DATA) {
    return loc({
      type: "with_data_clause",
      withDataKw: read(kw),
    });
  }

create_table_server_clause
  = kw:(SERVER __) name:ident {
    return loc({
      type: "create_table_server_clause",
      serverKw: read(kw),
      name,
    });
  }

bigquery_options
  = &bigquery kw:(OPTIONS __) options:paren$list$equals_expr {
    return loc({
      type: "bigquery_options",
      optionsKw: read(kw),
      options,
    });
  }

equals_expr
  = name:(ident __) "=" value:(__ expr) {
    return loc({
      type: "binary_expr",
      left: read(name),
      operator: "=",
      right: read(value),
    });
  }

bigquery_option_default_collate
  = kw:(DEFAULT __ COLLATE __) value:string_literal {
    return loc({
      type: "bigquery_option_default_collate",
      defaultCollateKw: read(kw),
      collation: value,
    });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * DROP TABLE                                                                           *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
drop_table_stmt
  = dropKw:(DROP __)
    kind:(table_kind __)?
    tableKw:(TABLE __)
    ifExistsKw:(if_exists __)?
    tables:list$entity_name
    behaviorKw:(__ (CASCADE / RESTRICT))?
    {
      return loc({
        type: "drop_table_stmt",
        dropKw: read(dropKw),
        kind: read(kind),
        tableKw: read(tableKw),
        ifExistsKw: read(ifExistsKw),
        tables,
        behaviorKw: read(behaviorKw),
      });
    }

if_exists
  = kws:(IF __ EXISTS) { return read(kws); }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * ALTER TABLE                                                                          *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
alter_table_stmt
  = kw:(ALTER __ TABLE __)
    ifKw:(if_exists __)?
    table:(relation_expr __)
    actions:list$alter_action {
      return loc({
        type: "alter_table_stmt",
        alterTableKw: read(kw),
        ifExistsKw: read(ifKw),
        table: read(table),
        actions,
      });
    }

alter_table_all_in_tablespace_stmt
  = kw:(ALTER __ TABLE __)
    allInTablespaceKw:(ALL __ IN __ TABLESPACE __)
    tablespace:(ident __)
    ownedBy:(owned_by_clause __)?
    action:alter_action_set_tablespace
    {
    return loc({
      type: "alter_table_all_in_tablespace_stmt",
      alterTableKw: read(kw),
      allInTablespaceKw: read(allInTablespaceKw),
      tablespace: read(tablespace),
      ownedBy: read(ownedBy),
      action,
    });
  }

owned_by_clause
  = kw:(OWNED __ BY __) owners:list$role_specification {
    return loc({
      type: "owned_by_clause",
      ownedByKw: read(kw),
      owners,
    });
  }

alter_action
  = alter_action_rename_column
  / alter_action_rename
  / &bigquery x:alter_action_bigquery { return x; }
  / &mysql x:alter_action_mysql { return x; }
  / &postgres x:alter_action_postgres { return x; }
  // ADD/DROP CONSTRAINT must be matched before ADD/DROP column
  // to avoid ambiguity (when CONSTRAINT is not a reserved word)
  / alter_action_add_column
  / alter_action_drop_column

alter_action_bigquery
  = alter_action_alter_column
  / alter_action_set_default_collate
  / alter_action_set_bigquery_options
  / alter_action_add_constraint
  / alter_action_drop_constraint
  / alter_action_drop_primary_key

alter_action_mysql
  = alter_action_alter_column
  / alter_action_add_constraint
  / alter_action_drop_constraint
  / &only_mysql x:alter_action_alter_constraint { return x; }

alter_action_postgres
  = alter_action_alter_column
  / alter_action_add_constraint
  / alter_action_drop_constraint
  / alter_action_alter_constraint
  / alter_action_rename_constraint
  / alter_action_validate_constraint
  / alter_action_owner_to
  / alter_action_set_schema
  / alter_action_enable
  / alter_action_disable
  / alter_action_force
  / alter_action_no_force
  / alter_action_set_tablespace
  / alter_action_set_access_method
  / alter_action_cluster_on
  / alter_action_set_without_cluster
  / alter_action_set_without_oids
  / alter_action_set_logged
  / alter_action_set_unlogged
  / alter_action_inherit
  / alter_action_no_inherit
  / alter_action_of_type
  / alter_action_not_of_type
  / alter_action_set_postgresql_options
  / alter_action_reset_postgresql_options
  / alter_action_replica_identity

alter_action_add_column
  = addKw:(ADD __ COLUMN __ / ADD __) ifKw:(if_not_exists __)? col:column_definition {
      return loc({
        type: "alter_action_add_column",
        addKw: read(addKw),
        ifNotExistsKw: read(ifKw),
        column: col
      });
    }

alter_action_drop_column
  = kw:(DROP __ COLUMN __ / DROP __) ifKw:(if_exists __)? col:ident behaviorKw:(__ (CASCADE / RESTRICT))? {
      return loc({
        type: "alter_action_drop_column",
        dropKw: read(kw),
        ifExistsKw: read(ifKw),
        column: col,
        behaviorKw: read(behaviorKw),
      })
    }

alter_action_rename
  = kw:(rename_action_kw __) t:entity_name {
    return loc({
      type: "alter_action_rename",
      renameKw: read(kw),
      newName: t,
    });
  }

rename_action_kw
  = kw:(RENAME __ TO) { return read(kw); }
  / kw:(RENAME __ AS) &only_mysql { return read(kw); }
  / kw:RENAME &mysql { return kw; }

alter_action_rename_column
  = kw:(rename_column_kw __) ifKw:(if_exists __)? oldName:(ident __) toKw:(TO __) newName:ident {
    return loc({
      type: "alter_action_rename_column",
      renameKw: read(kw),
      ifExistsKw: read(ifKw),
      oldName: read(oldName),
      toKw: read(toKw),
      newName,
    });
  }

rename_column_kw
  = kw:(RENAME __ COLUMN) { return read(kw); }
  / kw:RENAME (&sqlite / &postgres) { return kw; }

alter_action_alter_column
  = alterKw:(alter_column_kw __) ifKw:(if_exists __)? column:((column / number_literal) __) action:alter_column_action {
    return loc({
      type: "alter_action_alter_column",
      alterKw: read(alterKw),
      ifExistsKw: read(ifKw),
      column: read(column),
      action,
    });
  }

alter_column_kw
  = kw:(ALTER __ COLUMN) { return read(kw); }
  / kw:ALTER (&postgres / &mysql) { return kw; }

alter_action_set_default_collate
  = kw:(SET __ DEFAULT __ COLLATE __) collation:string_literal {
    return loc({
      type: "alter_action_set_default_collate",
      setDefaultCollateKw: read(kw),
      collation,
    });
  }

alter_action_set_bigquery_options
  = kw:(SET __ ) options:bigquery_options {
    return loc({
      type: "alter_action_set_bigquery_options",
      setKw: read(kw),
      options,
    });
  }

alter_action_set_postgresql_options
  = kw:(SET __ ) options:paren$list$table_option_postgresql {
    return loc({
      type: "alter_action_set_postgresql_options",
      setKw: read(kw),
      options,
    });
  }

alter_action_reset_postgresql_options
  = kw:(RESET __ ) options:paren$list$member_expr {
    return loc({
      type: "alter_action_reset_postgresql_options",
      resetKw: read(kw),
      options,
    });
  }

alter_action_add_constraint
  = kw:(ADD __) name:(alter_action_add_constraint_constraint_name __)?
    constraint:table_constraint_type
    modifiers:(__ constraint_modifier)* {
      return loc({
        type: "alter_action_add_constraint",
        addKw: read(kw),
        name: read(name),
        constraint,
        modifiers: modifiers.map(read),
      });
    }

alter_action_add_constraint_constraint_name
  = constraintKw:(CONSTRAINT __) ifKw:(if_not_exists __)? name:ident {
    return loc({
      type: "alter_action_add_constraint_constraint_name",
      constraintKw: read(constraintKw),
      ifNotExistsKw: read(ifKw),
      name,
    });
  }

alter_action_drop_constraint
  = kw:(DROP __ (CONSTRAINT / CHECK) __) ifKw:(if_exists __)? constraint:ident behaviorKw:(__ (CASCADE / RESTRICT))? {
      return loc({
        type: "alter_action_drop_constraint",
        dropConstraintKw: read(kw),
        ifExistsKw: read(ifKw),
        constraint,
        behaviorKw: read(behaviorKw),
      })
    }

alter_action_drop_primary_key
  = kw:(DROP __ PRIMARY __ KEY) ifExistsKw:(__ if_exists)? {
    return loc({
      type: "alter_action_drop_primary_key",
      dropPrimaryKeyKw: read(kw),
      ifExistsKw: read(ifExistsKw),
    });
  }

alter_action_alter_constraint
  = kw:(ALTER __ (CONSTRAINT / CHECK) __) constraint:ident modifiers:(__ constraint_modifier)+ {
      return loc({
        type: "alter_action_alter_constraint",
        alterConstraintKw: read(kw),
        constraint,
        modifiers: modifiers.map(read),
      })
    }

alter_action_rename_constraint
  = kw:(RENAME __ CONSTRAINT __) oldName:(ident __) toKw:(TO __) newName:ident {
    return loc({
      type: "alter_action_rename_constraint",
      renameConstraintKw: read(kw),
      oldName: read(oldName),
      toKw: read(toKw),
      newName,
    });
  }

alter_action_validate_constraint
  = kw:(VALIDATE __ CONSTRAINT __) constraint:ident {
    return loc({
      type: "alter_action_validate_constraint",
      validateConstraintKw: read(kw),
      constraint,
    });
  }

alter_action_owner_to
  = kw:(OWNER __ TO __) owner:role_specification {
    return loc({
      type: "alter_action_owner_to",
      ownerToKw: read(kw),
      owner,
    });
  }

alter_action_set_schema
  = kw:(SET __ SCHEMA __) schema:ident {
    return loc({
      type: "alter_action_set_schema",
      setSchemaKw: read(kw),
      schema,
    });
  }

alter_action_enable
  = kw:(ENABLE __) modeKw:((ALWAYS / REPLICA) __)? item:toggle_item {
    return loc({
      type: "alter_action_enable",
      enableKw: read(kw),
      modeKw: read(modeKw),
      item,
    });
  }

alter_action_disable
  = kw:(DISABLE __) item:toggle_item {
    return loc({
      type: "alter_action_disable",
      disableKw: read(kw),
      item,
    });
  }

alter_action_force
  = kw:(FORCE __) item:toggle_row_level_security {
    return loc({
      type: "alter_action_force",
      forceKw: read(kw),
      item,
    });
  }

alter_action_no_force
  = kw:(NO __ FORCE __) item:toggle_row_level_security {
    return loc({
      type: "alter_action_no_force",
      noForceKw: read(kw),
      item,
    });
  }

alter_action_set_tablespace
  = kw:(SET __ TABLESPACE __) tablespace:ident nowaitKw:(__ NOWAIT)? {
    return loc({
      type: "alter_action_set_tablespace",
      setTablespaceKw: read(kw),
      tablespace,
      nowaitKw: read(nowaitKw),
    });
  }

alter_action_set_access_method
  = kw:(SET __ ACCESS __ METHOD __) method:ident {
    return loc({
      type: "alter_action_set_access_method",
      setAccessMethodKw: read(kw),
      method,
    });
  }

alter_action_cluster_on
  = kw:(CLUSTER __ ON __) index:ident {
    return loc({
      type: "alter_action_cluster_on",
      clusterOnKw: read(kw),
      index,
    });
  }

alter_action_set_without_cluster
  = kw:(SET __ WITHOUT __ CLUSTER) {
    return loc({
      type: "alter_action_set_without_cluster",
      setWithoutClusterKw: read(kw),
    });
  }

alter_action_set_without_oids
  = kw:(SET __ WITHOUT __ OIDS) {
    return loc({
      type: "alter_action_set_without_oids",
      setWithoutOidsKw: read(kw),
    });
  }

alter_action_set_logged
  = kw:(SET __ LOGGED) {
    return loc({
      type: "alter_action_set_logged",
      setLoggedKw: read(kw),
    });
  }

alter_action_set_unlogged
  = kw:(SET __ UNLOGGED) {
    return loc({
      type: "alter_action_set_unlogged",
      setUnloggedKw: read(kw),
    });
  }

alter_action_inherit
  = kw:(INHERIT __) table:entity_name {
    return loc({
      type: "alter_action_inherit",
      inheritKw: read(kw),
      table,
    });
  }

alter_action_no_inherit
  = kw:(NO __ INHERIT __) table:entity_name {
    return loc({
      type: "alter_action_no_inherit",
      noInheritKw: read(kw),
      table,
    });
  }

alter_action_of_type
  = kw:(OF __ ) typeName:entity_name {
    return loc({
      type: "alter_action_of_type",
      ofKw: read(kw),
      typeName,
    });
  }

alter_action_not_of_type
  = kw:(NOT __ OF) {
    return loc({
      type: "alter_action_not_of_type",
      notOfKw: read(kw),
    });
  }

alter_action_depends_on_extension
  = kw:(DEPENDS __ ON __ EXTENSION __) extension:ident {
    return loc({
      type: "alter_action_depends_on_extension",
      dependsOnExtensionKw: read(kw),
      extension,
    });
  }

alter_action_no_depends_on_extension
  = kw:(NO __ DEPENDS __ ON __ EXTENSION __) extension:ident {
    return loc({
      type: "alter_action_no_depends_on_extension",
      noDependsOnExtensionKw: read(kw),
      extension,
    });
  }

alter_action_replica_identity
  = kw:(REPLICA __ IDENTITY __) identity:(DEFAULT / NOTHING / FULL / replica_identity_using_index) {
    return loc({
      type: "alter_action_replica_identity",
      replicaIdentityKw: read(kw),
      identity,
    });
  }

replica_identity_using_index
  = kw:(USING __ INDEX __) index:ident {
    return loc({
      type: "replica_identity_using_index",
      usingIndexKw: read(kw),
      index,
    });
  }

alter_action_attach_partition
  = kw:(ATTACH __ PARTITION __) index:entity_name {
    return loc({
      type: "alter_action_attach_partition",
      attachPartitionKw: read(kw),
      index,
    });
  }

alter_action_add_enum_value
  = kw:(ADD __ VALUE __)
    ifKw:(if_not_exists __)?
    value:string_literal
    position:(__ alter_action_add_enum_value_position)? {
      return loc({
        type: "alter_action_add_enum_value",
        addValueKw: read(kw),
        ifNotExistsKw: read(ifKw),
        value,
        position: read(position),
      });
    }

alter_action_add_enum_value_position
  = kw:((BEFORE / AFTER) __) value:string_literal {
    return loc({
      type: "alter_action_add_enum_value_position",
      positionKw: read(kw),
      value,
    });
  }

alter_action_rename_enum_value
  = kw:(RENAME __ VALUE __) oldValue:string_literal toKw:(__ TO __) newValue:string_literal {
    return loc({
      type: "alter_action_rename_enum_value",
      renameValueKw: read(kw),
      oldValue,
      toKw: read(toKw),
      newValue,
    });
  }

alter_action_rename_attribute
  = kw:(RENAME __ ATTRIBUTE __) oldName:ident toKw:(__ TO __) newName:ident
    behaviorKw:(__ (CASCADE/RESTRICT))? {
      return loc({
        type: "alter_action_rename_attribute",
        renameAttributeKw: read(kw),
        oldName,
        toKw: read(toKw),
        newName,
        behaviorKw: read(behaviorKw),
      });
    }

alter_action_add_attribute
  = kw:(ADD __ ATTRIBUTE __) name:ident dataType:(__ data_type)
    constraint:(__ constraint_collate)? behaviorKw:(__ (CASCADE/RESTRICT))? {
      return loc({
        type: "alter_action_add_attribute",
        addAttributeKw: read(kw),
        name,
        dataType: read(dataType),
        constraint: read(constraint),
        behaviorKw: read(behaviorKw),
      });
    }

alter_action_drop_attribute
  = kw:(DROP __ ATTRIBUTE __) ifKw:(if_exists __)? name:ident behaviorKw:(__ (CASCADE/RESTRICT))? {
      return loc({
        type: "alter_action_drop_attribute",
        dropAttributeKw: read(kw),
        ifExistsKw: read(ifKw),
        name,
        behaviorKw: read(behaviorKw),
      });
    }

alter_action_alter_attribute
  = kw:(ALTER __ ATTRIBUTE __) name:(ident __) typeKw:(SET __ DATA __ TYPE __ / TYPE __) dataType:data_type
    constraint:(__ constraint_collate)? behaviorKw:(__ (CASCADE/RESTRICT))? {
      return loc({
        type: "alter_action_alter_attribute",
        alterAttributeKw: read(kw),
        name: read(name),
        setDataTypeKw: read(typeKw),
        dataType,
        constraint: read(constraint),
        behaviorKw: read(behaviorKw),
      });
    }

alter_column_action
  = alter_action_set_default
  / alter_action_drop_default
  / &bigquery x:alter_column_action_bigquery { return x; }
  / &only_mysql x:alter_column_action_mysql { return x; }
  / &postgres x:alter_column_action_postgres { return x; }

alter_column_action_bigquery
  = alter_action_drop_not_null
  / alter_action_set_data_type
  / alter_action_set_bigquery_options

alter_column_action_mysql
  = alter_action_set_visible
  / alter_action_set_invisible

alter_column_action_postgres
  = alter_action_set_not_null
  / alter_action_drop_not_null
  / alter_action_set_data_type
  / alter_action_set_compression
  / alter_action_set_storage
  / alter_action_set_statistics
  / alter_action_set_postgresql_options
  / alter_action_reset_postgresql_options
  / alter_action_drop_expression
  / alter_action_drop_identity
  / alter_action_add_identity
  / alter_action_alter_identity

alter_action_set_default
  = kw:(SET __ DEFAULT __) expr:expr {
    return loc({ type: "alter_action_set_default", setDefaultKw: read(kw), expr });
  }

alter_action_drop_default
  = kw:(DROP __ DEFAULT) {
    return loc({ type: "alter_action_drop_default", dropDefaultKw: read(kw) });
  }

alter_action_set_not_null
  = kw:(SET __ NOT __ NULL) {
    return loc({ type: "alter_action_set_not_null", setNotNullKw: read(kw) });
  }

alter_action_drop_not_null
  = kw:(DROP __ NOT __ NULL) {
    return loc({ type: "alter_action_drop_not_null", dropNotNullKw: read(kw) });
  }

alter_action_set_data_type
  = kw:(SET __ DATA __ TYPE __ / TYPE __)
    type:data_type
    clauses:(__ (set_data_type_collate_clause / set_data_type_using_clause))* {
      return loc({
        type: "alter_action_set_data_type",
        setDataTypeKw: read(kw),
        dataType: type,
        clauses: clauses.map(read),
      });
    }

set_data_type_collate_clause
  = collate:constraint_collate {
    return loc({ ...collate, type: "set_data_type_collate_clause" });
  }

set_data_type_using_clause
  = kw:(USING __) expr:expr {
    return loc({ type: "set_data_type_using_clause", usingKw: read(kw), expr });
  }

alter_action_set_visible
  = kw:(SET __ VISIBLE) {
    return loc({ type: "alter_action_set_visible", setVisibleKw: read(kw) });
  }

alter_action_set_invisible
  = kw:(SET __ INVISIBLE) {
    return loc({ type: "alter_action_set_invisible", setInvisibleKw: read(kw) });
  }

alter_action_set_compression
  = kw:(SET __ COMPRESSION __) method:(ident / default) {
    return loc({ type: "alter_action_set_compression", setCompressionKw: read(kw), method });
  }

alter_action_set_storage
  = kw:(SET __ STORAGE __) typeKw:pg_storage_type {
    return loc({ type: "alter_action_set_storage", setStorageKw: read(kw), typeKw });
  }

alter_action_set_statistics
  = kw:(SET __ STATISTICS __) value:number_literal {
    return loc({ type: "alter_action_set_statistics", setStatisticsKw: read(kw), value });
  }

alter_action_drop_expression
  = kw:(DROP __ EXPRESSION) ifExistsKw:(__ if_exists)? {
    return loc({ type: "alter_action_drop_expression", dropExpressionKw: read(kw), ifExistsKw: read(ifExistsKw) });
  }

alter_action_drop_identity
  = kw:(DROP __ IDENTITY) ifExistsKw:(__ if_exists)? {
    return loc({ type: "alter_action_drop_identity", dropIdentityKw: read(kw), ifExistsKw: read(ifExistsKw) });
  }

alter_action_add_identity
  = kw:(ADD __ GENERATED __)
    whenKw:(ALWAYS / BY __ DEFAULT)
    asIdentityKw:(__ AS __ IDENTITY)
    sequenceOptions:(__ paren$sequence_option_list)? {
      return loc({
        type: "alter_action_add_identity",
        addGeneratedKw: read(kw),
        whenKw: read(whenKw),
        asIdentityKw: read(asIdentityKw),
        sequenceOptions: read(sequenceOptions),
      });
    }

alter_action_alter_identity
  = action1:alter_identity_action actions:(__ alter_identity_action)* {
    return loc({
      type: "alter_action_alter_identity",
      actions: [action1, ...actions.map(read)],
    });
  }

toggle_item
  = toggle_row_level_security
  / toggle_trigger
  / toggle_rule

toggle_row_level_security
  = kw:(ROW __ LEVEL __ SECURITY) {
    return loc({ type: "toggle_row_level_security", rowLevelSecurityKw: read(kw) });
  }

toggle_trigger
  = kw:(TRIGGER __) name:(ALL / USER / ident) {
    return loc({ type: "toggle_trigger", triggerKw: read(kw), name });
  }

toggle_rule
  = kw:(RULE __) name:ident {
    return loc({ type: "toggle_rule", ruleKw: read(kw), name });
  }

alter_identity_action
  = alter_action_set_generated
  / alter_action_set_sequence_option
  / alter_action_restart

alter_action_set_generated
  = kw:(SET __ GENERATED __) whenKw:(ALWAYS / BY __ DEFAULT) {
    return loc({ type: "alter_action_set_generated", setGeneratedKw: read(kw), whenKw: read(whenKw) });
  }

alter_action_set_sequence_option
  = kw:(SET __) option:sequence_option {
    return loc({ type: "alter_action_set_sequence_option", setKw: read(kw), option });
  }

alter_action_restart
  = sequenceRestart:sequence_option_restart {
    return loc({ ...sequenceRestart, type: "alter_action_restart" });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * RENAME TABLE                                                                         *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
rename_table_stmt
  = kw:(RENAME __) tkw:(TABLE __) actions:list$rename_action {
    return loc({
      type: "rename_table_stmt",
      renameKw: read(kw),
      tableKw: read(tkw),
      actions,
    });
  }

rename_action
  = from:entity_name kw:(__ TO __) to:entity_name {
    return loc({
      type: "rename_action",
      from,
      toKw: read(kw),
      to,
    });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * CREATE TRIGGER  /  DROP TRIGGER                                                      *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
create_trigger_stmt
  = kw:(CREATE __)
    orReplaceKw:(OR __ REPLACE __)?
    kind:(trigger_kind __)?
    trigKw:(TRIGGER __)
    ifKw:(if_not_exists __)?
    name:(entity_name __)
    timeKw:(BEFORE __ / AFTER __ / INSTEAD __ OF __)?
    event:(trigger_event_expr __)
    target:(trigger_target __)
    clauses:(trigger_clause __)*
    body:trigger_body
    {
      return loc({
        type: "create_trigger_stmt",
        createKw: read(kw),
        orReplaceKw: read(orReplaceKw),
        kind: read(kind),
        triggerKw: read(trigKw),
        ifNotExistsKw: read(ifKw),
        name: read(name),
        timeKw: read(timeKw),
        event: read(event),
        target: read(target),
        clauses: clauses.map(read),
        body,
      });
    }

trigger_kind
  = &sqlite kw:(TEMPORARY / TEMP) {
    return loc({ type: "relation_kind", kindKw: kw });
  }
  / &postgres kw:CONSTRAINT {
    return loc({ type: "relation_kind", kindKw: kw });
  }

trigger_event_expr
  = head:trigger_event tail:(__ OR __ trigger_event)* {
    return createBinaryExprChain(head, tail);
  }

trigger_event
  = eventKw:(UPDATE __) ofKw:(OF __) cols:list$column {
      return loc({
        type: "trigger_event",
        eventKw: read(eventKw),
        ofKw: read(ofKw),
        columns: read(cols),
      });
    }
  / eventKw:(DELETE / INSERT / UPDATE / TRUNCATE) {
      return loc({
        type: "trigger_event",
        eventKw: read(eventKw),
      });
    }

trigger_target
  = onKw:(__ ON __) table:entity_name {
    return loc({
      type: "trigger_target",
      onKw: read(onKw),
      table,
    });
  }

trigger_clause
  = for_each_clause
  / when_clause
  / &postgres x:(
      from_referenced_table_clause
    / trigger_timing_clause
    / trigger_referencing_clause
  ) { return x; }

for_each_clause
  = kw:(FOR __ EACH __ / FOR __) itemKw:(ROW / STATEMENT) {
    return loc({
      type: "for_each_clause",
      forEachKw: read(kw),
      itemKw: read(itemKw),
    });
  }

when_clause
  = kw:(WHEN __) e:expr {
    return loc({
      type: "when_clause",
      whenKw: read(kw),
      expr: e,
    });
  }

from_referenced_table_clause
  = kw:(FROM __ ) table:entity_name {
    return loc({
      type: "from_referenced_table_clause",
      fromKw: read(kw),
      table,
    });
  }

trigger_timing_clause
  = kw:(NOT __ DEFERRABLE
  / DEFERRABLE __ INITIALLY __ DEFERRED
  / DEFERRABLE __ INITIALLY __ IMMEDIATE
  / DEFERRABLE
  / INITIALLY __ DEFERRED
  / INITIALLY __ IMMEDIATE) {
    return loc({
      type: "trigger_timing_clause",
      timingKw: read(kw),
    })
  }

trigger_referencing_clause
  = kw:(REFERENCING __) transitions:list$trigger_transition {
    return loc({
      type: "trigger_referencing_clause",
      referencingKw: read(kw),
      transitions: read(transitions),
    });
  }

trigger_transition
  = kw:((NEW / OLD) __) tableKw:((TABLE / ROW) __) asKw:(AS __)? name:ident {
    return loc({
      type: "trigger_transition",
      oldOrNewKw: read(kw),
      rowOrTableKw: read(tableKw),
      asKw: read(asKw),
      name,
    });
  }

trigger_body
  = !postgres beginKw:(BEGIN __) program:trigger_program endKw:(__ END) {
    return loc({
      type: "block_stmt",
      beginKw: read(beginKw),
      program,
      endKw: read(endKw),
    });
  }
  / &postgres
    executeKw:(EXECUTE __) functionKw:((PROCEDURE / FUNCTION) __)
    name:(entity_name __) args:(paren$empty_list / paren$list$expr) {
      return loc({
        type: "execute_clause",
        executeKw: read(executeKw),
        functionKw: read(functionKw),
        name: read(name),
        args,
      });
    }

// One or more DML statement, plus an empty statement in the end
trigger_program
  = head:dml_statement tail:(__ ";" __ (dml_statement / empty))+ {
    return loc({
      type: "program",
      statements: readCommaSepList(head, tail),
    });
  }

// DROP TRIGGER
drop_trigger_stmt
  = kw:(DROP __ TRIGGER __)
    ifKw:(if_exists __)?
    trigger:entity_name {
      return loc({
        type: "drop_trigger_stmt",
        dropTriggerKw: read(kw),
        ifExistsKw: read(ifKw),
        trigger,
      });
    }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * CREATE SCHEMA  /  DROP SCHEMA                                                        *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
create_schema_stmt
  = kw:(CREATE __ schema_kw) ifKw:(__ if_not_exists)? name:(__ entity_name)?
    clauses:(__ create_schema_clause)*
    statements:(__ schema_scoped_statement)* {
      return loc({
        type: "create_schema_stmt",
        createSchemaKw: read(kw),
        ifNotExistsKw: read(ifKw),
        name: read(name),
        clauses: clauses.map(read),
        statements: statements.map(read),
      });
    }

create_schema_clause
  = &bigquery x:bigquery_options { return x; }
  / &bigquery x:bigquery_option_default_collate { return x; }
  / &postgres x:create_schema_authorization_clause { return x; }

create_schema_authorization_clause
  = kw:(AUTHORIZATION __) role:role_specification {
    return loc({
      type: "create_schema_authorization_clause",
      authorizationKw: read(kw),
      role,
    });
  }

schema_scoped_statement
  = &postgres x:(
      create_table_stmt
    / create_view_stmt
    / create_index_stmt
    / create_sequence_stmt
  ) { return x; }

drop_schema_stmt
  = kw:(DROP __ schema_kw __) ifKw:(if_exists __)? schemas:list$entity_name behaviorKw:(__ (CASCADE / RESTRICT))? {
    return loc({
      type: "drop_schema_stmt",
      dropSchemaKw: read(kw),
      ifExistsKw: read(ifKw),
      schemas,
      behaviorKw: read(behaviorKw)
    });
  }

alter_schema_stmt
  = kw:(ALTER __ schema_kw __) ifKw:(if_exists __)? name:entity_name actions:(__ alter_schema_action)+ {
    return loc({
      type: "alter_schema_stmt",
      alterSchemaKw: read(kw),
      ifExistsKw: read(ifKw),
      name,
      actions: actions.map(read),
    });
  }

alter_schema_action
  = &bigquery ac:alter_action_set_bigquery_options { return ac; }
  / &bigquery ac:alter_action_set_default_collate { return ac; }
  / &postgres ac:alter_action_rename { return ac; }
  / &postgres ac:alter_action_owner_to { return ac; }

schema_kw
  = SCHEMA
  / kw:DATABASE &mysql { return kw; }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * CREATE FUNCTION / DROP FUNCTION                                                      *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
create_function_stmt
  = &bigquery
    kw:(CREATE __)
    orKw:(OR __ REPLACE __)?
    tempKw:((TEMPORARY / TEMP) __)?
    tableKw:(TABLE __)?
    funKw:(FUNCTION __)
    ifKw:(if_not_exists __)?
    name:(entity_name __)
    params:(paren$list$func_param / paren$empty_list)
    clauses:(__ create_function_clause)+ {
      return loc({
        type: "create_function_stmt",
        createKw: read(kw),
        orReplaceKw: read(orKw),
        temporaryKw: read(tempKw),
        tableKw: read(tableKw),
        functionKw: read(funKw),
        ifNotExistsKw: read(ifKw),
        name: read(name),
        params,
        clauses: clauses.map(read),
      });
    }
  / &postgres
    kw:(CREATE __)
    orKw:(OR __ REPLACE __)?
    funKw:(FUNCTION __)
    name:(entity_name __)
    params:(paren$list$func_param / paren$empty_list)
    clauses:(__ create_function_clause)+ {
      return loc({
        type: "create_function_stmt",
        createKw: read(kw),
        orReplaceKw: read(orKw),
        functionKw: read(funKw),
        name: read(name),
        params,
        clauses: clauses.map(read),
      });
    }

func_param
  = &bigquery name:(ident __) type:data_type {
      return loc({
        type: "function_param",
        name: read(name),
        dataType: type,
      });
    }
  / &postgres p:procedure_param {
    return p;
  }

create_function_clause
  = returns_clause
  / language_clause
  / &postgres x:create_function_clause_postgres { return x; }
  / &bigquery x:create_function_clause_bigquery { return x; }

create_function_clause_bigquery
  = determinism_clause
  / as_clause$func_as_expr_bigquery
  / with_connection_clause
  / bigquery_options

create_function_clause_postgres
  = return_clause
  / block_stmt
  / as_clause$func_as_expr_postgresql
  / function_window_clause
  / function_behavior_clause
  / function_security_clause
  / function_cost_clause
  / function_rows_clause
  / function_support_clause
  / function_transform_clause
  / set_parameter_clause
  / set_parameter_from_current_clause

returns_clause
  = kw:(RETURNS __) type:(table_data_type / data_type) {
    return loc({
      type: "returns_clause",
      returnsKw: read(kw),
      dataType: type,
    });
  }

return_clause
  = kw:(RETURN __) expr:expr {
    return loc({
      type: "return_clause",
      returnKw: read(kw),
      expr,
    });
  }

determinism_clause
  = kw:(DETERMINISTIC / NOT __ DETERMINISTIC) {
    return loc({
      type: "determinism_clause",
      deterministicKw: read(kw),
    });
  }

language_clause
  = kw:(LANGUAGE __) lang:ident {
    return loc({
      type: "language_clause",
      languageKw: read(kw),
      name: lang,
    });
  }

func_as_expr_bigquery
  = paren$expr / string_literal / compound_select_stmt

func_as_expr_postgresql
  = dynamically_loaded_function / string_literal

dynamically_loaded_function
  = objectFile:(string_literal __) "," symbol:(__ string_literal) {
    return loc({
      type: "dynamically_loaded_function",
      objectFile: read(objectFile),
      symbol: read(symbol),
    });
  }

with_connection_clause
  = kw:(REMOTE __ WITH __ CONNECTION __ / WITH __ CONNECTION __) name:entity_name {
    return loc({
      type: "with_connection_clause",
      withConnectionKw: read(kw),
      connection: name,
    });
  }

function_window_clause
  = windowKw:WINDOW {
    return loc({ type: "function_window_clause", windowKw });
  }

function_behavior_clause
  = kw:(
        IMMUTABLE
      / STABLE
      / VOLATILE
      / LEAKPROOF
      / NOT __ LEAKPROOF
      / CALLED __ ON __ NULL __ INPUT
      / RETURNS __ NULL __ ON __ NULL __ INPUT
      / STRICT
      / PARALLEL __ (UNSAFE / RESTRICTED / SAFE)
    ) {
    return loc({
      type: "function_behavior_clause",
      behaviorKw: read(kw),
    });
  }

function_security_clause
  = externalKw:(EXTERNAL __)? securityKw:(SECURITY __ (DEFINER / INVOKER)) {
    return loc({
      type: "function_security_clause",
      externalKw: read(externalKw),
      securityKw: read(securityKw),
    });
  }

function_cost_clause
  = kw:(COST __) cost:number_literal {
    return loc({
      type: "function_cost_clause",
      costKw: read(kw),
      cost,
    });
  }

function_rows_clause
  = kw:(ROWS __) rows:number_literal {
    return loc({
      type: "function_rows_clause",
      rowsKw: read(kw),
      rows,
    });
  }

function_support_clause
  = kw:(SUPPORT __) name:entity_name {
    return loc({
      type: "function_support_clause",
      supportKw: read(kw),
      name,
    });
  }

function_transform_clause
  = kw:(TRANSFORM __) types:list$transform_type {
    return loc({
      type: "function_transform_clause",
      transformKw: read(kw),
      types,
    });
  }

transform_type
  = kw:(FOR __ TYPE __) dataType:data_type {
    return loc({
      type: "transform_type",
      forTypeKw: read(kw),
      dataType,
    });
  }

set_parameter_clause
  = kw:(SET __) name:(ident __) op:("=" / TO) value:(__ list$config_parameter_value) {
    return loc({
      type: "set_parameter_clause",
      setKw: read(kw),
      name: read(name),
      operator: op,
      value: read(value),
    });
  }

config_parameter_value
  = literal / default / ident

set_parameter_from_current_clause
  = kw:(SET __) name:ident fromCurrentKw:(__ FROM __ CURRENT) {
    return loc({
      type: "set_parameter_from_current_clause",
      setKw: read(kw),
      name,
      fromCurrentKw: read(fromCurrentKw),
    });
  }

reset_parameter_clause
  = kw:(RESET __) name:ident {
    return loc({
      type: "reset_parameter_clause",
      resetKw: read(kw),
      name,
    });
  }

reset_all_parameters_clause
  = kw:(RESET __ ALL) {
    return loc({
      type: "reset_all_parameters_clause",
      resetAllKw: read(kw),
    });
  }

drop_function_stmt
  = kw:(DROP __)
    tableKw:(TABLE __)?
    funKw:(FUNCTION __)
    ifKw:(if_exists __)?
    name:entity_name
    params:(__ (paren$list$func_param / paren$empty_list))?
    behaviorKw:(__ (CASCADE / RESTRICT))? {
      return loc({
        type: "drop_function_stmt",
        dropKw: read(kw),
        tableKw: read(tableKw),
        functionKw: read(funKw),
        ifExistsKw: read(ifKw),
        name,
        params: read(params),
        behaviorKw: read(behaviorKw),
      });
    }

alter_function_stmt
  = kw:(ALTER __) funKw:(FUNCTION __)
    name:entity_name
    params:(__ (paren$list$func_param / paren$empty_list))?
    actions:(__ alter_function_action)+
    behaviorKw:(__ RESTRICT)? {
      return loc({
        type: "alter_function_stmt",
        alterKw: read(kw),
        functionKw: read(funKw),
        name,
        params: read(params),
        actions: actions.map(read),
        behaviorKw: read(behaviorKw),
      });
    }

alter_function_action
  = alter_action_rename
  / alter_action_owner_to
  / alter_action_set_schema
  / alter_action_depends_on_extension
  / alter_action_no_depends_on_extension
  / set_parameter_clause
  / set_parameter_from_current_clause
  / reset_all_parameters_clause
  / reset_parameter_clause
  / function_behavior_clause
  / function_security_clause
  / function_cost_clause
  / function_rows_clause
  / function_support_clause

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * CREATE PROCEDURE / DROP PROCEDURE                                                    *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
create_procedure_stmt
  = kw:(CREATE __)
    orKw:(OR __ REPLACE __)?
    procKw:(PROCEDURE __)
    ifKw:(if_not_exists __)?
    name:(entity_name __)
    params:(paren$list$procedure_param / paren$empty_list)
    clauses:(__ create_procedure_clause)+ {
      return loc({
        type: "create_procedure_stmt",
        createKw: read(kw),
        orReplaceKw: read(orKw),
        procedureKw: read(procKw),
        ifNotExistsKw: read(ifKw),
        name: read(name),
        params,
        clauses: clauses.map(read),
      });
    }

procedure_param
  = &bigquery mode:((INOUT / IN / OUT) __)? name:(ident __) type:data_type {
    return loc({
      type: "function_param",
      mode: read(mode),
      name: read(name),
      dataType: type,
    });
  }
  / &postgres mode:((INOUT / IN / OUT / VARIADIC) __)? name:(ident __) type:data_type def:(__ function_param_default)? {
    return loc({
      type: "function_param",
      mode: read(mode),
      name: read(name),
      dataType: type,
      default: read(def),
    });
  }
  / &postgres mode:((INOUT / IN / OUT / VARIADIC) __)? type:data_type def:(__ function_param_default)? {
    return loc({
      type: "function_param",
      mode: read(mode),
      dataType: type,
      default: read(def),
    });
  }

function_param_default
  = operator:(DEFAULT / "=") expr:(__ expr) {
    return loc({
      type: "function_param_default",
      operator,
      expr: read(expr),
    });
  }

create_procedure_clause
  = block_stmt
  / language_clause
  / &bigquery x:create_procedure_clause_bigquery { return x; }
  / &postgres x:create_procedure_clause_postgresql { return x; }

create_procedure_clause_bigquery
  = as_clause$func_as_expr_bigquery
  / with_connection_clause
  / bigquery_options

create_procedure_clause_postgresql
  = as_clause$func_as_expr_postgresql
  / function_security_clause
  / function_transform_clause
  / set_parameter_clause
  / set_parameter_from_current_clause

drop_procedure_stmt
  = kw:(DROP __)
    procKw:(PROCEDURE __)
    ifKw:(if_exists __)?
    name:entity_name
    params:(__ (paren$list$procedure_param / paren$empty_list))?
    behaviorKw:(__ (CASCADE / RESTRICT))? {
      return loc({
        type: "drop_procedure_stmt",
        dropKw: read(kw),
        procedureKw: read(procKw),
        ifExistsKw: read(ifKw),
        name,
        params: read(params),
        behaviorKw: read(behaviorKw),
      });
    }

alter_procedure_stmt
  = kw:(ALTER __) procKw:(PROCEDURE __)
    name:entity_name
    params:(__ (paren$list$func_param / paren$empty_list))?
    actions:(__ alter_procedure_action)+
    behaviorKw:(__ RESTRICT)? {
      return loc({
        type: "alter_procedure_stmt",
        alterKw: read(kw),
        procedureKw: read(procKw),
        name,
        params: read(params),
        actions: actions.map(read),
        behaviorKw: read(behaviorKw),
      });
    }

alter_procedure_action
  = alter_action_rename
  / alter_action_owner_to
  / alter_action_set_schema
  / alter_action_depends_on_extension
  / alter_action_no_depends_on_extension
  / set_parameter_clause
  / set_parameter_from_current_clause
  / reset_all_parameters_clause
  / reset_parameter_clause
  / function_security_clause

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * CREATE/ALTER/DROP SEQUENCE                                                           *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
create_sequence_stmt
  = kw:(CREATE __)
    kind:(sequence_kind __)?
    sequenceKw:(SEQUENCE __)
    ifNotExistsKw:(if_not_exists __)?
    name:entity_name
    options:(__ sequence_option)* {
      return loc({
        type: "create_sequence_stmt",
        createKw: read(kw),
        kind: read(kind),
        sequenceKw: read(sequenceKw),
        ifNotExistsKw: read(ifNotExistsKw),
        name,
        options: options.map(read),
      });
    }

sequence_kind
  = kw:(TEMP / TEMPORARY / UNLOGGED) {
    return loc({ type: "relation_kind", kindKw: kw });
  }

sequence_option_list
  = op1:sequence_option options:(__ sequence_option)* {
    return loc({
      type: "sequence_option_list",
      options: [op1, ...options.map(read)],
    });
  }

sequence_option
  = sequence_option_as_type
  / sequence_option_increment
  / sequence_option_start
  / sequence_option_restart
  / sequence_option_minvalue
  / sequence_option_maxvalue
  / sequence_option_no_minvalue
  / sequence_option_no_maxvalue
  / sequence_option_cache
  / sequence_option_cycle
  / sequence_option_no_cycle
  / sequence_option_owned_by

sequence_option_as_type
  = kw:(AS __) type:data_type {
    return loc({
      type: "sequence_option_as_type",
      asKw: read(kw),
      dataType: type,
    });
  }

sequence_option_increment
  = kw:(INCREMENT __) byKw:(BY __)? value:signed_number_literal {
    return loc({
      type: "sequence_option_increment",
      incrementKw: read(kw),
      byKw: read(byKw),
      value,
    });
  }

sequence_option_start
  = kw:(START __) withKw:(WITH __)? value:signed_number_literal {
    return loc({
      type: "sequence_option_start",
      startKw: read(kw),
      withKw: read(withKw),
      value,
    });
  }

sequence_option_restart
  = kw:(RESTART __) withKw:(WITH __) value:signed_number_literal {
    return loc({ type: "sequence_option_restart", restartKw: read(kw), withKw: read(withKw), value });
  }
  / kw:RESTART value:(__ signed_number_literal)? {
    return loc({ type: "sequence_option_restart", restartKw: read(kw), value: read(value) });
  }

sequence_option_minvalue
  = kw:(MINVALUE __) value:signed_number_literal {
    return loc({ type: "sequence_option_minvalue", minvalueKw: read(kw), value });
  }

sequence_option_maxvalue
  = kw:(MAXVALUE __) value:signed_number_literal {
    return loc({ type: "sequence_option_maxvalue", maxvalueKw: read(kw), value });
  }

sequence_option_no_minvalue
  = kw:(NO __ MINVALUE) {
    return loc({ type: "sequence_option_no_minvalue", noMinvalueKw: read(kw) });
  }

sequence_option_no_maxvalue
  = kw:(NO __ MAXVALUE) {
    return loc({ type: "sequence_option_no_maxvalue", noMaxvalueKw: read(kw) });
  }

sequence_option_cache
  = kw:(CACHE __) value:signed_number_literal {
    return loc({ type: "sequence_option_cache", cacheKw: read(kw), value });
  }

sequence_option_cycle
  = cycleKw:CYCLE {
    return loc({ type: "sequence_option_cycle", cycleKw });
  }

sequence_option_no_cycle
  = kw:(NO __ CYCLE) {
    return loc({ type: "sequence_option_no_cycle", noCycleKw: read(kw) });
  }

sequence_option_owned_by
  = kw:(OWNED __ BY __) owner:entity_name {
    return loc({ type: "sequence_option_owned_by", ownedByKw: read(kw), owner });
  }

alter_sequence_stmt
  = kw:(ALTER __)
    sequenceKw:(SEQUENCE __)
    ifExistsKw:(if_exists __)?
    sequence:entity_name
    actions:(__ (sequence_option / alter_sequence_action))+ {
      return loc({
        type: "alter_sequence_stmt",
        alterKw: read(kw),
        sequenceKw: read(sequenceKw),
        ifExistsKw: read(ifExistsKw),
        sequence,
        actions: actions.map(read),
      });
    }

alter_sequence_action
  = alter_action_set_logged
  / alter_action_set_unlogged
  / alter_action_owner_to
  / alter_action_rename
  / alter_action_set_schema

drop_sequence_stmt
  = kw:(DROP __)
    sequenceKw:(SEQUENCE __)
    ifExistsKw:(if_exists __)?
    sequences:list$entity_name
    behaviorKw:(__ (CASCADE / RESTRICT))? {
      return loc({
        type: "drop_sequence_stmt",
        dropKw: read(kw),
        sequenceKw: read(sequenceKw),
        ifExistsKw: read(ifExistsKw),
        sequences,
        behaviorKw: read(behaviorKw),
      });
    }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * CREATE/ALTER/DROP TYPE                                                               *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
create_type_stmt
  = kw:(CREATE __ TYPE __) name:entity_name definition:(__ type_definition)? {
    return loc({
      type: "create_type_stmt",
      createTypeKw: read(kw),
      name,
      definition: read(definition),
    });
  }

type_definition
  = composite_type_definition
  / enum_type_definition

composite_type_definition
  = kw:(AS __) columns:(paren$empty_list / paren$list$column_definition) {
    return loc({
      type: "composite_type_definition",
      asKw: read(kw),
      columns: read(columns),
    });
  }

enum_type_definition
  = kw:(AS __ ENUM __) values:(paren$empty_list / paren$list$string_literal) {
    return loc({
      type: "enum_type_definition",
      asEnumKw: read(kw),
      values: read(values),
    });
  }

alter_type_stmt
  = kw:(ALTER __ TYPE __) name:entity_name actions:(__ list$alter_type_action) {
    return loc({
      type: "alter_type_stmt",
      alterTypeKw: read(kw),
      name,
      actions: read(actions),
    });
  }

alter_type_action
  = alter_action_owner_to
  / alter_action_rename
  / alter_action_set_schema
  / alter_action_add_enum_value
  / alter_action_rename_enum_value
  / alter_action_rename_attribute
  / alter_action_add_attribute
  / alter_action_drop_attribute
  / alter_action_alter_attribute

drop_type_stmt
  = kw:(DROP __ TYPE __) ifExistsKw:(if_exists __)? types:list$entity_name behaviorKw:(__ (CASCADE / RESTRICT))? {
    return loc({
      type: "drop_type_stmt",
      dropTypeKw: read(kw),
      ifExistsKw: read(ifExistsKw),
      types,
      behaviorKw: read(behaviorKw),
    });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * CREATE/ALTER/DROP DOMAIN                                                             *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
create_domain_stmt
  = kw:(CREATE __ DOMAIN __) name:(entity_name __) asKw:(AS __)? dataType:data_type
    constraints:(__ column_constraint)* {
      return loc({
        type: "create_domain_stmt",
        createDomainKw: read(kw),
        name: read(name),
        asKw: read(asKw),
        dataType,
        constraints: constraints.map(read),
      });
    }

alter_domain_stmt
  = kw:(ALTER __ DOMAIN __) name:entity_name action:(__ alter_domain_action) {
    return loc({
      type: "alter_domain_stmt",
      alterDomainKw: read(kw),
      name,
      action: read(action),
    });
  }

alter_domain_action
  = alter_action_owner_to
  / alter_action_rename
  / alter_action_set_schema
  / alter_action_set_default
  / alter_action_drop_default
  / alter_action_set_not_null
  / alter_action_drop_not_null
  / alter_action_rename_constraint
  / alter_action_validate_constraint
  / alter_action_drop_constraint
  / alter_action_add_constraint

drop_domain_stmt
  = kw:(DROP __ DOMAIN __) ifExistsKw:(if_exists __)? domains:list$entity_name behaviorKw:(__ (CASCADE / RESTRICT))? {
    return loc({
      type: "drop_domain_stmt",
      dropDomainKw: read(kw),
      ifExistsKw: read(ifExistsKw),
      domains,
      behaviorKw: read(behaviorKw),
    });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * CREATE/ALTER/DROP ROLE                                                               *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
create_role_stmt
  = kw:(CREATE __ (ROLE / USER / GROUP) __) name:entity_name withKw:(__ WITH)? options:(__ role_option)* {
    return loc({
      type: "create_role_stmt",
      createRoleKw: read(kw),
      name,
      withKw: read(withKw),
      options: options.map(read),
    });
  }

role_option
  = role_option_keyword
  / role_option_connection_limit
  / role_option_password
  / role_option_valid_until
  / role_option_in_role
  / role_option_role
  / role_option_admin
  / role_option_sysid

role_option_keyword
  = kw:(
    SUPERUSER / NOSUPERUSER /
    CREATEDB / NOCREATEDB /
    CREATEROLE / NOCREATEROLE /
    INHERIT / NOINHERIT /
    LOGIN / NOLOGIN /
    REPLICATION / NOREPLICATION /
    BYPASSRLS / NOBYPASSRLS
  ) {
    return loc({ type: "role_option_keyword", kw: read(kw) });
  }

role_option_connection_limit
  = kw:(CONNECTION __ LIMIT __) limit:number_literal {
    return loc({ type: "role_option_connection_limit", connectionLimitKw: read(kw), limit });
  }

role_option_password
  = encryptedKw:(ENCRYPTED __)? kw:(PASSWORD __) password:(string_literal / null_literal) {
    return loc({
      type: "role_option_password",
      encryptedKw: read(encryptedKw),
      passwordKw: read(kw),
      password,
    });
  }

role_option_valid_until
  = kw:(VALID __ UNTIL __) timestamp:string_literal {
    return loc({ type: "role_option_valid_until", validUntilKw: read(kw), timestamp });
  }

role_option_in_role
  = kw:(IN __ ROLE __) names:list$role_specification {
    return loc({ type: "role_option_in_role", inRoleKw: read(kw), names });
  }

role_option_role
  = kw:(ROLE __) names:list$role_specification {
    return loc({ type: "role_option_role", roleKw: read(kw), names });
  }

role_option_admin
  = kw:(ADMIN __) names:list$role_specification {
    return loc({ type: "role_option_admin", adminKw: read(kw), names });
  }

role_option_sysid
  = kw:(SYSID __) sysId:number_literal {
    return loc({ type: "role_option_sysid", sysIdKw: read(kw), sysId });
  }

alter_role_stmt
  = kw:(ALTER __ (ROLE / USER / GROUP) __)
    name:((role_specification / ALL) __)
    database:(in_database_clause __)?
    action:alter_role_action {
      return loc({
        type: "alter_role_stmt",
        alterRoleKw: read(kw),
        name: read(name),
        database: read(database),
        action,
      });
    }

in_database_clause
  = kw:(IN __ DATABASE __) name:ident {
    return loc({ type: "in_database_clause", inDatabaseKw: read(kw), name });
  }

alter_role_action
  = alter_action_with_role_options
  / alter_action_rename
  / alter_action_set_postgresql_option
  / alter_action_set_postgresql_option_from_current
  / alter_action_reset_postgresql_option
  / alter_action_add_user
  / alter_action_drop_user

alter_action_with_role_options
  = kw:WITH options:(__ role_option)+ {
    return loc({
      type: "alter_action_with_role_options",
      withKw: kw,
      options: options.map(read),
    });
  }
  / option:role_option options:(__ role_option)* {
    return loc({
      type: "alter_action_with_role_options",
      options: [option, ...options.map(read)],
    });
  }

alter_action_set_postgresql_option
  = kw:(SET __) name:(ident __) operator:("=" / TO) value:(__ (expr / keyword)) {
    return loc({
      type: "alter_action_set_postgresql_option",
      setKw: read(kw),
      name: read(name),
      operator,
      value: read(value),
    });
  }

alter_action_set_postgresql_option_from_current
  = kw:(SET __) name:(ident __) fromCurrentKw:(FROM __ CURRENT) {
    return loc({
      type: "alter_action_set_postgresql_option_from_current",
      setKw: read(kw),
      name: read(name),
      fromCurrentKw: read(fromCurrentKw),
    });
  }

alter_action_reset_postgresql_option
  = kw:(RESET __) name:(ident / ALL) {
    return loc({
      type: "alter_action_reset_postgresql_option",
      resetKw: read(kw),
      name,
    });
  }

alter_action_add_user
  = kw:(ADD __ USER __) users:list$ident {
    return loc({
      type: "alter_action_add_user",
      addUserKw: read(kw),
      users,
    });
  }

alter_action_drop_user
  = kw:(DROP __ USER __) users:list$ident {
    return loc({
      type: "alter_action_drop_user",
      dropUserKw: read(kw),
      users,
    });
  }

drop_role_stmt
  = kw:(DROP __ (ROLE / USER / GROUP) __) ifExistsKw:(if_exists __)? names:list$role_specification {
    return loc({
      type: "drop_role_stmt",
      dropRoleKw: read(kw),
      ifExistsKw: read(ifExistsKw),
      names,
    });
  }

set_role_stmt
  = kw:(SET __) scopeKw:((SESSION / LOCAL) __)? roleKw:(ROLE __) name:(NONE / ident / string_literal) {
    return loc({
      type: "set_role_stmt",
      setKw: read(kw),
      scopeKw: read(scopeKw),
      roleKw: read(roleKw),
      name,
    });
  }

reset_role_stmt
  = kw:(RESET __ ROLE) {
    return loc({ type: "reset_role_stmt", resetRoleKw: read(kw) });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * ANALYZE                                                                              *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
analyze_stmt
  = kw:ANALYZE tKw:(__ TABLE)? tables:(__ list$entity_name)? {
    return loc({
      type: "analyze_stmt",
      analyzeKw: kw,
      tableKw: read(tKw),
      tables: read(tables) || [],
    });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * EXPLAIN                                                                              *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
explain_stmt
  = kw:(explain_kw __) anKw:(ANALYZE __)? qpKw:(QUERY __ PLAN __)? stmt:statement {
    return loc({
      type: "explain_stmt",
      explainKw: read(kw),
      analyzeKw: read(anKw),
      queryPlanKw: read(qpKw),
      statement: stmt,
    });
  }

explain_kw
  = EXPLAIN
  / kw:DESCRIBE &mysql { return kw; }
  / kw:DESC &mysql { return kw; }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Transactions                                                                         *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
transaction_statement
  = start_transaction_stmt
  / commit_transaction_stmt
  / rollback_transaction_stmt
  / savepoint_stmt
  / release_savepoint_stmt

start_transaction_stmt
  = (&sqlite / &bigquery) kw:BEGIN bKw:(__ (DEFERRED / IMMEDIATE / EXCLUSIVE))? tKw:(__ TRANSACTION)? {
    return loc({
      type: "start_transaction_stmt",
      startKw: kw,
      behaviorKw: read(bKw),
      transactionKw: read(tKw),
    });
  }
  / &postgres kw:BEGIN tKw:(__ (TRANSACTION / WORK))? {
    return loc({
      type: "start_transaction_stmt",
      startKw: kw,
      transactionKw: read(tKw),
    });
  }
  / &mysql kw:BEGIN tKw:(__ WORK)? {
    return loc({
      type: "start_transaction_stmt",
      startKw: kw,
      transactionKw: read(tKw),
    });
  }
  / (&mysql / &postgres) kw:START tKw:(__ TRANSACTION) {
    return loc({
      type: "start_transaction_stmt",
      startKw: kw,
      transactionKw: read(tKw),
    });
  }

commit_transaction_stmt
  = kw:commit_kw tKw:(__ transaction_kw)? {
    return loc({
      type: "commit_transaction_stmt",
      commitKw: kw,
      transactionKw: read(tKw),
    });
  }

commit_kw
  = COMMIT
  / kw:END &sqlite { return kw; }

rollback_transaction_stmt
  = kw:ROLLBACK tKw:(__ transaction_kw)? sp:(__ rollback_to_savepoint)? {
    return loc({
      type: "rollback_transaction_stmt",
      rollbackKw: kw,
      transactionKw: read(tKw),
      savepoint: read(sp),
    });
  }

rollback_to_savepoint
  = toKw:(TO __) spKw:(SAVEPOINT __)? id:ident {
    return loc({
      type: "rollback_to_savepoint",
      toKw: read(toKw),
      savepointKw: read(spKw),
      savepoint: id,
    });
  }

transaction_kw
  = kw:TRANSACTION (&sqlite / &bigquery) { return kw; }
  / kw:WORK &mysql { return kw; }

savepoint_stmt
  = (&mysql / &sqlite) spKw:(SAVEPOINT __) id:ident {
    return loc({
      type: "savepoint_stmt",
      savepointKw: read(spKw),
      savepoint: id,
    });
  }

release_savepoint_stmt
  = (&mysql / &sqlite) kw:(RELEASE __) spKw:(SAVEPOINT __)? id:ident {
    return loc({
      type: "release_savepoint_stmt",
      releaseKw: read(kw),
      savepointKw: read(spKw),
      savepoint: id,
    });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * DCL: GRANT / REVOKE statements                                                       *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
dcl_statement
  = &bigquery x:(grant_stmt / revoke_stmt) { return x; }

grant_stmt
  = kw:(GRANT __) roles:(list$ident __)
    onKw:(ON __) resType:(resource_type_kw __) resName:(entity_name __)
    toKw:(TO __) users:(list$string_literal) {
      return loc({
        type: "grant_stmt",
        grantKw: read(kw),
        roles: read(roles),
        onKw: read(onKw),
        resourceType: read(resType),
        resourceName: read(resName),
        toKw: read(toKw),
        users,
      });
    }

revoke_stmt
  = kw:(REVOKE __) roles:(list$ident __)
    onKw:(ON __) resType:(resource_type_kw __) resName:(entity_name __)
    fromKw:(FROM __) users:(list$string_literal) {
      return loc({
        type: "revoke_stmt",
        revokeKw: read(kw),
        roles: read(roles),
        onKw: read(onKw),
        resourceType: read(resType),
        resourceName: read(resName),
        fromKw: read(fromKw),
        users,
      });
    }

resource_type_kw
  = SCHEMA
  / TABLE
  / VIEW
  / kw:(EXTERNAL __ TABLE) { return read(kw); }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Roles                                                                                *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */

// user_name or CURRENT_USER, SESSION_USER, CURRENT_ROLE
role_specification
  = paren_less_func_call / ident

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Procedural language                                                                  *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
proc_statement
  = labeled$block_stmt
  / declare_stmt
  / set_stmt
  / if_stmt
  / case_stmt
  / labeled$loop_stmt
  / labeled$repeat_stmt
  / labeled$while_stmt
  / x:labeled$for_stmt &bigquery { return x; }
  / break_stmt
  / continue_stmt
  / call_stmt
  / return_stmt
  / x:raise_stmt &bigquery { return x; }

labeled$__template__
  = beginLabel:(ident __) ":" stmt:(__ __template__) endLabel:(__ ident)? {
    return loc({
      type: "labeled_stmt",
      beginLabel: read(beginLabel),
      statement: read(stmt),
      endLabel: read(endLabel),
    });
  }
  / __template__

labeled$block_stmt = .
labeled$loop_stmt = .
labeled$while_stmt = .
labeled$repeat_stmt = .
labeled$for_stmt = .

block_stmt
  = beginKw:(BEGIN __) atomicKw:(atomic_kw __)?
    program:inner_program
    exception:(__ exception_clause)?
    endKw:(__ END) {
      return loc({
        type: "block_stmt",
        beginKw: read(beginKw),
        atomicKw: read(atomicKw),
        program,
        exception: read(exception),
        endKw: read(endKw),
      });
    }

atomic_kw
  = kw:ATOMIC &postgres { return kw; }

exception_clause
  = &bigquery kw:(EXCEPTION __) whenKw:(WHEN __) cond:(error_category __) thenKw:(THEN __) program:inner_program {
    return loc({
      type: "exception_clause",
      exceptionKw: read(kw),
      whenKw: read(whenKw),
      condition: read(cond),
      thenKw: read(thenKw),
      program,
    });
  }

error_category
  = kw:ERROR {
    return loc({ type: "error_category", errorKw: kw });
  }

declare_stmt
  = kw:(DECLARE __) names:list$ident type:(__ data_type)? deflt:(__ declare_default)? {
    return loc({
      type: "declare_stmt",
      declareKw: read(kw),
      names,
      dataType: read(type),
      default: read(deflt),
    });
  }

declare_default
  = kw:(DEFAULT __) expr:expr {
    return loc({
      type: "declare_default",
      defaultKw: read(kw),
      expr,
    });
  }

set_stmt
  = kw:(SET __) assignments:list$set_assignment {
    return loc({
      type: "set_stmt",
      setKw: read(kw),
      assignments,
    });
  }

set_assignment
  = &mysql name:((ident / variable / paren$list$ident / paren$list$variable) __) "=" value:(__ expr) {
    return loc({
      type: "binary_expr",
      left: read(name),
      operator: "=",
      right: read(value),
    })
  }
  / !mysql name:((ident / paren$list$ident) __) "=" value:(__ expr) {
    return loc({
      type: "binary_expr",
      left: read(name),
      operator: "=",
      right: read(value),
    });
  }

if_stmt
  = ifClause:(if_clause __) elifClauses:(elseif_clause __)* elseClause:(else_clause __)? endIfKw:(END __ IF) {
    return loc({
      type: "if_stmt",
      clauses: [
        read(ifClause),
        ...elifClauses.map(read),
        ...(elseClause ? [read(elseClause)] : []),
      ],
      endIfKw: read(endIfKw),
    });
  }

if_clause
  = ifKw:(IF __) condition:(expr __) thenKw:(THEN __) consequent:inner_program {
    return loc({
      type: "if_clause",
      ifKw: read(ifKw),
      condition: read(condition),
      thenKw: read(thenKw),
      consequent,
    });
  }

elseif_clause
  = elifKw:(ELSEIF __) condition:(expr __) thenKw:(THEN __) consequent:inner_program {
    return loc({
      type: "elseif_clause",
      elseifKw: read(elifKw),
      condition: read(condition),
      thenKw: read(thenKw),
      consequent,
    });
  }

else_clause
  = elseKw:(ELSE __) consequent:inner_program {
    return loc({
      type: "else_clause",
      elseKw: read(elseKw),
      consequent,
    });
  }

case_stmt
  = caseKw:CASE
    expr:(__ expr)?
    clauses:(__ case_stmt_when)+
    els:(__ case_stmt_else)?
    endKw:(__ END __ CASE) {
      return loc({
        type: "case_stmt",
        caseKw,
        expr: read(expr),
        clauses: [...clauses.map(read), ...(els ? [read(els)] : [])],
        endCaseKw: read(endKw),
      });
    }

case_stmt_when
  = whenKw:WHEN condition:(__ expr __) thenKw:THEN result:(__ inner_program) {
    return loc({
      type: "case_when",
      whenKw,
      condition: read(condition),
      thenKw,
      result: read(result),
    });
  }

case_stmt_else
  = kw:ELSE result:(__ inner_program) {
    return loc({
      type: "case_else",
      elseKw: kw,
      result: read(result),
    });
  }

loop_stmt
  = loopKw:(LOOP __) body:inner_program endLoopKw:(__ END __ LOOP) {
    return loc({
      type: "loop_stmt",
      loopKw: read(loopKw),
      body,
      endLoopKw: read(endLoopKw),
    });
  }

repeat_stmt
  = kw:(REPEAT __) body:(inner_program __) untilKw:(UNTIL __) cond:(expr __) endKw:(END __ REPEAT) {
    return loc({
      type: "repeat_stmt",
      repeatKw: read(kw),
      body: read(body),
      untilKw: read(untilKw),
      condition: read(cond),
      endRepeatKw: read(endKw),
    });
  }

while_stmt
  = kw:(WHILE __) cond:(expr __) doKw:(DO __) body:(inner_program __) endKw:(END __ WHILE) {
    return loc({
      type: "while_stmt",
      whileKw: read(kw),
      condition: read(cond),
      doKw: read(doKw),
      body: read(body),
      endWhileKw: read(endKw),
    });
  }

for_stmt
  = kw:(FOR __) left:(ident __) inKw:(IN __) right:((paren$expr / paren$compound_select_stmt) __)
    doKw:(DO __) body:(inner_program __) endKw:(END __ FOR) {
      return loc({
        type: "for_stmt",
        forKw: read(kw),
        left: read(left),
        inKw: read(inKw),
        right: read(right),
        doKw: read(doKw),
        body: read(body),
        endForKw: read(endKw),
      });
    }

break_stmt
  = kw:break_kw label:(__ ident)? {
    return loc({ type: "break_stmt", breakKw: kw, label: read(label) });
  }

break_kw
  = LEAVE
  / kw:BREAK &bigquery { return kw; }

continue_stmt
  = kw:continue_kw label:(__ ident)? {
    return loc({ type: "continue_stmt", continueKw: kw, label: read(label) });
  }

continue_kw
  = ITERATE
  / kw:CONTINUE &bigquery { return kw; }

call_stmt
  = kw:(CALL __) func:func_call {
    return loc({ type: "call_stmt", callKw: read(kw), func });
  }

return_stmt
  = (&mysql / &postgres) kw:(RETURN __) expr:expr {
    return loc({ type: "return_stmt", returnKw: read(kw), expr });
  }
  / &bigquery kw:RETURN {
    return loc({ type: "return_stmt", returnKw: kw });
  }

raise_stmt
  = kw:RAISE msg:(__ raise_message)? {
    return loc({ type: "raise_stmt", raiseKw: kw, message: read(msg) });
  }

raise_message
  = kw:(USING __ MESSAGE __) "=" string:(__ string_literal) {
    return loc({
      type: "raise_message",
      usingMessageKw: read(kw),
      string: read(string),
    });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Prepared statements                                                                  *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
execute_stmt
  = kw:(EXECUTE __) immedKw:(immediate_kw __)? expr:expr
    into:(__ execute_into_clause)?
    using:(__ execute_using_clause)? {
      return loc({
        type: "execute_stmt",
        executeKw: read(kw),
        immediateKw: read(immedKw),
        expr,
        into: read(into),
        using: read(using),
      });
    }

immediate_kw
  = x:IMMEDIATE &bigquery { return x; }

execute_into_clause
  = kw:(INTO __) variables:list$ident {
    return loc({
      type: "execute_into_clause",
      intoKw: read(kw),
      variables,
    });
  }

execute_using_clause
  = kw:(USING __) values:list$expr_or_explicit_alias {
    return loc({
      type: "execute_using_clause",
      usingKw: read(kw),
      values,
    });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * SQLite statements                                                                    *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
sqlite_statement
  = attach_database_stmt
  / detach_database_stmt
  / vacuum_stmt
  / pragma_stmt

attach_database_stmt
  = kw:(ATTACH __) dbKw:(DATABASE __)? file:(expr __) asKw:(AS __) schema:ident {
    return loc({
      type: "attach_database_stmt",
      attachKw: read(kw),
      databaseKw: read(dbKw),
      file: read(file),
      asKw: read(asKw),
      schema,
    });
  }

detach_database_stmt
  = kw:(DETACH __) dbKw:(DATABASE __)? schema:ident {
    return loc({
      type: "detach_database_stmt",
      detachKw: read(kw),
      databaseKw: read(dbKw),
      schema,
    });
  }

vacuum_stmt
  = kw:(VACUUM __) schema:(ident __)? intoKw:(INTO __) file:string_literal {
    return loc({
      type: "vacuum_stmt",
      vacuumKw: read(kw),
      schema: read(schema),
      intoKw: read(intoKw),
      file,
    });
  }
  / kw:(VACUUM __) schema:ident? {
    return loc({
      type: "vacuum_stmt",
      vacuumKw: read(kw),
      schema: read(schema),
    });
  }

pragma_stmt
  = kw:(PRAGMA __) pragma:(pragma_assignment / pragma_func_call / entity_name) {
    return loc({
      type: "pragma_stmt",
      pragmaKw: read(kw),
      pragma,
    });
  }

pragma_assignment
  = name:(entity_name __) "=" value:(__ pragma_value) {
    return loc({
      type: "pragma_assignment",
      name: read(name),
      value: read(value),
    });
  }

pragma_func_call
  = name:(__ entity_name) args:(__ paren$pragma_value) {
    return loc({
      type: "pragma_func_call",
      name: read(name),
      args: read(args),
    });
  }

pragma_value
  = kw:ident_name { return createKeyword(kw); }
  / literal

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * BigQuery statements                                                                  *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
bigquery_statement
  = create_bigquery_entity_stmt
  / drop_bigquery_entity_stmt
  / create_row_access_policy_stmt
  / drop_row_access_policy_stmt
  / alter_organization_stmt
  / alter_project_stmt
  / alter_bi_capacity_stmt
  / alter_capacity_stmt
  / alter_reservation_stmt
  / assert_stmt
  / export_data_stmt
  / load_data_stmt

// CREATE CAPACITY
// CREATE RESERVATION
// CREATE ASSIGNMENT
create_bigquery_entity_stmt
  = createKw:(CREATE __) kw:(bigquery_entity __) name:(entity_name __) options:bigquery_options {
    const entityKw = read(kw);
    const node = {
      createKw: read(createKw),
      name: read(name),
      options,
    };
    switch (entityKw.name) {
      case "CAPACITY": return loc({ type: "create_capacity_stmt", capacityKw: entityKw, ...node });
      case "RESERVATION": return loc({ type: "create_reservation_stmt", reservationKw: entityKw, ...node });
      case "ASSIGNMENT": return loc({ type: "create_assignment_stmt", assignmentKw: entityKw, ...node });
    }
  }

// DROP CAPACITY
// DROP RESERVATION
// DROP ASSIGNMENT
drop_bigquery_entity_stmt
  = dropKw:(DROP __) kw:(bigquery_entity __) ifKw:(if_exists __)? name:entity_name {
    const entityKw = read(kw);
    const node = {
      dropKw: read(dropKw),
      ifExistsKw: read(ifKw),
      name,
    };
    switch (entityKw.name) {
      case "CAPACITY": return loc({ type: "drop_capacity_stmt", capacityKw: entityKw,...node });
      case "RESERVATION": return loc({ type: "drop_reservation_stmt", reservationKw: entityKw,...node });
      case "ASSIGNMENT": return loc({ type: "drop_assignment_stmt", assignmentKw: entityKw,...node });
    }
  }

bigquery_entity
  = CAPACITY
  / RESERVATION
  / ASSIGNMENT

create_row_access_policy_stmt
  = kw:(CREATE __)
    orKw:(OR __ REPLACE __)?
    policyKw:(ROW __ ACCESS __ POLICY __)
    ifKw:(if_not_exists __)?
    name:(ident __)
    onKw:(ON __)
    table:entity_name
    clauses:(__ row_access_policy_clause)+ {
      return loc({
        type: "create_row_access_policy_stmt",
        createKw: read(kw),
        orReplaceKw: read(orKw),
        rowAccessPolicyKw: read(policyKw),
        ifNotExistsKw: read(ifKw),
        name: read(name),
        onKw: read(onKw),
        table: read(table),
        clauses: clauses.map(read),
      });
    }

row_access_policy_clause
  = row_access_policy_grant_clause
  / row_access_policy_filter_clause

row_access_policy_grant_clause
  = kw:(GRANT __ TO __) list:paren$list$string_literal {
    return loc({
      type: "row_access_policy_grant_clause",
      grantToKw: read(kw),
      grantees: list,
    });
  }

row_access_policy_filter_clause
  = kw:(FILTER __ USING __) expr:paren$list$expr {
    return loc({
      type: "row_access_policy_filter_clause",
      filterUsingKw: read(kw),
      expr,
    });
  }

drop_row_access_policy_stmt
  = kw:(DROP __)
    policyKw:(ROW __ ACCESS __ POLICY __)
    ifKw:(if_exists __)?
    name:(ident __)
    onKw:(ON __)
    table:entity_name {
      return loc({
        type: "drop_row_access_policy_stmt",
        dropKw: read(kw),
        rowAccessPolicyKw: read(policyKw),
        ifExistsKw: read(ifKw),
        name: read(name),
        onKw: read(onKw),
        table,
      });
    }
  / kw:(DROP __)
    allKw:(ALL __)
    policyKw:(ROW __ ACCESS __ POLICIES __)
    onKw:(ON __)
    table:entity_name {
      return loc({
        type: "drop_row_access_policy_stmt",
        dropKw: read(kw),
        allKw: read(allKw),
        rowAccessPolicyKw: read(policyKw),
        onKw: read(onKw),
        table,
      });
    }

alter_organization_stmt
  = kw:(ALTER __ ORGANIZATION __) action:alter_action_set_bigquery_options {
    return loc({
      type: "alter_organization_stmt",
      alterOrganizationKw: read(kw),
      actions: [action],
    });
  }

alter_project_stmt
  = kw:(ALTER __ PROJECT __) name:(ident __) action:alter_action_set_bigquery_options {
    return loc({
      type: "alter_project_stmt",
      alterProjectKw: read(kw),
      name: read(name),
      actions: [action],
    });
  }

alter_bi_capacity_stmt
  = kw:(ALTER __ BI_CAPACITY __) name:(entity_name __) action:alter_action_set_bigquery_options {
    return loc({
      type: "alter_bi_capacity_stmt",
      alterBiCapacityKw: read(kw),
      name: read(name),
      actions: [action],
    });
  }

alter_capacity_stmt
  = kw:(ALTER __ CAPACITY __) name:(entity_name __) action:alter_action_set_bigquery_options {
    return loc({
      type: "alter_capacity_stmt",
      alterCapacityKw: read(kw),
      name: read(name),
      actions: [action],
    });
  }

alter_reservation_stmt
  = kw:(ALTER __ RESERVATION __) name:(entity_name __) action:alter_action_set_bigquery_options {
    return loc({
      type: "alter_reservation_stmt",
      alterReservationKw: read(kw),
      name: read(name),
      actions: [action],
    });
  }

assert_stmt
  = kw:(ASSERT __) expr:expr as:(__ as_clause$string_literal)? {
    return loc({
      type: "assert_stmt",
      assertKw: read(kw),
      expr,
      as: read(as),
    });
  }

export_data_stmt
  = kw:(EXPORT __ DATA __) con:(with_connection_clause __)?
    options:(bigquery_options __) as:as_clause$compound_select_stmt {
      return loc({
        type: "export_data_stmt",
        exportDataKw: read(kw),
        withConnection: read(con),
        options: read(options),
        as,
      });
    }

load_data_stmt
  = kw:(LOAD __ DATA __) intoKw:((INTO / OVERWRITE) __) table:entity_name
    columns:(__ paren$list$column_definition)? clauses:(__ load_data_clause)* {
      return loc({
        type: "load_data_stmt",
        loadDataKw: read(kw),
        intoKw: read(intoKw),
        table,
        columns: read(columns),
        clauses: clauses.map(read),
      });
    }

load_data_clause
  = partition_by_clause
  / cluster_by_clause
  / bigquery_options
  / from_files_options
  / with_partition_columns_clause
  / with_connection_clause

from_files_options
  = kw:(FROM __ FILES __) options:paren$list$equals_expr {
    return loc({
      type: "from_files_options",
      fromFilesKw: read(kw),
      options,
    });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * PostgreSQL                                                                           *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
postgresql_with_options
  = kw:(WITH __) options:paren$list$table_option_postgresql {
    return loc({
      type: "postgresql_with_options",
      withKw: read(kw),
      options,
    });
  }

table_option_postgresql
  = name:(member_expr __) "=" v:(__ (expr / keyword)) {
    return loc({
      type: "table_option",
      name: read(name),
      hasEq: true,
      value: read(v),
    });
  }
  / name:member_expr {
    return loc({
      type: "table_option",
      name: read(name),
    });
  }

postgresql_options
  = kw:(OPTIONS __) options:paren$list$postgresql_option_element {
    return loc({
      type: "postgresql_options",
      optionsKw: read(kw),
      options,
    });
  }

postgresql_option_element
  = name:(ident __) value:string_literal {
    return loc({
      type: "postgresql_option_element",
      name: read(name),
      value,
    });
  }

postgresql_operator_class
  = &postgres name:member_expr options:(__ paren$list$table_option_postgresql)? {
    return loc({ type: "postgresql_operator_class", name, options: read(options) });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Table options                                                                        *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
table_options
  = (&sqlite / &mysql) head:table_option tail:(__ "," __ table_option)* {
    return loc(createListExpr(head, tail));
  }

table_option
  = &sqlite opt:table_option_sqlite { return opt; }
  / &mysql opt:table_option_mysql { return opt; }

table_option_sqlite
  = kw:(STRICT / WITHOUT __ ROWID) {
    return loc({ type: "table_option", name: read(kw) });
  }

table_option_mysql
  = kw:(mysql_table_opt_name __) "=" v:(__ mysql_table_opt_value) {
    return loc({
      type: "table_option",
      name: read(kw),
      hasEq: true,
      value: read(v),
    });
  }
  / kw:(mysql_table_opt_name __) v:mysql_table_opt_value {
    return loc({
      type: "table_option",
      name: read(kw),
      value: read(v),
    });
  }
  / kw:(START __ TRANSACTION) {
    return loc({
      type: "table_option",
      name: read(kw),
    });
  }

mysql_table_opt_name
  = AUTOEXTEND_SIZE
  / AUTO_INCREMENT
  / AVG_ROW_LENGTH
  / kw:(DEFAULT __ CHARACTER __ SET) { return read(kw); }
  / kw:(CHARACTER __ SET) { return read(kw); }
  / CHECKSUM
  / kw:(DEFAULT __ COLLATE) { return read(kw); }
  / COLLATE
  / COMMENT
  / COMPRESSION
  / CONNECTION
  / kw:(DATA __ DIRECTORY) { return read(kw); }
  / kw:(INDEX __ DIRECTORY) { return read(kw); }
  / DELAY_KEY_WRITE
  / ENCRYPTION
  / ENGINE
  / ENGINE_ATTRIBUTE
  / INSERT_METHOD
  / KEY_BLOCK_SIZE
  / MAX_ROWS
  / MIN_ROWS
  / PACK_KEYS
  / PASSWORD
  / ROW_FORMAT
  / SECONDARY_ENGINE_ATTRIBUTE
  / STATS_AUTO_RECALC
  / STATS_PERSISTENT
  / STATS_SAMPLE_PAGES
  / TABLESPACE
  / STORAGE
  / UNION

mysql_table_opt_value
  = string_literal
  / number_literal
  / ident
  / paren$list$entity_name // for UNION
  / DEFAULT
  / DYNAMIC / FIXED / COMPRESSED / REDUNDANT / COMPACT  // for ROW_FORMAT
  / NO / FIRST / LAST  // for INSERT_METHOD
  / DISK / MEMORY  // for STORAGE

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Constraints                                                                          *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
column_constraint
  = name:(constraint_name __)?
    constraint:column_constraint_type
    modifiers:(__ constraint_modifier)* {
      if (!name && modifiers.length === 0) {
        return constraint;
      }
      return loc({
        type: "constraint",
        name: read(name),
        constraint,
        modifiers: modifiers.map(read),
      });
    }

table_constraint
  = name:(constraint_name __)?
    constraint:table_constraint_type
    modifiers:(__ constraint_modifier)* {
      if (!name && modifiers.length === 0) {
        return constraint;
      }
      return loc({
        type: "constraint",
        name: read(name),
        constraint,
        modifiers: modifiers.map(read),
      });
    }

constraint_name
  = kw:CONSTRAINT name:(__ ident)? {
    return loc({
      type: "constraint_name",
      constraintKw: kw,
      name: read(name),
    });
  }

constraint_modifier
  = (&postgres / &sqlite)
    kw:(
        DEFERRABLE
      / NOT __ DEFERRABLE
      / INITIALLY __ (IMMEDIATE / DEFERRED)
    ) {
      return loc({
        type: "constraint_modifier",
        kw: read(kw),
      });
    }
  / &postgres kw:( NO __ INHERIT / NOT __ VALID) {
      return loc({
        type: "constraint_modifier",
        kw: read(kw),
      });
    }
  / (&only_mysql / &bigquery) kw:(NOT __ ENFORCED) {
      return loc({
        type: "constraint_modifier",
        kw: read(kw),
      });
    }
  / &only_mysql kw:(ENFORCED) {
      return loc({
        type: "constraint_modifier",
        kw: read(kw),
      });
    }

column_constraint_type
  = constraint_not_null
  / !bigquery con:constraint_null { return con; }
  / constraint_default
  / constraint_collate
  / column_constraint_primary_key
  / references_specification
  / !bigquery con:column_constraint_type_common { return con; }
  / &mysql con:column_constraint_type_mysql { return con; }
  / &bigquery con:bigquery_options { return con; }
  / &postgres con:column_constraint_type_postgresql { return con; }

column_constraint_type_common
  = column_constraint_unique
  / constraint_check
  / constraint_generated
  / constraint_auto_increment

column_constraint_type_mysql
  = constraint_comment
  / constraint_visible
  / constraint_column_format
  / constraint_storage
  / constraint_engine_attribute

column_constraint_type_postgresql
  = constraint_storage
  / constraint_compression
  / constraint_generated_as_identity
  / postgresql_options

constraint_not_null
  = kws:(NOT __ NULL) clauses:(__ on_conflict_clause)|0..1| {
    return loc({
      type: "constraint_not_null",
      notNullKw: read(kws),
      clauses: clauses.map(read),
    });
  }

constraint_null
  = kw:NULL {
    return loc({ type: "constraint_null", nullKw: kw });
  }

constraint_default
  = kw:DEFAULT e:(__ expr) {
    return loc({ type: "constraint_default", defaultKw: kw, expr: read(e) });
  }

constraint_auto_increment
  = kw:auto_increment_kw {
    return loc({ type: "constraint_auto_increment", autoIncrementKw: kw });
  }

auto_increment_kw
  = kw:AUTOINCREMENT &sqlite { return kw; }
  / kw:AUTO_INCREMENT &mysql { return kw; }

constraint_comment
  = kw:COMMENT str:(__ string_literal) {
    return loc({
      type: "constraint_comment",
      commentKw: kw,
      value: read(str),
    });
  }

constraint_collate
  = kw:COLLATE id:(__ (ident / string_literal)) {
    return loc({
      type: "constraint_collate",
      collateKw: kw,
      collation: read(id),
    });
  }

constraint_visible
  = kw:(VISIBLE / INVISIBLE) {
    return loc({ type: "constraint_visible", visibleKw: kw });
  }

constraint_column_format
  = kw:(COLUMN_FORMAT __) f:(FIXED / DYNAMIC / DEFAULT) {
    return loc({
      type: "constraint_column_format",
      columnFormatKw: read(kw),
      formatKw: f,
    });
  }

constraint_storage
  = kw:(STORAGE __) t:(mysql_storage_type / pg_storage_type) {
    return loc({
      type: "constraint_storage",
      storageKw: read(kw),
      typeKw: t,
    });
  }

mysql_storage_type = t:(DISK / MEMORY) &mysql { return t; }

pg_storage_type = t:(PLAIN / EXTERNAL / EXTENDED / MAIN / DEFAULT) &postgres { return t; }

constraint_engine_attribute
  = kw:(ENGINE_ATTRIBUTE / SECONDARY_ENGINE_ATTRIBUTE) eq:(__ "=")? v:(__ string_literal) {
    return loc({
      type: "constraint_engine_attribute",
      engineAttributeKw: eq ? trailing(kw, eq[0]) : kw,
      hasEq: !!eq,
      value: read(v),
    });
  }

constraint_compression
  = kw:(COMPRESSION __) method:(ident / default) {
    return loc({
      type: "constraint_compression",
      compressionKw: read(kw),
      method,
    });
  }

constraint_generated
  = kws:(GENERATED __ ALWAYS __)? asKw:AS expr:(__ paren$expr)
    stKw:(__ (STORED / VIRTUAL))? {
      return loc({
        type: "constraint_generated",
        generatedKw: kws ? read(kws) : undefined,
        asKw,
        expr: read(expr),
        storageKw: read(stKw),
      });
    }

constraint_generated_as_identity
  = kws:(GENERATED __ ALWAYS / GENERATED __ BY __ DEFAULT)
    asKw:(__ AS) identity:(__ identity_column)
    sequenceOptions:(__ paren$sequence_option_list)? {
      return loc({
        type: "constraint_generated",
        generatedKw: read(kws),
        asKw: read(asKw),
        expr: read(identity),
        sequenceOptions: read(sequenceOptions),
      });
    }

identity_column = kw:IDENTITY {
  return loc({ type: "identity_column", identityKw: kw });
}

table_constraint_type
  = table_constraint_primary_key
  / constraint_foreign_key
  / !bigquery con:table_constraint_unique { return con; }
  / !bigquery con:constraint_check { return con; }
  / &mysql con:table_constraint_index { return con; }
  / &postgres con:table_constraint_exclude { return con; }

table_constraint_primary_key
  = kws:(PRIMARY __ KEY __)
    columns:(paren$list$index_specification / existing_index)
    clauses:(__ (on_conflict_clause / index_parameter_clause))* {
      return loc({
        type: "constraint_primary_key",
        primaryKeyKw: read(kws),
        columns,
        clauses: clauses.map(read),
      });
    }

column_constraint_primary_key
  = kws:primary_key_keyword direction:(__ sqlite_sort_direction)?
    clauses:(__ (on_conflict_clause / index_parameter_clause))* {
      return loc({
        type: "constraint_primary_key",
        primaryKeyKw: read(kws),
        direction: read(direction),
        clauses: clauses.map(read),
      });
    }

primary_key_keyword
  = PRIMARY __ KEY
  / kw:KEY &mysql { return kw; }

sqlite_sort_direction
  = dir:sort_direction &sqlite { return dir; }

existing_index
  = kw:(USING __ INDEX __) index:ident {
    return loc({
      type: "existing_index",
      usingIndexKw: read(kw),
      index,
    });
  }

table_constraint_unique
  = kws:(unique_key __)
    nullsKw:(nulls_distinctness __)?
    columns:(paren$list$column / existing_index)
    clauses:(__ (on_conflict_clause / index_parameter_clause))* {
      return loc({
        type: "constraint_unique",
        uniqueKw: read(kws),
        nullsKw: read(nullsKw),
        columns,
        clauses: clauses.map(read),
      });
    }

column_constraint_unique
  = kws:unique_key nullsKw:(__ nulls_distinctness)?
    clauses:(__ (on_conflict_clause / index_parameter_clause))* {
      return loc({
        type: "constraint_unique",
        uniqueKw: kws,
        nullsKw: read(nullsKw),
        clauses: clauses.map(read),
      });
    }

nulls_distinctness
  = kw:(NULLS __ DISTINCT / NULLS __ NOT __ DISTINCT) { return read(kw); }

unique_key
  = kws:(UNIQUE __ (INDEX / KEY) / UNIQUE) {
    return read(kws);
  }

constraint_check
  = kw:CHECK expr:(__ paren$expr)
    clauses:(__ on_conflict_clause)|0..1| {
      return loc({
        type: "constraint_check",
        checkKw: kw,
        expr: read(expr),
        clauses: clauses.map(read),
      });
    }

constraint_foreign_key
  = kws:(FOREIGN __ KEY __)
    name:(ident __)?
    columns:paren$list$column
    ref:(__ references_specification) {
      return loc({
        type: "constraint_foreign_key",
        foreignKeyKw: read(kws),
        indexName: read(name),
        columns,
        references: read(ref),
      });
    }

references_specification
  = kw:(REFERENCES __)
    table:entity_name
    columns:(__ paren$list$column)?
    options:(__ (referential_action / referential_match))* {
      return loc({
        type: "references_specification",
        referencesKw: read(kw),
        table,
        columns: read(columns),
        options: options.map(read),
      });
    }

referential_action
  = onKw:(ON __) eventKw:((UPDATE / DELETE) __) actionKw:reference_action_type columns:(__ paren$list$column)? {
    return loc({
      type: "referential_action",
      onKw: read(onKw),
      eventKw: read(eventKw),
      actionKw,
      columns: read(columns),
    });
  }

referential_match
  = matchKw:(MATCH __) typeKw:(FULL / PARTIAL / SIMPLE) {
    return loc({
      type: "referential_match",
      matchKw: read(matchKw),
      typeKw,
    });
  }

reference_action_type
  = kws:(RESTRICT / CASCADE / SET __ NULL / NO __ ACTION / SET __ DEFAULT) { return read(kws); }

table_constraint_index
  = kw:((INDEX / KEY) __)
    columns:paren$list$column {
      return loc({
        type: "constraint_index",
        indexKw: read(kw),
        columns,
      });
    }
  / typeKw:((FULLTEXT / SPATIAL) __)
    kw:((INDEX / KEY) __ )?
    columns:paren$list$column {
      return loc({
        type: "constraint_index",
        indexTypeKw: read(typeKw),
        indexKw: read(kw),
        columns,
      });
    }

table_constraint_exclude
  = kw:(EXCLUDE __) using:(using_access_method_clause __)?
    params:paren$list$exclusion_param
    clauses:(__ (index_parameter_clause / where_clause))*  {
      return loc({
        type: "constraint_exclude",
        excludeKw: read(kw),
        using: read(using),
        params,
        clauses: clauses.map(read),
      });
    }

exclusion_param
  = index:index_specification withKw:(__ WITH __) operator:(postgresql_operator / postgresql_operator_expr) {
    return loc({
      type: "exclusion_param",
      index,
      withKw: read(withKw),
      operator,
    });
  }

on_conflict_clause
  = kws:(ON __ CONFLICT __) res:(ROLLBACK / ABORT / FAIL / IGNORE / REPLACE) {
    return loc({
      type: "on_conflict_clause",
      onConflictKw: read(kws),
      resolutionKw: res,
    });
  }

index_parameter_clause
  = index_include_clause
  / postgresql_with_options
  / index_tablespace_clause

index_tablespace_clause
  = kw:(USING __ INDEX __ TABLESPACE __) name:ident {
    return loc({
      type: "index_tablespace_clause",
      usingIndexTablespaceKw: read(kw),
      name,
    });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Data types                                                                           *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
data_type
  = &postgres head:named_data_type tail:(__ array_bounds)+ {
    return loc(createArrayDataTypeChain(head, tail));
  }
  / &postgres dataType:named_data_type tz:(__ (WITHOUT / WITH) __ TIME __ ZONE) {
    return loc({
      type: "with_time_zone_data_type",
      dataType,
      withTimeZoneKw: read(tz),
    });
  }
  / named_data_type

array_bounds
  = "[" bounds:(__ empty __) "]" {
    return loc({ type: "array_bounds", bounds: read(bounds) });
  }
  / "[" bounds:(__ number_literal __) "]" {
    return loc({ type: "array_bounds", bounds: read(bounds) });
  }

named_data_type
  = kw:(type_name __) params:paren$list$literal {
    return loc({ type: "named_data_type", name: read(kw), params });
  }
  / &bigquery type:(bigquery_array_type / bigquery_struct_type / bigquery_table_type) {
    return type;
  }
  / kw:type_name {
    return loc({ type: "named_data_type", name: kw });
  }

bigquery_array_type
  = kw:ARRAY params:(__ generic_type_params)? {
    return loc({ type: "named_data_type", name: read(kw), params: read(params) });
  }

bigquery_struct_type
  = kw:STRUCT params:(__ generic_type_params)? {
    return loc({ type: "named_data_type", name: read(kw), params: read(params) });
  }

bigquery_table_type
  = kw:TABLE params:(__ generic_type_params) {
    return loc({ type: "named_data_type", name: read(kw), params: read(params) });
  }

generic_type_params
  = "<" list:(__ list$type_param __) ">" {
    return loc({
      type: "generic_type_params",
      params: read(list),
    });
  }

type_param
  = struct_type_param
  / array_type_param

struct_type_param
  = name:(ident __) dataType:data_type constraints:(__ column_constraint_type)* {
    return loc({
      type: "struct_type_param",
      name: read(name),
      dataType,
      constraints: constraints.map(read),
    });
  }

array_type_param
  = dataType:data_type constraints:(__ column_constraint_type)* {
    return loc({
      type: "array_type_param",
      dataType,
      constraints: constraints.map(read),
    });
  }

table_data_type
  = &postgres kw:(TABLE __) columns:paren$list$column_definition {
    return loc({ type: "table_data_type", tableKw: read(kw), columns });
  }

type_name
  = &bigquery t:type_name_bigquery { return t; }
  / &mysql t:type_name_mysql { return t; }
  / &postgres t:type_name_postgresql { return t; }
  / &sqlite t:type_name_sqlite { return t; }

type_name_bigquery
  = BOOL
  / BYTES
  / GEOGRAPHY
  / INTERVAL
  / JSON
  / STRING
  // datetime types
  / DATE
  / DATETIME
  / TIME
  / TIMESTAMP
  // numeric types
  / INT
  / INT64
  / SMALLINT
  / INTEGER
  / BIGINT
  / TINYINT
  / BYTEINT
  / NUMERIC
  / DECIMAL
  / BIGNUMERIC
  / BIGDECIMAL
  / FLOAT64
  // used in TABLE FUNCTION parameters list
  / kw:(ANY __ TYPE) { return read(kw); }

type_name_mysql
  = BOOLEAN
  / BOOL
  / BLOB
  / TINYBLOB
  / MEDIUMBLOB
  / LONGBLOB
  / BINARY
  / VARBINARY
  / DATE
  / DATETIME
  / TIME
  / TIMESTAMP
  / YEAR
  / CHAR
  / NCHAR
  / VARCHAR
  / NVARCHAR
  / TINYTEXT
  / TEXT
  / MEDIUMTEXT
  / LONGTEXT
  / NUMERIC
  / FIXED
  / DECIMAL
  / DEC
  / INT
  / INTEGER
  / SMALLINT
  / TINYINT
  / MEDIUMINT
  / BIGINT
  / FLOAT
  / kws:(DOUBLE __ PRECISION) { return read(kws); }
  / kws:(VARYING __ CHARACTER) { return read(kws); }
  / kws:(NATIVE __ CHARACTER) { return read(kws); }
  / DOUBLE
  / REAL
  / BIT
  / JSON
  / ENUM
  / SET

type_name_postgresql
  = kws:(BIT __ VARYING) { return read(kws); }
  / kws:(CHARACTER __ VARYING) { return read(kws); }
  / kws:(DOUBLE __ PRECISION) { return read(kws); }
  / interval_type_name_postgresql
  / unreserved_keyword // custom types
  / quoted_ident // custom types

interval_type_name_postgresql
  = kws:(INTERVAL __ interval_unit_kw __ TO __ interval_unit_kw) { return read(kws); }
  / kws:(INTERVAL __ interval_unit_kw) { return read(kws); }
  / INTERVAL

type_name_sqlite
  = head:unreserved_keyword tail:(__ unreserved_keyword)* {
    if (tail.length === 0) {
      return head;
    }
    return [head, ...tail.map(read)];
  }

/**
 * Expressions
 *
 * Most dialects support the basic logical operators:
 *
 *   OR
 *   AND
 *   NOT
 *
 * But MySQL additionally includes XOR, assignment and AND/OR alternates:
 *
 *   :=
 *   OR, ||
 *   XOR
 *   AND, &&
 *   NOT
 */
expr
  = &mysql x:mysql_assign_expr { return x; }
  / !mysql x:or_expr { return x; }

mysql_assign_expr
  = left:mysql_or_expr createAssignOp:_mysql_assign_expr_right? {
    if (createAssignOp) {
      return loc(createAssignOp(left));
    } else {
      return left;
    }
  }

_mysql_assign_expr_right
  = c1:__ op:":=" c2:__ right:mysql_assign_expr {
    return (left: any) => createBinaryExpr(left, c1, op, c2, right);
  }

mysql_or_expr = head:mysql_xor_expr tail:(__ (OR / "||") __ mysql_xor_expr)* {
    return createBinaryExprChain(head, tail);
  }

mysql_xor_expr
  = head:mysql_and_expr tail:(__ XOR __ mysql_and_expr)* {
    return createBinaryExprChain(head, tail);
  }

mysql_and_expr
  = head:not_expr tail:(__ (AND / "&&") __ not_expr)* {
    return createBinaryExprChain(head, tail);
  }

or_expr
  = head:and_expr tail:(__ OR __ and_expr)* {
    return createBinaryExprChain(head, tail);
  }

and_expr
  = head:not_expr tail:(__ AND __ not_expr)* {
    return createBinaryExprChain(head, tail);
  }

not_expr
  = kw:NOT expr:(__ not_expr) {
    return loc(createPrefixOpExpr(kw, read(expr)));
  }
  / &postgres x:pg_is_expr { return x; }
  / !postgres x:comparison_expr { return x; }

/**
 * Comparison operators
 *
 * Most dialects treat <, >, != etc operators with same precedence as LIKE, IS
 *
 * PostgreSQL has however different levels for:
 * 1. IS ISNULL NOTNULL
 * 2. < > = <= >= <>
 * 3. BETWEEN IN LIKE ILIKE SIMILAR
 */
pg_is_expr
  = left:pg_comparison_expr rightFn:_pg_is_expr_right? {
    if (rightFn) {
      return loc(rightFn(left));
    } else {
      return left;
    }
  }

_pg_is_expr_right
  = op:(__ unary_comparison_op) {
    return (expr: any) => createPostfixOpExpr(read(op), expr);
  }
  / tail:(__ is_op __ pg_comparison_expr)+ {
    return (head: any) => createBinaryExprChain(head, tail);
  }

pg_comparison_expr
  = head:pg_in_expr tail:(__ (">=" / ">" / "<=" / "<>" / "<" / "=" / "!=") __ (quantifier_expr / pg_in_expr))* {
    return loc(createBinaryExprChain(head, tail));
  }

pg_in_expr
  = left:sub_comparison_expr rightFn:_pg_in_expr_right? {
    if (rightFn) {
      return loc(rightFn(left));
    } else {
      return left;
    }
  }

_pg_in_expr_right
  = c1:__ op:(NOT __ IN / IN) c2:__ right:(paren$list$expr / sub_comparison_expr) {
    return (left: any) => createBinaryExpr(left, c1, read(op), c2, right);
  }
  / c1:__ op:pg_like_op c2:__ right:escape_expr {
    return (left: any) => createBinaryExpr(left, c1, read(op), c2, right);
  }
  / betweenKw:(__ pg_between_op) begin:(__ sub_comparison_expr) andKw:(__ AND) end:(__ sub_comparison_expr) {
    return (left: any) => ({
      type: "between_expr",
      left: left,
      betweenKw: read(betweenKw),
      begin: read(begin),
      andKw: read(andKw),
      end: read(end),
    });
  }

pg_like_op
  = LIKE / ILIKE / SIMILAR __ TO
  / NOT __ LIKE / NOT __ ILIKE / NOT __ SIMILAR __ TO

pg_between_op
  = kws:(NOT __ BETWEEN __ SYMMETRIC / BETWEEN __ SYMMETRIC / NOT __ BETWEEN / BETWEEN) { return read(kws); }

comparison_expr
  = left:sub_comparison_expr rightFn:_comparison_expr_right? {
    if (rightFn) {
      return loc(rightFn(left));
    } else {
      return left;
    }
  }
  / &mysql x:full_text_match_expr { return x; }

_comparison_expr_right
  = op:(__ unary_comparison_op) {
    return (expr: any) => createPostfixOpExpr(read(op), expr);
  }
  / tail:(__ comparison_op __ (x:quantifier_expr &mysql { return x; } / sub_comparison_expr))+ {
    return (head: any) => createBinaryExprChain(head, tail);
  }
  / c1:__ op:(NOT __ IN / IN) c2:__ right:(paren$list$expr / sub_comparison_expr / &bigquery e:unnest_expr { return e; }) {
    return (left: any) => createBinaryExpr(left, c1, read(op), c2, right);
  }
  / c1:__ op:(NOT __ LIKE / LIKE) c2:__ right:(&bigquery x:quantifier_expr { return x; } / escape_expr) {
    return (left: any) => createBinaryExpr(left, c1, read(op), c2, right);
  }
  / &only_mysql c1:__ op:(MEMBER __ OF) c2:__ right:paren$string_literal {
    return (left: any) => createBinaryExpr(left, c1, read(op), c2, right);
  }
  / &mysql c1:__ op:(SOUNDS __ LIKE) c2:__ right:sub_comparison_expr {
    return (left: any) => createBinaryExpr(left, c1, read(op), c2, right);
  }
  / betweenKw:(__ between_op) begin:(__ sub_comparison_expr) andKw:(__ AND) end:(__ sub_comparison_expr) {
    return (left: any) => ({
      type: "between_expr",
      left: left,
      betweenKw: read(betweenKw),
      begin: read(begin),
      andKw: read(andKw),
      end: read(end),
    });
  }

unary_comparison_op
  = kw:(NOTNULL / ISNULL) (&sqlite / &postgres) {
    return kw;
  }
  / kws:(NOT __ NULL) &sqlite {
    return read(kws);
  }
  / kws:(IS __ UNKNOWN / IS __ NOT __ UNKNOWN) (&mysql / &bigquery / &postgres) {
    return read(kws);
  }
  / kws:(IS __ NOT __ normalization_form __ NORMALIZED / IS __ normalization_form __ NORMALIZED) &postgres {
    return read(kws);
  }
  / kws:(IS __ NOT __ NORMALIZED / IS __ NORMALIZED) &postgres {
    return read(kws);
  }

normalization_form
  = NFC / NFD / NFKC / NFKD

comparison_op
  = op:"<=>" &mysql { return op; }
  / op:"==" &sqlite { return op; }
  / ">="
  / ">"
  / "<="
  / "<>"
  / "<"
  / "="
  / "!="
  / is_op
  / regexp_op

is_op
  = kws:(IS __ NOT __ DISTINCT __ FROM) (&sqlite / &bigquery / &postgres) { return read(kws); }
  / kws:(IS __ DISTINCT __ FROM) (&sqlite / &bigquery / &postgres) { return read(kws); }
  / kws:(IS __ NOT) { return read(kws); }
  / kws:(IS) { return read(kws); }

regexp_op
  = op:(NOT __ regexp_op_kw / regexp_op_kw) { return read(op); }

regexp_op_kw
  = REGEXP
  / kw:RLIKE &mysql { return kw; }
  / kw:GLOB &sqlite { return kw; }
  / kw:MATCH &sqlite { return kw; }

escape_expr
  = left:sub_comparison_expr c1:__ op:ESCAPE c2:__ right:string_literal {
    return loc(createBinaryExpr(left, c1, op, c2, right));
  }
  / sub_comparison_expr

between_op
  = kws:(NOT __ BETWEEN / BETWEEN) { return read(kws); }

quantifier_expr
  = op:((ANY / SOME / ALL) __) expr:(paren$compound_select_stmt / paren$list$expr) {
    return loc({
      type: "quantifier_expr",
      quantifierKw: read(op),
      expr,
    });
  }

full_text_match_expr
  = mKw:MATCH cols:(__ paren$list$ident __) aKw:AGAINST args:(__ paren$full_text_match_args) {
    return loc({
      type: "full_text_match_expr",
      matchKw: read(mKw),
      columns: read(cols),
      againstKw: read(aKw),
      args: read(args),
    });
  }

full_text_match_args
  = expr:sub_comparison_expr mod:(__ full_text_modifier)? {
    return loc({
      type: "full_text_match_args",
      expr,
      modifier: read(mod),
    });
  }

full_text_modifier
  = mod:(IN __ NATURAL __ LANGUAGE __ MODE __ WITH __ QUERY __ EXPANSION
  / IN __ NATURAL __ LANGUAGE __ MODE
  / IN __ BOOLEAN __ MODE
  / WITH __ QUERY __ EXPANSION) {
    return read(mod);
  }

/**
 * There's a variation in which sort of expressions come next
 * in precedence order after the comparison expressions (>, <, =, IN, IS, ...),
 * but before the additive (+ / -) expressions.
 *
 * For most dialects these are bitwise operators: |, &, ^, <<, >>
 * which come in the order of precedence: OR < XOR < AND < SHIFT.
 *
 * PostgreSQL though supports any kind of custom operator in this place,
 * and they all have the same precedence.
 */
sub_comparison_expr
  = !postgres x:bitwise_or_expr { return x; }
  / &postgres x:pg_other_expr { return x; }

pg_other_expr
  = head:pg_other_unary_expr tail:(__ (pg_other_op / postgresql_operator_expr)  __ pg_other_unary_expr)* {
    return createBinaryExprChain(head, tail);
  }

// TODO: Actually Postgres allows combinations of all these symbols:
//
//   + - * / < > = ~ ! @ # % ^ & | ` ?
//
pg_other_op
  = op:(
    // multi-letter operators (non-exhaustive list)
    "||/" / "|/" / "||" / ">>" / "<<" / "!~~*" / "~~*" / "!~~" / "~~" / "!~*" / "~*" / "!~" / "^@"
    // JSON operators
    / "->>" / "->" / "#>>" / "#>"
    // JSONB operators
    / "@>" / "<@" / "?|" / "?&" / "#-" / "@?" / "@@"
    // single-letter operators (exhaustive list)
    / "!" / "~" / "@" / "#" / "&" / "|" / "`" / "?"
  ) {
    return op;
  }

postgresql_operator_expr
  = op:(OPERATOR __) expr:paren$postgresql_op {
    return loc({
      type: "postgresql_operator_expr",
      operatorKw: read(op),
      expr: expr,
    });
  }

postgresql_op
  = postgresql_operator_member_expr / postgresql_operator

postgresql_operator_member_expr
  = object:(member_expr __) "." property:(__ postgresql_operator) {
    return loc({
      type: "member_expr",
      object: read(object),
      property: read(property),
    });
  }

postgresql_operator
  = op:[-+*/<>=~!@#%^&|`?]+ {
    return loc({
      type: "postgresql_operator",
      operator: text(),
    });
  }

// Some of these PostgreSQL operators above can also be unary
pg_other_unary_expr
  = op:("~" / postgresql_operator_expr) right:(__ pg_other_unary_expr) {
    return loc(createPrefixOpExpr(op, read(right)));
  }
  / pg_additive_expr

/**
 * The precedence of PostgreSQL operators starting from addition:
 *
 * addition: + -
 * multiplication: * / %
 * exponentiation: ^
 * time zone: AT TIME ZONE
 * collation: COLLATE
 * negation: - + ~
 * cast: ::
 */
pg_additive_expr
  = head:pg_multiplicative_expr tail:(__ additive_operator  __ pg_multiplicative_expr)* {
    return createBinaryExprChain(head, tail);
  }

pg_multiplicative_expr
  = head:pg_exponent_expr tail:(__ ("*" / "/" / "%")  __ pg_exponent_expr)* {
      return createBinaryExprChain(head, tail);
    }

pg_exponent_expr
  = head:pg_at_time_zone_expr tail:(__ "^"  __ pg_at_time_zone_expr)* {
    return createBinaryExprChain(head, tail);
  }

pg_at_time_zone_expr
  = head:pg_collate_expr tail:(__ pg_at_time_zone_op __ pg_collate_expr)* {
    return createBinaryExprChain(head, tail);
  }

pg_collate_expr
  = head:pg_negation_expr tail:(__ COLLATE __ ident)* {
    return createBinaryExprChain(head, tail);
  }

pg_at_time_zone_op
  = kws:(AT __ TIME __ ZONE) { return read(kws); }

pg_negation_expr
  = op:("-" / "+" / "~") right:(__ pg_negation_expr) {
    return loc(createPrefixOpExpr(op, read(right)));
  }
  / pg_cast_operator_expr

pg_cast_operator_expr
  = head:member_expr_or_func_call tail:(__ "::" __ data_type)* {
    return createCastOperatorExprChain(head, tail);
  }

bitwise_or_expr
  = head:bigquery_bitwise_xor_expr tail:(__ "|"  __ bigquery_bitwise_xor_expr)* {
    return createBinaryExprChain(head, tail);
  }

bigquery_bitwise_xor_expr
  = &bigquery head:bitwise_and_expr tail:(__ "^"  __ bitwise_and_expr)* {
    return createBinaryExprChain(head, tail);
  }
  / !bigquery x:bitwise_and_expr { return x; }

bitwise_and_expr
  = head:bit_shift_expr tail:(__ "&"  __ bit_shift_expr)* {
    return createBinaryExprChain(head, tail);
  }

bit_shift_expr
  = head:additive_expr tail:(__ (">>" / "<<")  __ additive_expr)* {
    return createBinaryExprChain(head, tail);
  }

additive_expr
  = head: multiplicative_expr
    tail:(__ additive_operator  __ multiplicative_expr)* {
      return createBinaryExprChain(head, tail);
    }

additive_operator
  = "+" / "-"

multiplicative_expr
  = head:mysql_bitwise_xor_expr tail:(__ multiplicative_operator  __ mysql_bitwise_xor_expr)* {
      return createBinaryExprChain(head, tail);
    }

multiplicative_operator
  = "*"
  / "/"
  / op:"%" (&mysql / &sqlite) { return op; }
  / op:DIV (&mysql / &sqlite) { return op; }
  / op:MOD (&mysql / &sqlite) { return op; }
  / op:"||" &bigquery { return op; }

mysql_bitwise_xor_expr
  = &mysql head:concat_or_json_expr tail:(__ "^"  __ concat_or_json_expr)* {
    return createBinaryExprChain(head, tail);
  }
  / !mysql x:concat_or_json_expr { return x; }

concat_or_json_expr
  = head:binary_expr tail:(__ concat_or_json_op  __ binary_expr)* {
      return createBinaryExprChain(head, tail);
    }

concat_or_json_op
  = op:"||" &sqlite { return op; }
  / op:"->>" (&sqlite / &only_mysql) { return op; }
  / op:"->" (&sqlite / &only_mysql) { return op; }

binary_expr
  = &mysql op:BINARY right:(__ binary_expr) {
    return loc(createPrefixOpExpr(op, read(right)));
  }
  / collate_expr

collate_expr
  = (&mysql / &sqlite) head:negation_expr tail:(__ COLLATE __ ident)* {
    return createBinaryExprChain(head, tail);
  }
  / !(&mysql / &sqlite) x:negation_expr { return x; }

negation_expr
  = op:negation_operator right:(__ negation_expr) {
    return loc(createPrefixOpExpr(op, read(right)));
  }
  / member_expr_or_func_call

negation_operator
  = "-"
  / "+"
  / op:"~" !postgres { return op; }
  / op:"!" &mysql { return op; }

member_expr_or_func_call
  = name:func_name_kw fnRight:(__ func_call_right) {
    return loc(createFuncCall(name, fnRight));
  }
  / paren_less_func_call
  / obj:primary props:(__ "." __ qualified_column / __ array_subscript / __ func_call_right)* {
    return createMemberExprChain(obj, props);
  }

// Plain member_expr node chain, without function calls and array subscripts
member_expr
  = obj:ident props:(__ "." __ qualified_column)* {
    return createMemberExprChain(obj, props);
  }

array_subscript
  = (&bigquery / &postgres) "[" expr:(__ (array_subscript_specifier / array_slice_specifier / expr) __) "]" {
    return loc({
      type: "array_subscript",
      expr: read(expr),
    });
  }

array_subscript_specifier
  = &bigquery kw:(OFFSET / SAFE_OFFSET / ORDINAL / SAFE_ORDINAL) args:(__ paren$expr) {
    return loc({
      type: "array_subscript_specifier",
      specifierKw: kw,
      args: read(args),
    });
  }

array_slice_specifier
  = &postgres left:(expr __)? ":" right:(__ expr)? {
    return loc({
      type: "array_slice_specifier",
      from: read(left),
      to: read(right),
    });
  }

primary
  = literal
  / primary_paren_expr
  / paren$compound_select_stmt
  / &bigquery x:(typed_array_expr / array_expr / typed_struct_expr) { return x; }
  / &postgres x:typed_array_expr { return x; }
  / cast_expr
  / &postgres x:(row_constructor / array_constructor) { return x; }
  / &sqlite e:raise_expr { return e; }
  / (&mysql / &bigquery / &postgres) e:extract_expr { return e; }
  / case_expr
  / exists_expr
  / ident
  / (&mysql / &bigquery) e:interval_expr { return e; }
  / &mysql e:variable { return e; }
  / &bigquery e:system_variable { return e; }
  / parameter

// Optimized parsing of parenthesized lists.
// - first try matching a list
// - when it's multi-element list, treat it as parenthesized list
//   (when parsing BigQuery, treat it as untyped struct)
// - when it's single-element list, treat it as parenthesized single expression
primary_paren_expr
  = "(" c1:__ list:list$expr c2:__ ")" {
    if (list.items.length > 1) {
      if (isBigquery()) {
        // Untyped struct expression must have at least 2 elements in it
        return loc({ type: "struct_expr", expr: surrounding(c1, list, c2) });
      } else {
        return loc({ type: "paren_expr", expr: surrounding(c1, list, c2) });
      }
    } else {
      return loc({ type: "paren_expr", expr: surrounding(c1, list.items[0], c2) });
    }
  }

cast_expr
  = kw:cast_kw args:(__ paren$cast_arg)  {
    return loc({
      type: "cast_expr",
      castKw: kw,
      args: read(args),
    });
  }

cast_kw
  = CAST
  / kw:SAFE_CAST &bigquery { return kw; }

cast_arg
  = e:(expr __) kw:AS t:(__ data_type) f:(__ cast_format)? {
    return loc({
      type: "cast_arg",
      expr: read(e),
      asKw: kw,
      dataType: read(t),
      format: read(f),
    });
  }

cast_format
  = &bigquery kw:(FORMAT __) e:expr tz:(__ cast_format_timezone)? {
    return loc({
      type: "cast_format",
      formatKw: read(kw),
      string: e,
      timezone: read(tz),
    });
  }

cast_format_timezone
  = kw:(AT __ TIME __ ZONE __) tz:string_literal {
    return loc({
      type: "cast_format_timezone",
      atTimeZoneKw: read(kw),
      timezone: tz,
    });
  }

raise_expr
  = kw:RAISE args:(__ paren$raise_args) {
    return loc({
      type: "raise_expr",
      raiseKw: kw,
      args: read(args),
    });
  }

raise_args
  = head:raise_expr_type tail:(__ "," __ string_literal)* {
    return loc(createListExpr(head, tail));
  }

raise_expr_type
  = kw:(IGNORE / ROLLBACK / ABORT / FAIL) {
    return loc({
      type: "raise_expr_type",
      typeKw: kw,
    });
  }

extract_expr
  = kw:(EXTRACT __) args:paren$extract_from {
    return loc({
      type: "extract_expr",
      extractKw: read(kw),
      args,
    });
  }

extract_from
  = unit:extract_unit fromKw:(__ FROM __) expr:expr {
    return loc({
      type: "extract_from",
      unit,
      fromKw: read(fromKw),
      expr,
    });
  }

extract_unit
  = &mysql x:interval_unit { return x; }
  / &bigquery x:extract_unit_bigquery { return x; }
  / &postgres x:extract_unit_postgresql { return x; }

extract_unit_bigquery
  = week_expr
  / kw:extract_unit_kw_bigquery {
    return loc({ type: "interval_unit", unitKw: kw });
  }

extract_unit_kw_bigquery
  = MICROSECOND
  / MILLISECOND
  / SECOND
  / MINUTE
  / HOUR
  / DAYOFWEEK
  / DAY
  / DAYOFYEAR
  / ISOWEEK
  / MONTH
  / QUARTER
  / YEAR
  / ISOYEAR
  / DATE
  / TIME
  / WEEK

extract_unit_postgresql
  = kw:extract_unit_kw_postgresql {
    return loc({ type: "interval_unit", unitKw: kw });
  }

extract_unit_kw_postgresql
  = CENTURY
  / DAY
  / DECADE
  / DOW
  / DOY
  / EPOCH
  / HOUR
  / ISODOW
  / ISOYEAR
  / JULIAN
  / MICROSECONDS
  / MILLENNIUM
  / MILLISECONDS
  / MINUTE
  / MONTH
  / QUARTER
  / SECOND
  / TIMEZONE
  / TIMEZONE_HOUR
  / TIMEZONE_MINUTE
  / WEEK
  / YEAR

week_expr
  = kw:(WEEK __) args:paren$weekday_unit {
    return loc({
      type: "week_expr",
      weekKw: read(kw),
      args,
    });
  }

weekday_unit
  = SUNDAY
  / MONDAY
  / TUESDAY
  / WEDNESDAY
  / THURSDAY
  / FRIDAY
  / SATURDAY

func_call
  = name:func_name fnRight:(__ func_call_right) {
    return loc(createFuncCall(name, fnRight));
  }
  / paren_less_func_call

func_call_right
  = args:paren$func_args filter:(__ filter_arg)? over:(__ over_arg)? {
    return {
      type: "func_call_right",
      args,
      filter: read(filter),
      over: read(over),
    };
  }

func_name
  = member_expr / ident / func_name_kw

func_name_kw
  = &mysql kw:mysql_func_keyword {
    return loc(createIdentifier(kw.text, kw.text));
  }
  / &bigquery kw:bigquery_func_keyword {
    return loc(createIdentifier(kw.text, kw.text));
  }
  / &postgres kw:postgres_func_keyword {
    return loc(createIdentifier(kw.text, kw.text));
  }
  / &sqlite kw:sqlite_func_keyword {
    return loc(createIdentifier(kw.text, kw.text));
  }

mysql_func_keyword
  = VALUES
  // In MySQL, window functions are reserved keywords
  / CUME_DIST
  / DENSE_RANK
  / FIRST_VALUE
  / LAG
  / LAST_VALUE
  / LEAD
  / NTH_VALUE
  / NTILE
  / PERCENT_RANK
  / RANK
  / ROW_NUMBER
  / IF
  / LEFT
  / RIGHT

bigquery_func_keyword
  = LEFT
  / RIGHT
  / ARRAY
  / COLLATE
  / IF
  / GROUPING

postgres_func_keyword
  = CURRENT_TIME
  / CURRENT_TIMESTAMP
  / LOCALTIME
  / LOCALTIMESTAMP
  / CURRENT_SCHEMA

sqlite_func_keyword
  = GLOB
  / LIKE
  / REPLACE

paren_less_func_call
  = name:paren_less_func_name !(__ "(") {
    return loc({
      type: "func_call",
      name,
    });
  }

paren_less_func_name
  = kw:(
      CURRENT_DATE
    / CURRENT_TIME
    / CURRENT_TIMESTAMP
    / paren_less_func_name_bigquery
    / paren_less_func_name_mysql
    / paren_less_func_name_postgresql
  ) {
    return loc(createIdentifier(kw.text, kw.text));
  }

paren_less_func_name_bigquery
  = kw:CURRENT_DATETIME &bigquery { return kw; }

paren_less_func_name_mysql
  = kw:(LOCALTIME / LOCALTIMESTAMP / CURRENT_USER) &mysql { return kw; }

paren_less_func_name_postgresql
  = kw:(
      LOCALTIME
    / LOCALTIMESTAMP
    / CURRENT_CATALOG
    / CURRENT_ROLE
    / CURRENT_SCHEMA
    / CURRENT_USER
    / USER
    / SESSION_USER
    / SYSTEM_USER
  ) &postgres { return kw; }

func_args
  = distinctKw:(DISTINCT __)? args:func_args_list
    nulls:(__ (IGNORE / RESPECT) __ NULLS)?
    orderBy:(__ order_by_clause)?
    limit:(__ limit_clause)?
    having:(__ having_arg)? {
    return loc({
      type: "func_args",
      distinctKw: read(distinctKw),
      args,
      nullHandlingKw: read(nulls),
      orderBy: read(orderBy),
      limit: read(limit),
      having: read(having),
    });
  }

func_args_list
  = head:func_1st_arg tail:(__ "," __ func_arg)* {
    return loc(createListExpr(head, tail));
  }
  / &. {
    // even when no parameters are present, we want to create an empty args object,
    // so we can attach optional comments to it,
    // allowing us to represent comments inside empty arguments list
    return loc({ type: "list_expr", items: [] });
  }

// For aggregate functions, first argument can be "*"
// The table_stmt is included because of BigQuery VECTOR_SEARCH() function
func_1st_arg
  = &bigquery x:table_stmt { return x; }
  / star
  / named_arg
  / expr
  / compound_select_stmt

func_arg
  = &bigquery x:table_stmt { return x; }
  / named_arg
  / expr

named_arg
  = name:(ident __) op:named_arg_op value:(__ expr) (&bigquery / &postgres) {
    return loc({
      type: "named_arg",
      name: read(name),
      operator: op,
      value: read(value),
    });
  }

named_arg_op
  = "=>"
  / op:":=" &postgres { return op; }

filter_arg
  = (&sqlite / &postgres) kw:(FILTER __) e:paren$where_clause {
    return loc({
      type: "filter_arg",
      filterKw: read(kw),
      where: e,
    });
  }

over_arg
  = kw:(OVER __) win:(paren$window_definition / ident) {
    return loc({
      type: "over_arg",
      overKw: read(kw),
      window: win,
    });
  }

having_arg
  = kw:(HAVING __) minmax:(MIN / MAX) expr:(__ expr) {
    return loc({
      type: "having_arg",
      havingKw: read(kw),
      minMaxKw: read(minmax),
      expr: read(expr),
    });
  }

case_expr
  = caseKw:CASE
    expr:(__ expr)?
    clauses:(__ case_when)+
    els:(__ case_else)?
    endKw:(__ END) {
      return loc({
        type: "case_expr",
        caseKw,
        expr: read(expr),
        clauses: [...clauses.map(read), ...(els ? [read(els)] : [])],
        endKw: read(endKw),
      });
    }

case_when
  = whenKw:WHEN condition:(__ expr __) thenKw:THEN result:(__ expr) {
    return loc({
      type: "case_when",
      whenKw,
      condition: read(condition),
      thenKw,
      result: read(result),
    });
  }

case_else
  = kw:ELSE result:(__ expr) {
    return loc({
      type: "case_else",
      elseKw: kw,
      result: read(result),
    });
  }

interval_expr
  = kw:INTERVAL e:(__ expr __) unit:(interval_unit_range / interval_unit) {
    return {
      type: "interval_expr",
      intervalKw: kw,
      expr: read(e),
      unit,
    };
  }

interval_unit_range
  = fromUnit:interval_unit toKw:(__ TO __) toUnit:interval_unit {
    return loc({
      type: "interval_unit_range",
      fromUnit,
      toKw: read(toKw),
      toUnit,
    });
  }

interval_unit
  = kw:interval_unit_kw {
    return loc({ type: "interval_unit", unitKw: kw })
  }

interval_unit_kw
  = YEAR
  / MONTH
  / DAY
  / HOUR
  / MINUTE
  / SECOND
  / x:interval_unit_kw_mysql &mysql { return x; }

interval_unit_kw_mysql
  = QUARTER
  / WEEK
  / MICROSECOND
  / SECOND_MICROSECOND
  / MINUTE_MICROSECOND
  / MINUTE_SECOND
  / HOUR_MICROSECOND
  / HOUR_SECOND
  / HOUR_MINUTE
  / DAY_MICROSECOND
  / DAY_SECOND
  / DAY_MINUTE
  / DAY_HOUR
  / YEAR_MONTH

exists_expr
  = kw:EXISTS expr:(__ paren$compound_select_stmt) {
    return loc(createPrefixOpExpr(kw, read(expr)));
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Bound parameters                                                                     *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
parameter
  = (
      "?" digits     &{ return hasParamType("?nr"); }
    / "?"            &{ return hasParamType("?"); }
    / ":" ident_name &{ return hasParamType(":name"); }
    / "$" digits     &{ return hasParamType("$nr"); }
    / "$" ident_name &{ return hasParamType("$name"); }
    / "@" ident_name &{ return hasParamType("@name"); }
    / "@" backticks_quoted_ident_bs &{ return hasParamType("@`name`"); }
  ) {
    return loc({ type: "parameter", text: text() });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Parenthesis and lists                                                                *
 *                                                                                      *
 * Code for these rules is generated by rule-templates.ts plugin                        *
 * To add new rule run:                                                                 *
 *                                                                                      *
 *   yarn add:template 'paren$some_name'                                                *
 * ------------------------------------------------------------------------------------ *
 */
paren$__template__
  = "(" c1:__ expr:__template__ c2:__ ")" {
    return loc(createParenExpr(c1, expr, c2));
  }

/*! paren:start */
paren$cast_arg = .
paren$compound_select_stmt = .
paren$cte_expr = .
paren$empty_list = .
paren$entity_name = .
paren$expr = .
paren$extract_from = .
paren$full_text_match_args = .
paren$func_args = .
paren$join_expr = .
paren$list$alias$column = .
paren$list$alias$expr = .
paren$list$alias$paren$list$column = .
paren$list$column = .
paren$list$column_definition = .
paren$list$create_definition = .
paren$list$entity_name = .
paren$list$equals_expr = .
paren$list$exclusion_param = .
paren$list$expr = .
paren$list$expr_or_default = .
paren$list$func_param = .
paren$list$grouping_element = .
paren$list$ident = .
paren$list$index_specification = .
paren$list$literal = .
paren$list$member_expr = .
paren$list$partition_bound_from_to_value = .
paren$list$partition_bound_with_value = .
paren$list$postgresql_option_element = .
paren$list$procedure_param = .
paren$list$reindex_option = .
paren$list$sort_specification = .
paren$list$string_literal = .
paren$list$table_func_call = .
paren$list$table_option_postgresql = .
paren$list$tablesample_arg = .
paren$list$variable = .
paren$list$view_column_definition = .
paren$pivot_for_in = .
paren$postgresql_op = .
paren$pragma_value = .
paren$raise_args = .
paren$sequence_option_list = .
paren$string_literal = .
paren$unpivot_for_in = .
paren$verbose_all_columns = .
paren$weekday_unit = .
paren$where_clause = .
paren$window_definition = .
/*! paren:end */

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Lists                                                                                *
 *                                                                                      *
 * Code for these rules is generated by rule-templates.ts plugin                        *
 * To add new rule run:                                                                 *
 *                                                                                      *
 *   yarn add:template 'list$some_name'                                                 *
 * ------------------------------------------------------------------------------------ *
 */
list$__template__
  = head:__template__ tail:(__ "," __ __template__)* {
    return loc(createListExpr(head, tail));
  }

/*! list:start */
list$alias$column = .
list$alias$expr = .
list$alias$func_call = .
list$alias$paren$list$column = .
list$alias$relation_expr = .
list$alter_action = .
list$alter_view_action = .
list$alter_type_action = .
list$column = .
list$column_assignment = .
list$column_definition = .
list$common_table_expr = .
list$config_parameter_value = .
list$create_definition = .
list$delete_clause_table = .
list$entity_name = .
list$equals_expr = .
list$exclusion_param = .
list$expr = .
list$expr_or_default = .
list$expr_or_explicit_alias = .
list$func_param = .
list$grouping_element = .
list$ident = .
list$index_specification = .
list$literal = .
list$member_expr = .
list$named_window = .
list$number_literal = .
list$partition_bound_from_to_value = .
list$partition_bound_with_value = .
list$postgresql_option_element = .
list$procedure_param = .
list$reindex_option = .
list$relation_expr = .
list$rename_action = .
list$role_specification = .
list$set_assignment = .
list$sort_specification = .
list$string_literal = .
list$table_func_call = .
list$table_option_postgresql = .
list$tablesample_arg = .
list$transform_type = .
list$trigger_transition = .
list$type_param = .
list$values_row = .
list$variable = .
list$view_column_definition = .
/*! list:end */

empty_list
  = &. {
    return loc({ type: "list_expr", items: [] });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Aliases                                                                              *
 *                                                                                      *
 * Code for these rules is generated by rule-templates.ts plugin                        *
 * To add new rule run:                                                                 *
 *                                                                                      *
 *   yarn add:template 'alias$some_name'                                                *
 * ------------------------------------------------------------------------------------ *
 */
alias$__template__
  = expr:__template__ alias:(__ alias)? {
    return loc(createAlias(expr, alias));
  }

/*! alias:start */
alias$column = .
alias$entity_name = .
alias$expr = .
alias$func_call = .
alias$paren$compound_select_stmt = .
alias$paren$list$column = .
alias$relation_expr = .
alias$table_factor = .
alias$unnest_or_member_expr = .
/*! alias:end */

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * AS clauses                                                                           *
 *                                                                                      *
 * Code for these rules is generated by rule-templates.ts plugin                        *
 * To add new rule run:                                                                 *
 *                                                                                      *
 *   yarn add:template 'as_clause$some_name'                                            *
 * ------------------------------------------------------------------------------------ *
 */
as_clause$__template__
  = kw:(AS __) expr:__template__ {
    return loc({
      type: "as_clause",
      asKw: read(kw),
      expr,
    });
  }

/*! as_clause:start */
as_clause$compound_select_stmt = .
as_clause$func_as_expr_bigquery = .
as_clause$func_as_expr_postgresql = .
as_clause$string_literal = .
as_clause$expr = .
/*! as_clause:end */

// Utility placeholder rule used by the rule-templates system
__template__ = .

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Table names                                                                          *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
entity_name
  = member_expr

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Column names                                                                         *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
optionally_qualified_column
  = tbl:(ident __) "." col:(__ qualified_column) {
    return loc({
      type: "member_expr",
      object: read(tbl),
      property: read(col),
    });
  }
  / column

// Keywords can be used as column names when they are prefixed by table name, like tbl.update
qualified_column
  = name:ident_name {
    return loc(createIdentifier(name, name));
  }
  / quoted_ident

column
  = ident

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Identifiers                                                                          *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
implicit_alias_ident
  = ident
  / s:string_literal_plain (&sqlite / &bigquery / &mysql) {
    return loc(createIdentifier(s.text, s.value));
  }

explicit_alias_ident
  = implicit_alias_ident
  / name:ident_name &postgres {
    return loc(createIdentifier(name, name));
  }

ident "identifier"
  = quoted_ident
  / name:ident_name !{ return isReservedKeyword(name); } {
    return loc(createIdentifier(name, name));
  }

quoted_ident
  = &sqlite ident:bracket_quoted_ident { return ident; }
  / (&sqlite / &mysql) ident:backticks_quoted_ident_qq { return ident; }
  / &bigquery ident:(bigquery_quoted_member_expr / backticks_quoted_ident_bs) { return ident; }
  / (&sqlite / &postgres) str:string_literal_double_quoted_qq { return loc(createIdentifier(str.text, str.value)); }
  / &postgres ident:postgres_unicode_ident { return ident; }

postgres_unicode_ident
  = head:ident_unicode_double_quoted_qq tail:(__ UESCAPE __ string_literal_single_quoted_qq)|0..1| {
    return createBinaryExprChain(head, tail);
  }

ident_unicode_double_quoted_qq
  = str:string_literal_unicode_double_quoted_qq { return loc(createIdentifier(str.text, str.value)); }

backticks_quoted_ident_qq
  = "`" chars:([^`] / escaped_backtick_qq)+ "`" { return loc(createIdentifier(text(), chars.join(""))); }

escaped_backtick_qq
  = "``" { return "`"; }

backticks_quoted_ident_bs
  = "`" chars:([^`\\] / backslash_escape)+ "`" { return loc(createIdentifier(text(), chars.join(""))); }

bigquery_quoted_member_expr
  = "`" e:quoted_member_expr "`" { return loc({ type: "bigquery_quoted_member_expr", expr: e }); }

quoted_member_expr
  = head:quoted_member_expr_ident tail:(no_whitespace "." no_whitespace (quoted_member_expr_ident / empty))+ {
    return createMemberExprChain(head, tail);
  }

quoted_member_expr_ident
  = [^.`]+ {
    return loc(createIdentifier(text(), text()));
  }

// utility to empty result of __ rule
no_whitespace
  = &{ return true } {
    return [];
  }

bracket_quoted_ident
  = "[" chars:([^\]] / escaped_bracket)+ "]" { return loc(createIdentifier(text(), chars.join(""))); }

escaped_bracket
  = "]]" { return "]"; }

ident_name
  = &bigquery ident_name_bigquery { return text(); }
  / &postgres ident_name_basic { return text(); }
  / (&mysql / &sqlite) digits? ident_name_basic { return text(); }

ident_name_bigquery
  = ident_name_basic ("-" (ident_name_basic / digits))*

ident_name_basic
  = ident_start ident_part*

ident_start
  = ascii_letter
  / &postgres unicode_letter
  / &sqlite unicode_letter
  / &mysql (unicode_letter / "$")

ident_part
  = ascii_letter
  / digit
  / (&postgres / &mysql) (unicode_letter / "$")

ascii_letter   = [A-Za-z_]

unicode_letter = [A-Za-z_\u0080-\uFFFF]

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Variables                                                                            *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
variable
  = "@" name:ident_name {
    return loc({
      type: "variable",
      name: name,
      text: text(),
    });
  }
  / "@" ident:backticks_quoted_ident_qq {
    return loc({
      type: "variable",
      name: ident.name,
      text: text(),
    });
  }
  / "@" str:mysql_string_literal_plain {
    return loc({
      type: "variable",
      name: str.value,
      text: text(),
    });
  }

system_variable
  = "@@" name:ident_name {
    return loc({
      type: "variable",
      name: name,
      text: text(),
    });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Arrays and structs                                                                   *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
typed_array_expr
  = type:(bigquery_array_type __) expr:array_expr {
    return loc({
      type: "typed_expr",
      dataType: read(type),
      expr,
    });
  }

array_expr
  = "[" items:(__ (list$expr / empty_list) __) "]" {
    return loc({
      type: "array_expr",
      expr: read(items),
    });
  }

typed_struct_expr
  = type:(bigquery_struct_type __) expr:struct_expr {
    return loc({
      type: "typed_expr",
      dataType: read(type),
      expr,
    });
  }

struct_expr
  = "(" expr:(__ list$expr_or_explicit_alias __) ")" {
    return loc({
      type: "struct_expr",
      expr: read(expr),
    });
  }

expr_or_explicit_alias
  = e:expr alias:(__ explicit_alias)? {
    return loc(createAlias(e, alias));
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Literals                                                                             *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
literal
  = string_literal
  / number_literal
  / blob_literal
  / boolean_literal
  / null_literal
  / datetime_literal
  / json_literal
  / jsonb_literal
  / numeric_literal
  / bignumeric_literal
  / interval_literal

null_literal
  = kw:NULL {
    return loc({ type: "null_literal", nullKw: kw, value: null });
  }

boolean_literal
  = kw:TRUE {
    return loc({ type: "boolean_literal", valueKw: kw, value: true });
  }
  / kw:FALSE {
    return loc({ type: "boolean_literal", valueKw: kw, value: false });
  }

string_literal "string"
  = &mysql s:string_literal_mysql { return s; }
  / (&sqlite / &bigquery / &postgres) s:string_literal_plain { return s; }

string_literal_mysql
  = string_literal_with_charset
  / string_literal_plain
  / mysql_string_literal_natural_charset

string_literal_with_charset // for MySQL only
  = charset:charset_introducer string:(__ string_literal_without_charset) {
    return loc({
      type: "string_with_charset",
      charset,
      string: read(string),
    });
  }

string_literal_without_charset // for MySQL only
  = blob_literal
  / string_literal_plain

// The most ordinary string type, without any prefixes
string_literal_plain
  = &bigquery s:(
      string_literal_triple_single_quoted
    / string_literal_triple_double_quoted
    / string_literal_single_quoted_bs
    / string_literal_double_quoted_bs
    / string_literal_raw) { return s; }
  / &sqlite s:string_literal_single_quoted_qq { return s; }
  / &mysql s:mysql_string_literal_chain { return s; }
  / &postgres s:(
      postgres_single_quoted_string_chain
    / string_literal_dollar_quoted
    / postgres_e_single_quoted_string_chain
    / postgres_unicode_string) { return s; }

mysql_string_literal_chain
  = head:mysql_string_literal_plain tail:(__ mysql_string_literal_plain)* {
    return createStringConcatExprChain(head, tail);
  }

mysql_string_literal_natural_charset
  = head:string_literal_natural_charset tail:(__ mysql_string_literal_plain)* {
    return createStringConcatExprChain(head, tail);
  }

mysql_string_literal_plain
  = string_literal_single_quoted_qq_bs
  / string_literal_double_quoted_qq_bs

charset_introducer
  = "_" cs:charset_name !ident_part { return cs; }

charset_name
  = ident_name_basic { return text(); }

postgres_single_quoted_string_chain
  = head:string_literal_single_quoted_qq tail:(__hspace__ "\n" __ string_literal_single_quoted_qq)* {
    return createBinaryExprChain(head, tail);
  }

postgres_e_single_quoted_string_chain
  = head:string_literal_e_single_quoted_bs tail:(__hspace__ "\n" __ string_literal_single_quoted_qq_bs)* {
    return createBinaryExprChain(head, tail);
  }

postgres_unicode_string
  = head:postgres_unicode_string_chain tail:(__ UESCAPE __ string_literal_single_quoted_qq)|0..1| {
    return createBinaryExprChain(head, tail);
  }

postgres_unicode_string_chain
  = head:string_literal_unicode_single_quoted_qq tail:(__hspace__ "\n" __ string_literal_single_quoted_qq)* {
    return createBinaryExprChain(head, tail);
  }

string_literal_single_quoted_qq_bs // with repeated quote or backslash for escaping
  = "'" chars:([^'\\] / escaped_single_quote_qq / backslash_escape)* "'" {
    return loc({
      type: "string_literal",
      text: text(),
      value: chars.join(""),
    });
  }

// Postgres string with C-style escapes
string_literal_e_single_quoted_bs
  = "E" str:string_literal_single_quoted_qq_bs {
    return loc({
      type: "string_literal",
      text: text(),
      value: str.value
    });
  }

string_literal_unicode_single_quoted_qq
  = "U&" str:string_literal_single_quoted_qq {
    return loc({
      type: "string_literal",
      text: text(),
      value: str.value,
    });
  }

string_literal_unicode_double_quoted_qq
  = "U&" str:string_literal_double_quoted_qq {
    return loc({
      type: "string_literal",
      text: text(),
      value: str.value,
    });
  }

string_literal_single_quoted_bs // with backslash for escaping
  = "'" chars:([^'\\] / backslash_escape)* "'" {
    return loc({
      type: "string_literal",
      text: text(),
      value: chars.join(""),
    });
  }

string_literal_single_quoted_qq // with repeated quote for escaping
  = "'" chars:([^'] / escaped_single_quote_qq)* "'" {
    return loc({
      type: "string_literal",
      text: text(),
      value: chars.join(""),
    });
  }

escaped_single_quote_qq
  = "''" { return "'"; }

string_literal_double_quoted_qq // with repeated quote for escaping
  = "\"" chars:([^"] / escaped_double_quote_qq)* "\"" {
    return loc({
      type: "string_literal",
      text: text(),
      value: chars.join(""),
    });
  }

escaped_double_quote_qq
  = '""' { return '"'; }

string_literal_double_quoted_qq_bs // with repeated quote or backslash for escaping
  = "\"" chars:([^"\\] / escaped_double_quote_qq / backslash_escape)* "\"" {
    return loc({
      type: "string_literal",
      text: text(),
      value: chars.join(""),
    });
  }

string_literal_double_quoted_bs // with backslash for escaping
  = "\"" chars:([^"\\] / backslash_escape)* "\"" {
    return loc({
      type: "string_literal",
      text: text(),
      value: chars.join(""),
    });
  }

string_literal_triple_single_quoted
  = "'''" chars:([^'\\] / single_quote_in_3quote / backslash_escape)* "'''" {
    return loc({
      type: "string_literal",
      text: text(),
      value: chars.join(""),
    });
  }

single_quote_in_3quote
  = s:("''" / "'") !"'" { return s; }

string_literal_triple_double_quoted
  = '"""' chars:([^"\\] / double_quote_in_3quote / backslash_escape)* '"""' {
    return loc({
      type: "string_literal",
      text: text(),
      value: chars.join(""),
    });
  }

double_quote_in_3quote
  = s:('""' / '"') !'"' { return s; }

backslash_escape
  = "\\n" { return "\n"; }
  / "\\r" { return "\r"; }
  / "\\t" { return "\t"; }
  / "\\b" { return "\b"; }
  / "\\f" (&bigquery / &postgres) { return "\f"; }
  / "\\v" &bigquery { return "\v"; }
  / "\\a" &bigquery { return "\x07"; /* BELL, ASCII code 7 */ }
  / "\\" oct:$([0-7][0-7][0-7] / [0-7][0-7] / [0-7]) &postgres {
    // 1..3-digit octal escape
    return String.fromCodePoint(parseInt(oct, 8));
  }
  / "\\" oct:$([0-7] [0-7] [0-7]) &bigquery {
    // 3-digit octal escape
    return String.fromCodePoint(parseInt(oct, 8));
  }
  / "\\" "x" hex:$(hex_digit hex_digit / hex_digit) &postgres {
    // 1..2-digit hex escape
    return String.fromCodePoint(parseInt(hex, 16));
  }
  / "\\" "x"i hex:$(hex_digit hex_digit) &bigquery {
    // 2-digit hex escape
    return String.fromCodePoint(parseInt(hex, 16));
  }
  / "\\" "u" hex:$(hex_digit hex_digit hex_digit hex_digit) (&bigquery / &postgres) {
    // 4-digit unicode escape
    return String.fromCodePoint(parseInt(hex, 16));
  }
  / "\\" "U" hex:$(hex_digit hex_digit hex_digit hex_digit hex_digit hex_digit hex_digit hex_digit) (&bigquery / &postgres) {
    // 8-digit unicode escape
    return String.fromCodePoint(parseInt(hex, 16));
  }
  / "\\%" &mysql { return "\\%"; }
  / "\\_" &mysql { return "\\_"; }
  / "\\0" &mysql { return "\0"; }
  / "\\Z" &mysql { return "\x1A"; /* Ctrl+Z (ASCII code 26 dec, 1A hex) */ }
  / "\\" c:. { return c; }

string_literal_natural_charset
  = "N"i str:string_literal_single_quoted_qq_bs {
    return loc({
      type: "string_literal",
      text: text(),
      value: str.value,
    });
  }

string_literal_raw
  = "R"i cs:string_literal_raw_chars {
    return loc({
      type: "string_literal",
      text: text(),
      value: cs,
    });
  }

blob_literal_raw_byte
  = ("RB"i / "BR"i) cs:string_literal_raw_chars {
    return loc({
      type: "blob_literal",
      text: text(),
      value: parseTextBlob(cs),
    });
  }

string_literal_raw_chars
  = "'''" cs:$([^'] / single_quote_in_3quote)* "'''" { return cs; }
  / '"""' cs:$([^"] / double_quote_in_3quote)* '"""' { return cs; }
  / "'" cs:$[^']* "'" { return cs; }
  / '"' cs:$[^"]* '"' { return cs; }

string_literal_dollar_quoted
  = "$$" value:$(!"$$" .)* "$$" {
    return loc({
      type: "string_literal",
      text: text(),
      value: value,
    });
  }
  / "$" x:tag "$"
    value:$(!("$" y:tag "$" &{ return x === y; }) .)*
    "$" z:tag "$" &{ return x === z; } {
      return loc({
        type: "string_literal",
        text: text(),
        value: value,
      });
    }

// Like PostgreSQL identifier, but cannot contain $-chars
tag = unicode_letter (unicode_letter / digit)* { return text(); }

blob_literal_byte
  = "B"i str:(
      string_literal_triple_double_quoted
    / string_literal_triple_single_quoted
    / string_literal_double_quoted_bs
    / string_literal_single_quoted_bs) {
      return loc({
        type: "blob_literal",
        text: text(),
        value: parseTextBlob(str.value),
      });
    }

datetime_literal
  = kw:DATETIME str:(__ string_literal_plain) (&mysql / &sqlite / &bigquery) {
      return loc({
        type: "datetime_literal",
        datetimeKw: kw,
        string: read(str)
      });
    }
  / kw:TIMESTAMP str:(__ string_literal_plain) {
      return loc({
        type: "timestamp_literal",
        timestampKw: kw,
        string: read(str)
      });
    }
  / kw:DATE str:(__ string_literal_plain) {
      return loc({
        type: "date_literal",
        dateKw: kw,
        string: read(str)
      });
    }
  / kw:TIME str:(__ string_literal_plain) {
      return loc({
        type: "time_literal",
        timeKw: kw,
        string: read(str)
      });
    }

json_literal
  = (&bigquery / &postgres) kw:JSON str:(__ string_literal_plain) {
    return loc({
      type: "json_literal",
      jsonKw: kw,
      string: read(str),
    });
  }

jsonb_literal
  = &postgres kw:JSONB str:(__ string_literal_plain) {
    return loc({
      type: "jsonb_literal",
      jsonbKw: kw,
      string: read(str),
    });
  }

numeric_literal
  = &bigquery kw:NUMERIC str:(__ string_literal_plain) {
    return loc({
      type: "numeric_literal",
      numericKw: kw,
      string: read(str),
    });
  }

bignumeric_literal
  = &bigquery kw:BIGNUMERIC str:(__ string_literal_plain) {
    return loc({
      type: "bignumeric_literal",
      bignumericKw: kw,
      string: read(str),
    });
  }

interval_literal
  = &postgres kw:INTERVAL str:(__ string_literal_plain) {
    return loc({
      type: "interval_literal",
      intervalKw: kw,
      string: read(str),
    });
  }

blob_literal
  = blob_literal_hex_string
  / (&mysql / &postgres) n:blob_literal_bit_string { return n; }
  / &mysql n:blob_literal_hex { return n; }
  / &mysql n:blob_literal_bit { return n; }
  / &bigquery n:blob_literal_raw_byte { return n; }
  / &bigquery n:blob_literal_byte { return n; }

blob_literal_hex_string
  = "X"i "'" chars:$hex_digit* "'" {
    return loc({
      type: "blob_literal",
      text: text(),
      value: parseHexBlob(chars),
    });
  }

blob_literal_bit_string
  = "b"i "'" chars:$[01]* "'" {
    return loc({
      type: "blob_literal",
      text: text(),
      value: parseBitBlob(chars),
    });
  }

// number_literal rule is without a sign,
// this rule allows for signed numbers
signed_number_literal
  = op:("-" / "+") right:(__ number_literal) {
    return loc(createPrefixOpExpr(op, read(right)));
  }
  / number_literal

number_literal "number"
  = number_literal_decimal
  / n:number_literal_hex (&sqlite / &bigquery / &postgres) { return n; }
  / n:number_literal_bit &postgres { return n; }
  / n:number_literal_oct &postgres { return n; }

number_literal_hex
  = &postgres "0x" pg_hex_digits {
    return loc({
      type: "number_literal",
      text: text(),
      value: parseInt(text().replace(/_/g, ""), 16),
    });
  }
  / !postgres "0x" hex_digit+ {
    return loc({
      type: "number_literal",
      text: text(),
      value: parseInt(text(), 16),
    });
  }

// The exact same syntax as above, but treated as blob
blob_literal_hex
  = "0x" chars:$hex_digit+ {
    return loc({
      type: "blob_literal",
      text: text(),
      value: parseHexBlob(chars),
    });
  }

number_literal_bit
  = "0b" chars:$pg_bit_digits {
    return loc({
      type: "number_literal",
      text: text(),
      value: parseInt(chars.replace(/_/g, ""), 2),
    });
  }

// The exact same syntax as above, but treated as blob
blob_literal_bit
  = "0b" chars:$[01]+ {
    return loc({
      type: "blob_literal",
      text: text(),
      value: parseBitBlob(chars),
    });
  }

number_literal_oct
  = "0o" chars:$pg_oct_digits {
    return loc({
      type: "number_literal",
      text: text(),
      value: parseInt(chars.replace(/_/g, ""), 8),
    });
  }

number_literal_decimal
  = &postgres (pg_digits pg_frac? / pg_frac) pg_exp? !ident_start {
    return loc({
      type: "number_literal",
      text: text(),
      value: parseFloat(text().replace(/_/g, "")),
    });
  }
  / !postgres (digits frac? / frac) exp? !ident_start {
    return loc({
      type: "number_literal",
      text: text(),
      value: parseFloat(text()),
    });
  }

// PostgreSQL allows for underscores in numbers
pg_exp = exp ("_" digits)*
pg_frac = "." pg_digits
pg_digits = digits ("_" digits)*

pg_hex_digits = hex_digit+ ("_" hex_digit+)*
pg_oct_digits = [0-7]+ ("_" [0-7]+)*
pg_bit_digits = [01]+ ("_" [01]+)*

frac
  = "." digits

exp
  = [eE] [+-]? digits

digits
  = digit+ { return text(); }

digit
  = [0-9]

hex_digit
  = [0-9a-fA-F]


// Optional whitespace (or comments)
__ "whitespace"
  = xs:(space / newline / comment)* {
    return xs.filter(isEnabledWhitespace);
  }

// Optional horizontal whitespace, can also include line-comment (but no block comments or newlines)
__hspace__
  = xs:(space / line_comment)* {
    return xs.filter(isEnabledWhitespace);
  }

// Comments
comment
  = line_comment
  / !postgres x:pound_sign_comment { return x; }
  / !postgres x:block_comment { return x; }
  / &postgres x:nested_block_comment { return x; }

block_comment
  = "/*" (!"*/" .)* "*/" {
    return loc({
      type: "block_comment",
      text: text(),
    });
  }

nested_block_comment
  = "/*" (nested_block_comment / !"*/" .)* "*/" {
    return loc({
      type: "block_comment",
      text: text(),
    });
  }

line_comment
  = "--" (!end_of_line .)* {
    return loc({
      type: "line_comment",
      text: text(),
    });
  }

pound_sign_comment
  = "#" (!end_of_line .)* {
    return loc({
      type: "line_comment",
      text: text(),
    });
  }

// Whitespace
space
  = [ \t]+ { return { type: "space", text: text() }; }

newline
  = ("\r\n" / "\n") { return { type: "newline", text: text() }; }

end_of_line
  = end_of_file / [\n\r]

end_of_file
  = !.

// Special rule that never matches
// (though still attempts to consume some input, so Peggy won't give us a warning)
never
  = . &{ return false };

// SQL Dialect assertion rules
bigquery = &{ return isBigquery(); }
sqlite = &{ return isSqlite(); }
mysql = &{ return isMysql() || isMariadb(); } // 99% of MariaDB and MySQL syntax is the same
only_mysql = &{ return isMysql(); } // 99% of MariaDB and MySQL syntax is the same
only_mariadb = &{ return isMariadb(); } // 99% of MariaDB and MySQL syntax is the same
postgres = &{ return isPostgresql(); }

unsupported_grammar_stmt = [^;]+ {
  return loc({
    type: "unsupported_grammar_stmt",
    text: text(),
  });
}

/**
 * Generic keyword rules
 */
keyword
  = name:ident_name {
    return loc(createKeyword(name));
  }

unreserved_keyword
  = name:ident_name !{ return isReservedKeyword(name); } {
    return loc(createKeyword(name));
  }

/**
 * Note: To add keyword rules to the list below use the command:
 *
 *   yarn add:keyword KEYWORD1 KEYWORD2
 */

/*! keywords:start */
ABORT               = kw:"ABORT"i               !ident_part { return loc(createKeyword(kw)); }
ACCESS              = kw:"ACCESS"i              !ident_part { return loc(createKeyword(kw)); }
ACTION              = kw:"ACTION"i              !ident_part { return loc(createKeyword(kw)); }
ADD                 = kw:"ADD"i                 !ident_part { return loc(createKeyword(kw)); }
ADMIN               = kw:"ADMIN"i               !ident_part { return loc(createKeyword(kw)); }
AFTER               = kw:"AFTER"i               !ident_part { return loc(createKeyword(kw)); }
AGAINST             = kw:"AGAINST"              !ident_part { return loc(createKeyword(kw)); }
ALGORITHM           = kw:"ALGORITHM"i           !ident_part { return loc(createKeyword(kw)); }
ALL                 = kw:"ALL"i                 !ident_part { return loc(createKeyword(kw)); }
ALTER               = kw:"ALTER"i               !ident_part { return loc(createKeyword(kw)); }
ALWAYS              = kw:"ALWAYS"i              !ident_part { return loc(createKeyword(kw)); }
ANALYZE             = kw:"ANALYZE"i             !ident_part { return loc(createKeyword(kw)); }
AND                 = kw:"AND"i                 !ident_part { return loc(createKeyword(kw)); }
ANY                 = kw:"ANY"i                 !ident_part { return loc(createKeyword(kw)); }
ARRAY               = kw:"ARRAY"i               !ident_part { return loc(createKeyword(kw)); }
AS                  = kw:"AS"i                  !ident_part { return loc(createKeyword(kw)); }
ASC                 = kw:"ASC"i                 !ident_part { return loc(createKeyword(kw)); }
ASSERT              = kw:"ASSERT"i              !ident_part { return loc(createKeyword(kw)); }
ASSIGNMENT          = kw:"ASSIGNMENT"i          !ident_part { return loc(createKeyword(kw)); }
AT                  = kw:"AT"i                  !ident_part { return loc(createKeyword(kw)); }
ATOMIC              = kw:"ATOMIC"i              !ident_part { return loc(createKeyword(kw)); }
ATTACH              = kw:"ATTACH"i              !ident_part { return loc(createKeyword(kw)); }
ATTRIBUTE           = kw:"ATTRIBUTE"i           !ident_part { return loc(createKeyword(kw)); }
AUTHORIZATION       = kw:"AUTHORIZATION"i       !ident_part { return loc(createKeyword(kw)); }
AUTO                = kw:"AUTO"i                !ident_part { return loc(createKeyword(kw)); }
AUTO_INCREMENT      = kw:"AUTO_INCREMENT"i      !ident_part { return loc(createKeyword(kw)); }
AUTOEXTEND_SIZE     = kw:"AUTOEXTEND_SIZE"i     !ident_part { return loc(createKeyword(kw)); }
AUTOINCREMENT       = kw:"AUTOINCREMENT"i       !ident_part { return loc(createKeyword(kw)); }
AVG                 = kw:"AVG"i                 !ident_part { return loc(createKeyword(kw)); }
AVG_ROW_LENGTH      = kw:"AVG_ROW_LENGTH"i      !ident_part { return loc(createKeyword(kw)); }
BEFORE              = kw:"BEFORE"i              !ident_part { return loc(createKeyword(kw)); }
BEGIN               = kw:"BEGIN"i               !ident_part { return loc(createKeyword(kw)); }
BERNOULLI           = kw:"BERNOULLI"i           !ident_part { return loc(createKeyword(kw)); }
BETWEEN             = kw:"BETWEEN"i             !ident_part { return loc(createKeyword(kw)); }
BI_CAPACITY         = kw:"BI_CAPACITY"i         !ident_part { return loc(createKeyword(kw)); }
BIGDECIMAL          = kw:"BIGDECIMAL"i          !ident_part { return loc(createKeyword(kw)); }
BIGINT              = kw:"BIGINT"i              !ident_part { return loc(createKeyword(kw)); }
BIGNUMERIC          = kw:"BIGNUMERIC"i          !ident_part { return loc(createKeyword(kw)); }
BINARY              = kw:"BINARY"i              !ident_part { return loc(createKeyword(kw)); }
BINLOG              = kw:"BINLOG"i              !ident_part { return loc(createKeyword(kw)); }
BIT                 = kw:"BIT"i                 !ident_part { return loc(createKeyword(kw)); }
BLOB                = kw:"BLOB"i                !ident_part { return loc(createKeyword(kw)); }
BOOL                = kw:"BOOL"i                !ident_part { return loc(createKeyword(kw)); }
BOOLEAN             = kw:"BOOLEAN"i             !ident_part { return loc(createKeyword(kw)); }
BREADTH             = kw:"BREADTH"i             !ident_part { return loc(createKeyword(kw)); }
BREAK               = kw:"BREAK"i               !ident_part { return loc(createKeyword(kw)); }
BTREE               = kw:"BTREE"i               !ident_part { return loc(createKeyword(kw)); }
BY                  = kw:"BY"i                  !ident_part { return loc(createKeyword(kw)); }
BYPASSRLS           = kw:"BYPASSRLS"i           !ident_part { return loc(createKeyword(kw)); }
BYTEINT             = kw:"BYTEINT"i             !ident_part { return loc(createKeyword(kw)); }
BYTES               = kw:"BYTES"i               !ident_part { return loc(createKeyword(kw)); }
CACHE               = kw:"CACHE"i               !ident_part { return loc(createKeyword(kw)); }
CALL                = kw:"CALL"i                !ident_part { return loc(createKeyword(kw)); }
CALLED              = kw:"CALLED"i              !ident_part { return loc(createKeyword(kw)); }
CAPACITY            = kw:"CAPACITY"i            !ident_part { return loc(createKeyword(kw)); }
CASCADE             = kw:"CASCADE"i             !ident_part { return loc(createKeyword(kw)); }
CASCADED            = kw:"CASCADED"i            !ident_part { return loc(createKeyword(kw)); }
CASE                = kw:"CASE"i                !ident_part { return loc(createKeyword(kw)); }
CAST                = kw:"CAST"i                !ident_part { return loc(createKeyword(kw)); }
CENTURY             = kw:"CENTURY"i             !ident_part { return loc(createKeyword(kw)); }
CHANGE              = kw:"CHANGE"i              !ident_part { return loc(createKeyword(kw)); }
CHAR                = kw:"CHAR"i                !ident_part { return loc(createKeyword(kw)); }
CHARACTER           = kw:"CHARACTER"i           !ident_part { return loc(createKeyword(kw)); }
CHARSET             = kw:"CHARSET"i             !ident_part { return loc(createKeyword(kw)); }
CHECK               = kw:"CHECK"i               !ident_part { return loc(createKeyword(kw)); }
CHECKSUM            = kw:"CHECKSUM"i            !ident_part { return loc(createKeyword(kw)); }
CLONE               = kw:"CLONE"i               !ident_part { return loc(createKeyword(kw)); }
CLUSTER             = kw:"CLUSTER"i             !ident_part { return loc(createKeyword(kw)); }
COLLATE             = kw:"COLLATE"i             !ident_part { return loc(createKeyword(kw)); }
COLLATION           = kw:"COLLATION"i           !ident_part { return loc(createKeyword(kw)); }
COLUMN              = kw:"COLUMN"i              !ident_part { return loc(createKeyword(kw)); }
COLUMN_FORMAT       = kw:"COLUMN_FORMAT"i       !ident_part { return loc(createKeyword(kw)); }
COLUMNS             = kw:"COLUMNS"i             !ident_part { return loc(createKeyword(kw)); }
COMMENT             = kw:"COMMENT"i             !ident_part { return loc(createKeyword(kw)); }
COMMENTS            = kw:"COMMENTS"i            !ident_part { return loc(createKeyword(kw)); }
COMMIT              = kw:"COMMIT"i              !ident_part { return loc(createKeyword(kw)); }
COMPACT             = kw:"COMPACT"i             !ident_part { return loc(createKeyword(kw)); }
COMPRESSED          = kw:"COMPRESSED"i          !ident_part { return loc(createKeyword(kw)); }
COMPRESSION         = kw:"COMPRESSION"i         !ident_part { return loc(createKeyword(kw)); }
CONCURRENTLY        = kw:"CONCURRENTLY"i        !ident_part { return loc(createKeyword(kw)); }
CONFLICT            = kw:"CONFLICT"i            !ident_part { return loc(createKeyword(kw)); }
CONNECTION          = kw:"CONNECTION"i          !ident_part { return loc(createKeyword(kw)); }
CONSTRAINT          = kw:"CONSTRAINT"i          !ident_part { return loc(createKeyword(kw)); }
CONSTRAINTS         = kw:"CONSTRAINTS"i         !ident_part { return loc(createKeyword(kw)); }
CONTINUE            = kw:"CONTINUE"i            !ident_part { return loc(createKeyword(kw)); }
COPY                = kw:"COPY"i                !ident_part { return loc(createKeyword(kw)); }
COST                = kw:"COST"i                !ident_part { return loc(createKeyword(kw)); }
COUNT               = kw:"COUNT"i               !ident_part { return loc(createKeyword(kw)); }
CREATE              = kw:"CREATE"i              !ident_part { return loc(createKeyword(kw)); }
CREATEDB            = kw:"CREATEDB"i            !ident_part { return loc(createKeyword(kw)); }
CREATEROLE          = kw:"CREATEROLE"i          !ident_part { return loc(createKeyword(kw)); }
CROSS               = kw:"CROSS"i               !ident_part { return loc(createKeyword(kw)); }
CUBE                = kw:"CUBE"i                !ident_part { return loc(createKeyword(kw)); }
CUME_DIST           = kw:"CUME_DIST"i           !ident_part { return loc(createKeyword(kw)); }
CURRENT             = kw:"CURRENT"i             !ident_part { return loc(createKeyword(kw)); }
CURRENT_CATALOG     = kw:"CURRENT_CATALOG"i     !ident_part { return loc(createKeyword(kw)); }
CURRENT_DATE        = kw:"CURRENT_DATE"i        !ident_part { return loc(createKeyword(kw)); }
CURRENT_DATETIME    = kw:"CURRENT_DATETIME"i    !ident_part { return loc(createKeyword(kw)); }
CURRENT_ROLE        = kw:"CURRENT_ROLE"i        !ident_part { return loc(createKeyword(kw)); }
CURRENT_SCHEMA      = kw:"CURRENT_SCHEMA"i      !ident_part { return loc(createKeyword(kw)); }
CURRENT_TIME        = kw:"CURRENT_TIME"i        !ident_part { return loc(createKeyword(kw)); }
CURRENT_TIMESTAMP   = kw:"CURRENT_TIMESTAMP"i   !ident_part { return loc(createKeyword(kw)); }
CURRENT_USER        = kw:"CURRENT_USER"i        !ident_part { return loc(createKeyword(kw)); }
CYCLE               = kw:"CYCLE"i               !ident_part { return loc(createKeyword(kw)); }
DATA                = kw:"DATA"i                !ident_part { return loc(createKeyword(kw)); }
DATABASE            = kw:"DATABASE"i            !ident_part { return loc(createKeyword(kw)); }
DATE                = kw:"DATE"i                !ident_part { return loc(createKeyword(kw)); }
DATETIME            = kw:"DATETIME"i            !ident_part { return loc(createKeyword(kw)); }
DAY                 = kw:"DAY"i                 !ident_part { return loc(createKeyword(kw)); }
DAY_HOUR            = kw:"DAY_HOUR"             !ident_part { return loc(createKeyword(kw)); }
DAY_MICROSECOND     = kw:"DAY_MICROSECOND"      !ident_part { return loc(createKeyword(kw)); }
DAY_MINUTE          = kw:"DAY_MINUTE"           !ident_part { return loc(createKeyword(kw)); }
DAY_SECOND          = kw:"DAY_SECOND"           !ident_part { return loc(createKeyword(kw)); }
DAYOFWEEK           = kw:"DAYOFWEEK"i           !ident_part { return loc(createKeyword(kw)); }
DAYOFYEAR           = kw:"DAYOFYEAR"i           !ident_part { return loc(createKeyword(kw)); }
DEC                 = kw:"DEC"i                 !ident_part { return loc(createKeyword(kw)); }
DECADE              = kw:"DECADE"i              !ident_part { return loc(createKeyword(kw)); }
DECIMAL             = kw:"DECIMAL"i             !ident_part { return loc(createKeyword(kw)); }
DECLARE             = kw:"DECLARE"i             !ident_part { return loc(createKeyword(kw)); }
DEFAULT             = kw:"DEFAULT"i             !ident_part { return loc(createKeyword(kw)); }
DEFAULTS            = kw:"DEFAULTS"i            !ident_part { return loc(createKeyword(kw)); }
DEFERRABLE          = kw:"DEFERRABLE"i          !ident_part { return loc(createKeyword(kw)); }
DEFERRED            = kw:"DEFERRED"i            !ident_part { return loc(createKeyword(kw)); }
DEFINER             = kw:"DEFINER"i             !ident_part { return loc(createKeyword(kw)); }
DELAY_KEY_WRITE     = kw:"DELAY_KEY_WRITE"i     !ident_part { return loc(createKeyword(kw)); }
DELAYED             = kw:"DELAYED"i             !ident_part { return loc(createKeyword(kw)); }
DELETE              = kw:"DELETE"i              !ident_part { return loc(createKeyword(kw)); }
DENSE_RANK          = kw:"DENSE_RANK"i          !ident_part { return loc(createKeyword(kw)); }
DEPENDS             = kw:"DEPENDS"i             !ident_part { return loc(createKeyword(kw)); }
DEPTH               = kw:"DEPTH"i               !ident_part { return loc(createKeyword(kw)); }
DESC                = kw:"DESC"i                !ident_part { return loc(createKeyword(kw)); }
DESCRIBE            = kw:"DESCRIBE"i            !ident_part { return loc(createKeyword(kw)); }
DETACH              = kw:"DETACH"i              !ident_part { return loc(createKeyword(kw)); }
DETERMINISTIC       = kw:"DETERMINISTIC"i       !ident_part { return loc(createKeyword(kw)); }
DIRECTORY           = kw:"DIRECTORY"i           !ident_part { return loc(createKeyword(kw)); }
DISABLE             = kw:"DISABLE"i             !ident_part { return loc(createKeyword(kw)); }
DISK                = kw:"DISK"i                !ident_part { return loc(createKeyword(kw)); }
DISTINCT            = kw:"DISTINCT"i            !ident_part { return loc(createKeyword(kw)); }
DISTINCTROW         = kw:"DISTINCTROW"i         !ident_part { return loc(createKeyword(kw)); }
DIV                 = kw:"DIV"i                 !ident_part { return loc(createKeyword(kw)); }
DO                  = kw:"DO"i                  !ident_part { return loc(createKeyword(kw)); }
DOMAIN              = kw:"DOMAIN"i              !ident_part { return loc(createKeyword(kw)); }
DOUBLE              = kw:"DOUBLE"i              !ident_part { return loc(createKeyword(kw)); }
DOW                 = kw:"DOW"i                 !ident_part { return loc(createKeyword(kw)); }
DOY                 = kw:"DOY"i                 !ident_part { return loc(createKeyword(kw)); }
DROP                = kw:"DROP"i                !ident_part { return loc(createKeyword(kw)); }
DUAL                = kw:"DUAL"i                !ident_part { return loc(createKeyword(kw)); }
DUMPFILE            = kw:"DUMPFILE"i            !ident_part { return loc(createKeyword(kw)); }
DUPLICATE           = kw:"DUPLICATE"i           !ident_part { return loc(createKeyword(kw)); }
DYNAMIC             = kw:"DYNAMIC"i             !ident_part { return loc(createKeyword(kw)); }
EACH                = kw:"EACH"i                !ident_part { return loc(createKeyword(kw)); }
ELSE                = kw:"ELSE"i                !ident_part { return loc(createKeyword(kw)); }
ELSEIF              = kw:"ELSEIF"i              !ident_part { return loc(createKeyword(kw)); }
ENABLE              = kw:"ENABLE"i              !ident_part { return loc(createKeyword(kw)); }
ENCLOSED            = kw:"ENCLOSED"i            !ident_part { return loc(createKeyword(kw)); }
ENCRYPTED           = kw:"ENCRYPTED"i           !ident_part { return loc(createKeyword(kw)); }
ENCRYPTION          = kw:"ENCRYPTION"i          !ident_part { return loc(createKeyword(kw)); }
END                 = kw:"END"i                 !ident_part { return loc(createKeyword(kw)); }
ENFORCED            = kw:"ENFORCED"i            !ident_part { return loc(createKeyword(kw)); }
ENGINE              = kw:"ENGINE"i              !ident_part { return loc(createKeyword(kw)); }
ENGINE_ATTRIBUTE    = kw:"ENGINE_ATTRIBUTE"i    !ident_part { return loc(createKeyword(kw)); }
ENUM                = kw:"ENUM"i                !ident_part { return loc(createKeyword(kw)); }
EPOCH               = kw:"EPOCH"i               !ident_part { return loc(createKeyword(kw)); }
ERROR               = kw:"ERROR"i               !ident_part { return loc(createKeyword(kw)); }
ESCAPE              = kw:"ESCAPE"i              !ident_part { return loc(createKeyword(kw)); }
ESCAPED             = kw:"ESCAPED"i             !ident_part { return loc(createKeyword(kw)); }
EVENTS              = kw:"EVENTS"i              !ident_part { return loc(createKeyword(kw)); }
EXAMINED            = kw:"EXAMINED"i            !ident_part { return loc(createKeyword(kw)); }
EXCEPT              = kw:"EXCEPT"i              !ident_part { return loc(createKeyword(kw)); }
EXCEPTION           = kw:"EXCEPTION"i           !ident_part { return loc(createKeyword(kw)); }
EXCLUDE             = kw:"EXCLUDE"i             !ident_part { return loc(createKeyword(kw)); }
EXCLUDING           = kw:"EXCLUDING"i           !ident_part { return loc(createKeyword(kw)); }
EXCLUSIVE           = kw:"EXCLUSIVE"i           !ident_part { return loc(createKeyword(kw)); }
EXECUTE             = kw:"EXECUTE"i             !ident_part { return loc(createKeyword(kw)); }
EXISTS              = kw:"EXISTS"i              !ident_part { return loc(createKeyword(kw)); }
EXPANSION           = kw:"EXPANSION"i           !ident_part { return loc(createKeyword(kw)); }
EXPLAIN             = kw:"EXPLAIN"i             !ident_part { return loc(createKeyword(kw)); }
EXPORT              = kw:"EXPORT"i              !ident_part { return loc(createKeyword(kw)); }
EXPRESSION          = kw:"EXPRESSION"i          !ident_part { return loc(createKeyword(kw)); }
EXTENDED            = kw:"EXTENDED"i            !ident_part { return loc(createKeyword(kw)); }
EXTENSION           = kw:"EXTENSION"i           !ident_part { return loc(createKeyword(kw)); }
EXTERNAL            = kw:"EXTERNAL"i            !ident_part { return loc(createKeyword(kw)); }
EXTRACT             = kw:"EXTRACT"i             !ident_part { return loc(createKeyword(kw)); }
FAIL                = kw:"FAIL"i                !ident_part { return loc(createKeyword(kw)); }
FALSE               = kw:"FALSE"i               !ident_part { return loc(createKeyword(kw)); }
FETCH               = kw:"FETCH"i               !ident_part { return loc(createKeyword(kw)); }
FIELDS              = kw:"FIELDS"i              !ident_part { return loc(createKeyword(kw)); }
FILES               = kw:"FILES"i               !ident_part { return loc(createKeyword(kw)); }
FILTER              = kw:"FILTER"i              !ident_part { return loc(createKeyword(kw)); }
FIRST               = kw:"FIRST"i               !ident_part { return loc(createKeyword(kw)); }
FIRST_VALUE         = kw:"FIRST_VALUE"i         !ident_part { return loc(createKeyword(kw)); }
FIXED               = kw:"FIXED"i               !ident_part { return loc(createKeyword(kw)); }
FLOAT               = kw:"FLOAT"i               !ident_part { return loc(createKeyword(kw)); }
FLOAT64             = kw:"FLOAT64"i             !ident_part { return loc(createKeyword(kw)); }
FOLLOWING           = kw:"FOLLOWING"i           !ident_part { return loc(createKeyword(kw)); }
FOR                 = kw:"FOR"i                 !ident_part { return loc(createKeyword(kw)); }
FORCE               = kw:"FORCE"i               !ident_part { return loc(createKeyword(kw)); }
FOREIGN             = kw:"FOREIGN"i             !ident_part { return loc(createKeyword(kw)); }
FORMAT              = kw:"FORMAT"i              !ident_part { return loc(createKeyword(kw)); }
FRIDAY              = kw:"FRIDAY"i              !ident_part { return loc(createKeyword(kw)); }
FROM                = kw:"FROM"i                !ident_part { return loc(createKeyword(kw)); }
FULL                = kw:"FULL"i                !ident_part { return loc(createKeyword(kw)); }
FULLTEXT            = kw:"FULLTEXT"i            !ident_part { return loc(createKeyword(kw)); }
FUNCTION            = kw:"FUNCTION"i            !ident_part { return loc(createKeyword(kw)); }
GENERATED           = kw:"GENERATED"i           !ident_part { return loc(createKeyword(kw)); }
GEOGRAPHY           = kw:"GEOGRAPHY"i           !ident_part { return loc(createKeyword(kw)); }
GLOB                = kw:"GLOB"i                !ident_part { return loc(createKeyword(kw)); }
GLOBAL              = kw:"GLOBAL"i              !ident_part { return loc(createKeyword(kw)); }
GO                  = kw:"GO"i                  !ident_part { return loc(createKeyword(kw)); }
GRANT               = kw:"GRANT"i               !ident_part { return loc(createKeyword(kw)); }
GRANTS              = kw:"GRANTS"i              !ident_part { return loc(createKeyword(kw)); }
GROUP               = kw:"GROUP"i               !ident_part { return loc(createKeyword(kw)); }
GROUP_CONCAT        = kw:"GROUP_CONCAT"i        !ident_part { return loc(createKeyword(kw)); }
GROUPING            = kw:"GROUPING"i            !ident_part { return loc(createKeyword(kw)); }
GROUPS              = kw:"GROUPS"i              !ident_part { return loc(createKeyword(kw)); }
HASH                = kw:"HASH"i                !ident_part { return loc(createKeyword(kw)); }
HAVING              = kw:"HAVING"i              !ident_part { return loc(createKeyword(kw)); }
HIGH_PRIORITY       = kw:"HIGH_PRIORITY"i       !ident_part { return loc(createKeyword(kw)); }
HOUR                = kw:"HOUR"i                !ident_part { return loc(createKeyword(kw)); }
HOUR_MICROSECOND    = kw:"HOUR_MICROSECOND"     !ident_part { return loc(createKeyword(kw)); }
HOUR_MINUTE         = kw:"HOUR_MINUTE"          !ident_part { return loc(createKeyword(kw)); }
HOUR_SECOND         = kw:"HOUR_SECOND"          !ident_part { return loc(createKeyword(kw)); }
IDENTITY            = kw:"IDENTITY"i            !ident_part { return loc(createKeyword(kw)); }
IF                  = kw:"IF"i                  !ident_part { return loc(createKeyword(kw)); }
IGNORE              = kw:"IGNORE"i              !ident_part { return loc(createKeyword(kw)); }
ILIKE               = kw:"ILIKE"i               !ident_part { return loc(createKeyword(kw)); }
IMMEDIATE           = kw:"IMMEDIATE"i           !ident_part { return loc(createKeyword(kw)); }
IMMUTABLE           = kw:"IMMUTABLE"i           !ident_part { return loc(createKeyword(kw)); }
IN                  = kw:"IN"i                  !ident_part { return loc(createKeyword(kw)); }
INCLUDE             = kw:"INCLUDE"i             !ident_part { return loc(createKeyword(kw)); }
INCLUDING           = kw:"INCLUDING"i           !ident_part { return loc(createKeyword(kw)); }
INCREMENT           = kw:"INCREMENT"i           !ident_part { return loc(createKeyword(kw)); }
INDEX               = kw:"INDEX"i               !ident_part { return loc(createKeyword(kw)); }
INDEXED             = kw:"INDEXED"              !ident_part { return loc(createKeyword(kw)); }
INDEXES             = kw:"INDEXES"i             !ident_part { return loc(createKeyword(kw)); }
INHERIT             = kw:"INHERIT"i             !ident_part { return loc(createKeyword(kw)); }
INHERITS            = kw:"INHERITS"i            !ident_part { return loc(createKeyword(kw)); }
INITIALLY           = kw:"INITIALLY"i           !ident_part { return loc(createKeyword(kw)); }
INNER               = kw:"INNER"i               !ident_part { return loc(createKeyword(kw)); }
INOUT               = kw:"INOUT"i               !ident_part { return loc(createKeyword(kw)); }
INPLACE             = kw:"INPLACE"i             !ident_part { return loc(createKeyword(kw)); }
INPUT               = kw:"INPUT"i               !ident_part { return loc(createKeyword(kw)); }
INSERT              = kw:"INSERT"i              !ident_part { return loc(createKeyword(kw)); }
INSERT_METHOD       = kw:"INSERT_METHOD"i       !ident_part { return loc(createKeyword(kw)); }
INSTANT             = kw:"INSTANT"i             !ident_part { return loc(createKeyword(kw)); }
INSTEAD             = kw:"INSTEAD"i             !ident_part { return loc(createKeyword(kw)); }
INT                 = kw:"INT"i                 !ident_part { return loc(createKeyword(kw)); }
INT64               = kw:"INT64"i               !ident_part { return loc(createKeyword(kw)); }
INTEGER             = kw:"INTEGER"i             !ident_part { return loc(createKeyword(kw)); }
INTERSECT           = kw:"INTERSECT"i           !ident_part { return loc(createKeyword(kw)); }
INTERVAL            = kw:"INTERVAL"i            !ident_part { return loc(createKeyword(kw)); }
INTO                = kw:"INTO"i                !ident_part { return loc(createKeyword(kw)); }
INVISIBLE           = kw:"INVISIBLE"i           !ident_part { return loc(createKeyword(kw)); }
INVOKER             = kw:"INVOKER"i             !ident_part { return loc(createKeyword(kw)); }
IS                  = kw:"IS"i                  !ident_part { return loc(createKeyword(kw)); }
ISNULL              = kw:"ISNULL"               !ident_part { return loc(createKeyword(kw)); }
ISODOW              = kw:"ISODOW"i              !ident_part { return loc(createKeyword(kw)); }
ISOWEEK             = kw:"ISOWEEK"i             !ident_part { return loc(createKeyword(kw)); }
ISOYEAR             = kw:"ISOYEAR"i             !ident_part { return loc(createKeyword(kw)); }
ITERATE             = kw:"ITERATE"i             !ident_part { return loc(createKeyword(kw)); }
JOIN                = kw:"JOIN"i                !ident_part { return loc(createKeyword(kw)); }
JSON                = kw:"JSON"i                !ident_part { return loc(createKeyword(kw)); }
JSONB               = kw:"JSONB"i               !ident_part { return loc(createKeyword(kw)); }
JULIAN              = kw:"JULIAN"i              !ident_part { return loc(createKeyword(kw)); }
KEY                 = kw:"KEY"i                 !ident_part { return loc(createKeyword(kw)); }
KEY_BLOCK_SIZE      = kw:"KEY_BLOCK_SIZE"i      !ident_part { return loc(createKeyword(kw)); }
LAG                 = kw:"LAG"i                 !ident_part { return loc(createKeyword(kw)); }
LANGUAGE            = kw:"LANGUAGE"i            !ident_part { return loc(createKeyword(kw)); }
LAST                = kw:"LAST"i                !ident_part { return loc(createKeyword(kw)); }
LAST_VALUE          = kw:"LAST_VALUE"i          !ident_part { return loc(createKeyword(kw)); }
LATERAL             = kw:"LATERAL"i             !ident_part { return loc(createKeyword(kw)); }
LEAD                = kw:"LEAD"i                !ident_part { return loc(createKeyword(kw)); }
LEAKPROOF           = kw:"LEAKPROOF"i           !ident_part { return loc(createKeyword(kw)); }
LEAVE               = kw:"LEAVE"i               !ident_part { return loc(createKeyword(kw)); }
LEFT                = kw:"LEFT"i                !ident_part { return loc(createKeyword(kw)); }
LEVEL               = kw:"LEVEL"i               !ident_part { return loc(createKeyword(kw)); }
LIKE                = kw:"LIKE"i                !ident_part { return loc(createKeyword(kw)); }
LIMIT               = kw:"LIMIT"i               !ident_part { return loc(createKeyword(kw)); }
LINES               = kw:"LINES"i               !ident_part { return loc(createKeyword(kw)); }
LIST                = kw:"LIST"i                !ident_part { return loc(createKeyword(kw)); }
LOAD                = kw:"LOAD"i                !ident_part { return loc(createKeyword(kw)); }
LOCAL               = kw:"LOCAL"i               !ident_part { return loc(createKeyword(kw)); }
LOCALTIME           = kw:"LOCALTIME"i           !ident_part { return loc(createKeyword(kw)); }
LOCALTIMESTAMP      = kw:"LOCALTIMESTAMP"i      !ident_part { return loc(createKeyword(kw)); }
LOCK                = kw:"LOCK"i                !ident_part { return loc(createKeyword(kw)); }
LOCKED              = kw:"LOCKED"i              !ident_part { return loc(createKeyword(kw)); }
LOGGED              = kw:"LOGGED"i              !ident_part { return loc(createKeyword(kw)); }
LOGIN               = kw:"LOGIN"i               !ident_part { return loc(createKeyword(kw)); }
LOGS                = kw:"LOGS"i                !ident_part { return loc(createKeyword(kw)); }
LONGBLOB            = kw:"LONGBLOB"i            !ident_part { return loc(createKeyword(kw)); }
LONGTEXT            = kw:"LONGTEXT"i            !ident_part { return loc(createKeyword(kw)); }
LOOP                = kw:"LOOP"i                !ident_part { return loc(createKeyword(kw)); }
LOW_PRIORITY        = kw:"LOW_PRIORITY"i        !ident_part { return loc(createKeyword(kw)); }
MAIN                = kw:"MAIN"i                !ident_part { return loc(createKeyword(kw)); }
MASTER              = kw:"MASTER"i              !ident_part { return loc(createKeyword(kw)); }
MATCH               = kw:"MATCH"i               !ident_part { return loc(createKeyword(kw)); }
MATCHED             = kw:"MATCHED"i             !ident_part { return loc(createKeyword(kw)); }
MATERIALIZED        = kw:"MATERIALIZED"i        !ident_part { return loc(createKeyword(kw)); }
MAX                 = kw:"MAX"i                 !ident_part { return loc(createKeyword(kw)); }
MAX_ROWS            = kw:"MAX_ROWS"i            !ident_part { return loc(createKeyword(kw)); }
MAXVALUE            = kw:"MAXVALUE"i            !ident_part { return loc(createKeyword(kw)); }
MEDIUMBLOB          = kw:"MEDIUMBLOB"i          !ident_part { return loc(createKeyword(kw)); }
MEDIUMINT           = kw:"MEDIUMINT"i           !ident_part { return loc(createKeyword(kw)); }
MEDIUMTEXT          = kw:"MEDIUMTEXT"i          !ident_part { return loc(createKeyword(kw)); }
MEMBER              = kw:"MEMBER"i              !ident_part { return loc(createKeyword(kw)); }
MEMORY              = kw:"MEMORY"i              !ident_part { return loc(createKeyword(kw)); }
MERGE               = kw:"MERGE"i               !ident_part { return loc(createKeyword(kw)); }
MESSAGE             = kw:"MESSAGE"i             !ident_part { return loc(createKeyword(kw)); }
METHOD              = kw:"METHOD"i              !ident_part { return loc(createKeyword(kw)); }
MICROSECOND         = kw:"MICROSECOND"i         !ident_part { return loc(createKeyword(kw)); }
MICROSECONDS        = kw:"MICROSECONDS"i        !ident_part { return loc(createKeyword(kw)); }
MILLENNIUM          = kw:"MILLENNIUM"i          !ident_part { return loc(createKeyword(kw)); }
MILLISECOND         = kw:"MILLISECOND"i         !ident_part { return loc(createKeyword(kw)); }
MILLISECONDS        = kw:"MILLISECONDS"i        !ident_part { return loc(createKeyword(kw)); }
MIN                 = kw:"MIN"i                 !ident_part { return loc(createKeyword(kw)); }
MIN_ROWS            = kw:"MIN_ROWS"i            !ident_part { return loc(createKeyword(kw)); }
MINUTE              = kw:"MINUTE"i              !ident_part { return loc(createKeyword(kw)); }
MINUTE_MICROSECOND  = kw:"MINUTE_MICROSECOND"   !ident_part { return loc(createKeyword(kw)); }
MINUTE_SECOND       = kw:"MINUTE_SECOND"        !ident_part { return loc(createKeyword(kw)); }
MINVALUE            = kw:"MINVALUE"i            !ident_part { return loc(createKeyword(kw)); }
MOD                 = kw:"MOD"i                 !ident_part { return loc(createKeyword(kw)); }
MODE                = kw:"MODE"i                !ident_part { return loc(createKeyword(kw)); }
MODULUS             = kw:"MODULUS"i             !ident_part { return loc(createKeyword(kw)); }
MONDAY              = kw:"MONDAY"i              !ident_part { return loc(createKeyword(kw)); }
MONTH               = kw:"MONTH"i               !ident_part { return loc(createKeyword(kw)); }
NATIVE              = kw:"NATIVE"i              !ident_part { return loc(createKeyword(kw)); }
NATURAL             = kw:"NATURAL"i             !ident_part { return loc(createKeyword(kw)); }
NCHAR               = kw:"NCHAR"i               !ident_part { return loc(createKeyword(kw)); }
NEW                 = kw:"NEW"i                 !ident_part { return loc(createKeyword(kw)); }
NEXT                = kw:"NEXT"i                !ident_part { return loc(createKeyword(kw)); }
NFC                 = kw:"NFC"i                 !ident_part { return loc(createKeyword(kw)); }
NFD                 = kw:"NFD"i                 !ident_part { return loc(createKeyword(kw)); }
NFKC                = kw:"NFKC"i                !ident_part { return loc(createKeyword(kw)); }
NFKD                = kw:"NFKD"i                !ident_part { return loc(createKeyword(kw)); }
NO                  = kw:"NO"i                  !ident_part { return loc(createKeyword(kw)); }
NOBYPASSRLS         = kw:"NOBYPASSRLS"i         !ident_part { return loc(createKeyword(kw)); }
NOCHECK             = kw:"NOCHECK"i             !ident_part { return loc(createKeyword(kw)); }
NOCREATEDB          = kw:"NOCREATEDB"i          !ident_part { return loc(createKeyword(kw)); }
NOCREATEROLE        = kw:"NOCREATEROLE"i        !ident_part { return loc(createKeyword(kw)); }
NOINHERIT           = kw:"NOINHERIT"i           !ident_part { return loc(createKeyword(kw)); }
NOLOGIN             = kw:"NOLOGIN"i             !ident_part { return loc(createKeyword(kw)); }
NONE                = kw:"NONE"i                !ident_part { return loc(createKeyword(kw)); }
NOREPLICATION       = kw:"NOREPLICATION"i       !ident_part { return loc(createKeyword(kw)); }
NORMALIZED          = kw:"NORMALIZED"i          !ident_part { return loc(createKeyword(kw)); }
NOSUPERUSER         = kw:"NOSUPERUSER"i         !ident_part { return loc(createKeyword(kw)); }
NOT                 = kw:"NOT"i                 !ident_part { return loc(createKeyword(kw)); }
NOTHING             = kw:"NOTHING"i             !ident_part { return loc(createKeyword(kw)); }
NOTNULL             = kw:"NOTNULL"              !ident_part { return loc(createKeyword(kw)); }
NOWAIT              = kw:"NOWAIT"i              !ident_part { return loc(createKeyword(kw)); }
NTH_VALUE           = kw:"NTH_VALUE"i           !ident_part { return loc(createKeyword(kw)); }
NTILE               = kw:"NTILE"i               !ident_part { return loc(createKeyword(kw)); }
NULL                = kw:"NULL"i                !ident_part { return loc(createKeyword(kw)); }
NULLS               = kw:"NULLS"i               !ident_part { return loc(createKeyword(kw)); }
NUMERIC             = kw:"NUMERIC"i             !ident_part { return loc(createKeyword(kw)); }
NVARCHAR            = kw:"NVARCHAR"i            !ident_part { return loc(createKeyword(kw)); }
OF                  = kw:"OF"i                  !ident_part { return loc(createKeyword(kw)); }
OFF                 = kw:"OFF"i                 !ident_part { return loc(createKeyword(kw)); }
OFFSET              = kw:"OFFSET"i              !ident_part { return loc(createKeyword(kw)); }
OIDS                = kw:"OIDS"i                !ident_part { return loc(createKeyword(kw)); }
OLD                 = kw:"OLD"i                 !ident_part { return loc(createKeyword(kw)); }
ON                  = kw:"ON"i                  !ident_part { return loc(createKeyword(kw)); }
ONLY                = kw:"ONLY"i                !ident_part { return loc(createKeyword(kw)); }
OPERATOR            = kw:"OPERATOR"i            !ident_part { return loc(createKeyword(kw)); }
OPTION              = kw:"OPTION"i              !ident_part { return loc(createKeyword(kw)); }
OPTIONALLY          = kw:"OPTIONALLY"i          !ident_part { return loc(createKeyword(kw)); }
OPTIONS             = kw:"OPTIONS"i             !ident_part { return loc(createKeyword(kw)); }
OR                  = kw:"OR"i                  !ident_part { return loc(createKeyword(kw)); }
ORDER               = kw:"ORDER"i               !ident_part { return loc(createKeyword(kw)); }
ORDINAL             = kw:"ORDINAL"i             !ident_part { return loc(createKeyword(kw)); }
ORDINALITY          = kw:"ORDINALITY"i          !ident_part { return loc(createKeyword(kw)); }
ORGANIZATION        = kw:"ORGANIZATION"i        !ident_part { return loc(createKeyword(kw)); }
OTHERS              = kw:"OTHERS"i              !ident_part { return loc(createKeyword(kw)); }
OUT                 = kw:"OUT"i                 !ident_part { return loc(createKeyword(kw)); }
OUTER               = kw:"OUTER"i               !ident_part { return loc(createKeyword(kw)); }
OUTFILE             = kw:"OUTFILE"i             !ident_part { return loc(createKeyword(kw)); }
OVER                = kw:"OVER"i                !ident_part { return loc(createKeyword(kw)); }
OVERRIDING          = kw:"OVERRIDING"i          !ident_part { return loc(createKeyword(kw)); }
OVERWRITE           = kw:"OVERWRITE"i           !ident_part { return loc(createKeyword(kw)); }
OWNED               = kw:"OWNED"i               !ident_part { return loc(createKeyword(kw)); }
OWNER               = kw:"OWNER"i               !ident_part { return loc(createKeyword(kw)); }
PACK_KEYS           = kw:"PACK_KEYS"i           !ident_part { return loc(createKeyword(kw)); }
PARALLEL            = kw:"PARALLEL"i            !ident_part { return loc(createKeyword(kw)); }
PARSER              = kw:"PARSER"i              !ident_part { return loc(createKeyword(kw)); }
PARTIAL             = kw:"PARTIAL"i             !ident_part { return loc(createKeyword(kw)); }
PARTITION           = kw:"PARTITION"i           !ident_part { return loc(createKeyword(kw)); }
PASSWORD            = kw:"PASSWORD"i            !ident_part { return loc(createKeyword(kw)); }
PERCENT             = kw:"PERCENT"i             !ident_part { return loc(createKeyword(kw)); }
PERCENT_RANK        = kw:"PERCENT_RANK"i        !ident_part { return loc(createKeyword(kw)); }
PERSIST             = kw:"PERSIST"i             !ident_part { return loc(createKeyword(kw)); }
PERSIST_ONLY        = kw:"PERSIST_ONLY"i        !ident_part { return loc(createKeyword(kw)); }
PIVOT               = kw:"PIVOT"i               !ident_part { return loc(createKeyword(kw)); }
PLAIN               = kw:"PLAIN"i               !ident_part { return loc(createKeyword(kw)); }
PLAN                = kw:"PLAN"i                !ident_part { return loc(createKeyword(kw)); }
POLICIES            = kw:"POLICIES"i            !ident_part { return loc(createKeyword(kw)); }
POLICY              = kw:"POLICY"i              !ident_part { return loc(createKeyword(kw)); }
PRAGMA              = kw:"PRAGMA"i              !ident_part { return loc(createKeyword(kw)); }
PRECEDING           = kw:"PRECEDING"i           !ident_part { return loc(createKeyword(kw)); }
PRECISION           = kw:"PRECISION"i           !ident_part { return loc(createKeyword(kw)); }
PRESERVE            = kw:"PRESERVE"i            !ident_part { return loc(createKeyword(kw)); }
PRIMARY             = kw:"PRIMARY"i             !ident_part { return loc(createKeyword(kw)); }
PROCEDURE           = kw:"PROCEDURE"i           !ident_part { return loc(createKeyword(kw)); }
PROJECT             = kw:"PROJECT"i             !ident_part { return loc(createKeyword(kw)); }
QUALIFY             = kw:"QUALIFY"i             !ident_part { return loc(createKeyword(kw)); }
QUARTER             = kw:"QUARTER"i             !ident_part { return loc(createKeyword(kw)); }
QUERY               = kw:"QUERY"i               !ident_part { return loc(createKeyword(kw)); }
QUICK               = kw:"QUICK"i               !ident_part { return loc(createKeyword(kw)); }
RAISE               = kw:"RAISE"i               !ident_part { return loc(createKeyword(kw)); }
RANGE               = kw:"RANGE"i               !ident_part { return loc(createKeyword(kw)); }
RANK                = kw:"RANK"i                !ident_part { return loc(createKeyword(kw)); }
READ                = kw:"READ"i                !ident_part { return loc(createKeyword(kw)); }
REAL                = kw:"REAL"i                !ident_part { return loc(createKeyword(kw)); }
RECURSIVE           = kw:"RECURSIVE"            !ident_part { return loc(createKeyword(kw)); }
REDUNDANT           = kw:"REDUNDANT"i           !ident_part { return loc(createKeyword(kw)); }
REFERENCES          = kw:"REFERENCES"i          !ident_part { return loc(createKeyword(kw)); }
REFERENCING         = kw:"REFERENCING"i         !ident_part { return loc(createKeyword(kw)); }
REFRESH             = kw:"REFRESH"i             !ident_part { return loc(createKeyword(kw)); }
REGEXP              = kw:"REGEXP"i              !ident_part { return loc(createKeyword(kw)); }
REINDEX             = kw:"REINDEX"i             !ident_part { return loc(createKeyword(kw)); }
RELEASE             = kw:"RELEASE"i             !ident_part { return loc(createKeyword(kw)); }
REMAINDER           = kw:"REMAINDER"i           !ident_part { return loc(createKeyword(kw)); }
REMOTE              = kw:"REMOTE"i              !ident_part { return loc(createKeyword(kw)); }
RENAME              = kw:"RENAME"i              !ident_part { return loc(createKeyword(kw)); }
REPEAT              = kw:"REPEAT"i              !ident_part { return loc(createKeyword(kw)); }
REPEATABLE          = kw:"REPEATABLE"i          !ident_part { return loc(createKeyword(kw)); }
REPLACE             = kw:"REPLACE"i             !ident_part { return loc(createKeyword(kw)); }
REPLICA             = kw:"REPLICA"i             !ident_part { return loc(createKeyword(kw)); }
REPLICATION         = kw:"REPLICATION"i         !ident_part { return loc(createKeyword(kw)); }
RESERVATION         = kw:"RESERVATION"i         !ident_part { return loc(createKeyword(kw)); }
RESET               = kw:"RESET"i               !ident_part { return loc(createKeyword(kw)); }
RESPECT             = kw:"RESPECT"i             !ident_part { return loc(createKeyword(kw)); }
RESTART             = kw:"RESTART"i             !ident_part { return loc(createKeyword(kw)); }
RESTRICT            = kw:"RESTRICT"i            !ident_part { return loc(createKeyword(kw)); }
RESTRICTED          = kw:"RESTRICTED"i          !ident_part { return loc(createKeyword(kw)); }
RETURN              = kw:"RETURN"i              !ident_part { return loc(createKeyword(kw)); }
RETURNING           = kw:"RETURNING"i           !ident_part { return loc(createKeyword(kw)); }
RETURNS             = kw:"RETURNS"i             !ident_part { return loc(createKeyword(kw)); }
REVOKE              = kw:"REVOKE"i              !ident_part { return loc(createKeyword(kw)); }
RIGHT               = kw:"RIGHT"i               !ident_part { return loc(createKeyword(kw)); }
RLIKE               = kw:"RLIKE"i               !ident_part { return loc(createKeyword(kw)); }
ROLE                = kw:"ROLE"i                !ident_part { return loc(createKeyword(kw)); }
ROLLBACK            = kw:"ROLLBACK"i            !ident_part { return loc(createKeyword(kw)); }
ROLLUP              = kw:"ROLLUP"i              !ident_part { return loc(createKeyword(kw)); }
ROW                 = kw:"ROW"i                 !ident_part { return loc(createKeyword(kw)); }
ROW_FORMAT          = kw:"ROW_FORMAT"i          !ident_part { return loc(createKeyword(kw)); }
ROW_NUMBER          = kw:"ROW_NUMBER"i          !ident_part { return loc(createKeyword(kw)); }
ROWID               = kw:"ROWID"i               !ident_part { return loc(createKeyword(kw)); }
ROWS                = kw:"ROWS"i                !ident_part { return loc(createKeyword(kw)); }
RULE                = kw:"RULE"i                !ident_part { return loc(createKeyword(kw)); }
SAFE                = kw:"SAFE"i                !ident_part { return loc(createKeyword(kw)); }
SAFE_CAST           = kw:"SAFE_CAST"i           !ident_part { return loc(createKeyword(kw)); }
SAFE_OFFSET         = kw:"SAFE_OFFSET"i         !ident_part { return loc(createKeyword(kw)); }
SAFE_ORDINAL        = kw:"SAFE_ORDINAL"i        !ident_part { return loc(createKeyword(kw)); }
SATURDAY            = kw:"SATURDAY"i            !ident_part { return loc(createKeyword(kw)); }
SAVEPOINT           = kw:"SAVEPOINT"i           !ident_part { return loc(createKeyword(kw)); }
SCHEMA              = kw:"SCHEMA"i              !ident_part { return loc(createKeyword(kw)); }
SEARCH              = kw:"SEARCH"i              !ident_part { return loc(createKeyword(kw)); }
SECOND              = kw:"SECOND"i              !ident_part { return loc(createKeyword(kw)); }
SECOND_MICROSECOND  = kw:"SECOND_MICROSECOND"   !ident_part { return loc(createKeyword(kw)); }
SECONDARY_ENGINE_ATTRIBUTE = kw:"SECONDARY_ENGINE_ATTRIBUTE"i !ident_part { return loc(createKeyword(kw)); }
SECURITY            = kw:"SECURITY"i            !ident_part { return loc(createKeyword(kw)); }
SELECT              = kw:"SELECT"i              !ident_part { return loc(createKeyword(kw)); }
SEQUENCE            = kw:"SEQUENCE"i            !ident_part { return loc(createKeyword(kw)); }
SERVER              = kw:"SERVER"i              !ident_part { return loc(createKeyword(kw)); }
SESSION             = kw:"SESSION"i             !ident_part { return loc(createKeyword(kw)); }
SESSION_USER        = kw:"SESSION_USER"i        !ident_part { return loc(createKeyword(kw)); }
SET                 = kw:"SET"i                 !ident_part { return loc(createKeyword(kw)); }
SETS                = kw:"SETS"i                !ident_part { return loc(createKeyword(kw)); }
SHARE               = kw:"SHARE"i               !ident_part { return loc(createKeyword(kw)); }
SHARED              = kw:"SHARED"i              !ident_part { return loc(createKeyword(kw)); }
SHOW                = kw:"SHOW"i                !ident_part { return loc(createKeyword(kw)); }
SIGNED              = kw:"SIGNED"i              !ident_part { return loc(createKeyword(kw)); }
SIMILAR             = kw:"SIMILAR"i             !ident_part { return loc(createKeyword(kw)); }
SIMPLE              = kw:"SIMPLE"i              !ident_part { return loc(createKeyword(kw)); }
SKIP                = kw:"SKIP"i                !ident_part { return loc(createKeyword(kw)); }
SMALLINT            = kw:"SMALLINT"i            !ident_part { return loc(createKeyword(kw)); }
SNAPSHOT            = kw:"SNAPSHOT"i            !ident_part { return loc(createKeyword(kw)); }
SOME                = kw:"SOME"i                !ident_part { return loc(createKeyword(kw)); }
SOUNDS              = kw:"SOUNDS"i              !ident_part { return loc(createKeyword(kw)); }
SOURCE              = kw:"SOURCE"i              !ident_part { return loc(createKeyword(kw)); }
SPATIAL             = kw:"SPATIAL"i             !ident_part { return loc(createKeyword(kw)); }
SQL                 = kw:"SQL"i                 !ident_part { return loc(createKeyword(kw)); }
SQL_BIG_RESULT      = kw:"SQL_BIG_RESULT"i      !ident_part { return loc(createKeyword(kw)); }
SQL_BUFFER_RESULT   = kw:"SQL_BUFFER_RESULT"i   !ident_part { return loc(createKeyword(kw)); }
SQL_CACHE           = kw:"SQL_CACHE"i           !ident_part { return loc(createKeyword(kw)); }
SQL_CALC_FOUND_ROWS = kw:"SQL_CALC_FOUND_ROWS"i !ident_part { return loc(createKeyword(kw)); }
SQL_NO_CACHE        = kw:"SQL_NO_CACHE"i        !ident_part { return loc(createKeyword(kw)); }
SQL_SMALL_RESULT    = kw:"SQL_SMALL_RESULT"i    !ident_part { return loc(createKeyword(kw)); }
STABLE              = kw:"STABLE"i              !ident_part { return loc(createKeyword(kw)); }
START               = kw:"START"i               !ident_part { return loc(createKeyword(kw)); }
STARTING            = kw:"STARTING"i            !ident_part { return loc(createKeyword(kw)); }
STATEMENT           = kw:"STATEMENT"i           !ident_part { return loc(createKeyword(kw)); }
STATISTICS          = kw:"STATISTICS"i          !ident_part { return loc(createKeyword(kw)); }
STATS_AUTO_RECALC   = kw:"STATS_AUTO_RECALC"i   !ident_part { return loc(createKeyword(kw)); }
STATS_PERSISTENT    = kw:"STATS_PERSISTENT"i    !ident_part { return loc(createKeyword(kw)); }
STATS_SAMPLE_PAGES  = kw:"STATS_SAMPLE_PAGES"i  !ident_part { return loc(createKeyword(kw)); }
STORAGE             = kw:"STORAGE"i             !ident_part { return loc(createKeyword(kw)); }
STORED              = kw:"STORED"i              !ident_part { return loc(createKeyword(kw)); }
STRAIGHT_JOIN       = kw:"STRAIGHT_JOIN"i       !ident_part { return loc(createKeyword(kw)); }
STRICT              = kw:"STRICT"i              !ident_part { return loc(createKeyword(kw)); }
STRING              = kw:"STRING"i              !ident_part { return loc(createKeyword(kw)); }
STRUCT              = kw:"STRUCT"i              !ident_part { return loc(createKeyword(kw)); }
SUM                 = kw:"SUM"i                 !ident_part { return loc(createKeyword(kw)); }
SUNDAY              = kw:"SUNDAY"i              !ident_part { return loc(createKeyword(kw)); }
SUPERUSER           = kw:"SUPERUSER"i           !ident_part { return loc(createKeyword(kw)); }
SUPPORT             = kw:"SUPPORT"i             !ident_part { return loc(createKeyword(kw)); }
SYMMETRIC           = kw:"SYMMETRIC"i           !ident_part { return loc(createKeyword(kw)); }
SYSID               = kw:"SYSID"i               !ident_part { return loc(createKeyword(kw)); }
SYSTEM              = kw:"SYSTEM"i              !ident_part { return loc(createKeyword(kw)); }
SYSTEM_TIME         = kw:"SYSTEM_TIME"i         !ident_part { return loc(createKeyword(kw)); }
SYSTEM_USER         = kw:"SYSTEM_USER"i         !ident_part { return loc(createKeyword(kw)); }
TABLE               = kw:"TABLE"i               !ident_part { return loc(createKeyword(kw)); }
TABLES              = kw:"TABLES"i              !ident_part { return loc(createKeyword(kw)); }
TABLESAMPLE         = kw:"TABLESAMPLE"i         !ident_part { return loc(createKeyword(kw)); }
TABLESPACE          = kw:"TABLESPACE"i          !ident_part { return loc(createKeyword(kw)); }
TARGET              = kw:"TARGET"i              !ident_part { return loc(createKeyword(kw)); }
TEMP                = kw:"TEMP"i                !ident_part { return loc(createKeyword(kw)); }
TEMPORARY           = kw:"TEMPORARY"i           !ident_part { return loc(createKeyword(kw)); }
TEMPTABLE           = kw:"TEMPTABLE"i           !ident_part { return loc(createKeyword(kw)); }
TERMINATED          = kw:"TERMINATED"i          !ident_part { return loc(createKeyword(kw)); }
TEXT                = kw:"TEXT"i                !ident_part { return loc(createKeyword(kw)); }
THEN                = kw:"THEN"i                !ident_part { return loc(createKeyword(kw)); }
THURSDAY            = kw:"THURSDAY"i            !ident_part { return loc(createKeyword(kw)); }
TIES                = kw:"TIES"i                !ident_part { return loc(createKeyword(kw)); }
TIME                = kw:"TIME"i                !ident_part { return loc(createKeyword(kw)); }
TIMESTAMP           = kw:"TIMESTAMP"i           !ident_part { return loc(createKeyword(kw)); }
TIMEZONE            = kw:"TIMEZONE"i            !ident_part { return loc(createKeyword(kw)); }
TIMEZONE_HOUR       = kw:"TIMEZONE_HOUR"i       !ident_part { return loc(createKeyword(kw)); }
TIMEZONE_MINUTE     = kw:"TIMEZONE_MINUTE"i     !ident_part { return loc(createKeyword(kw)); }
TINYBLOB            = kw:"TINYBLOB"i            !ident_part { return loc(createKeyword(kw)); }
TINYINT             = kw:"TINYINT"i             !ident_part { return loc(createKeyword(kw)); }
TINYTEXT            = kw:"TINYTEXT"i            !ident_part { return loc(createKeyword(kw)); }
TO                  = kw:"TO"i                  !ident_part { return loc(createKeyword(kw)); }
TRANSACTION         = kw:"TRANSACTION"i         !ident_part { return loc(createKeyword(kw)); }
TRANSFORM           = kw:"TRANSFORM"i           !ident_part { return loc(createKeyword(kw)); }
TRIGGER             = kw:"TRIGGER"i             !ident_part { return loc(createKeyword(kw)); }
TRUE                = kw:"TRUE"i                !ident_part { return loc(createKeyword(kw)); }
TRUNCATE            = kw:"TRUNCATE"i            !ident_part { return loc(createKeyword(kw)); }
TUESDAY             = kw:"TUESDAY"i             !ident_part { return loc(createKeyword(kw)); }
TYPE                = kw:"TYPE"i                !ident_part { return loc(createKeyword(kw)); }
UESCAPE             = kw:"UESCAPE"i             !ident_part { return loc(createKeyword(kw)); }
UNBOUNDED           = kw:"UNBOUNDED"i           !ident_part { return loc(createKeyword(kw)); }
UNDEFINED           = kw:"UNDEFINED"i           !ident_part { return loc(createKeyword(kw)); }
UNION               = kw:"UNION"i               !ident_part { return loc(createKeyword(kw)); }
UNIQUE              = kw:"UNIQUE"i              !ident_part { return loc(createKeyword(kw)); }
UNKNOWN             = kw:"UNKNOWN"i             !ident_part { return loc(createKeyword(kw)); }
UNLOCK              = kw:"UNLOCK"i              !ident_part { return loc(createKeyword(kw)); }
UNLOGGED            = kw:"UNLOGGED"i            !ident_part { return loc(createKeyword(kw)); }
UNNEST              = kw:"UNNEST"i              !ident_part { return loc(createKeyword(kw)); }
UNPIVOT             = kw:"UNPIVOT"              !ident_part { return loc(createKeyword(kw)); }
UNSAFE              = kw:"UNSAFE"i              !ident_part { return loc(createKeyword(kw)); }
UNSIGNED            = kw:"UNSIGNED"i            !ident_part { return loc(createKeyword(kw)); }
UNTIL               = kw:"UNTIL"i               !ident_part { return loc(createKeyword(kw)); }
UPDATE              = kw:"UPDATE"i              !ident_part { return loc(createKeyword(kw)); }
USE                 = kw:"USE"i                 !ident_part { return loc(createKeyword(kw)); }
USER                = kw:"USER"i                !ident_part { return loc(createKeyword(kw)); }
USING               = kw:"USING"i               !ident_part { return loc(createKeyword(kw)); }
VACUUM              = kw:"VACUUM"i              !ident_part { return loc(createKeyword(kw)); }
VALID               = kw:"VALID"i               !ident_part { return loc(createKeyword(kw)); }
VALIDATE            = kw:"VALIDATE"i            !ident_part { return loc(createKeyword(kw)); }
VALUE               = kw:"VALUE"i               !ident_part { return loc(createKeyword(kw)); }
VALUES              = kw:"VALUES"i              !ident_part { return loc(createKeyword(kw)); }
VARBINARY           = kw:"VARBINARY"i           !ident_part { return loc(createKeyword(kw)); }
VARCHAR             = kw:"VARCHAR"i             !ident_part { return loc(createKeyword(kw)); }
VARIADIC            = kw:"VARIADIC"i            !ident_part { return loc(createKeyword(kw)); }
VARYING             = kw:"VARYING"i             !ident_part { return loc(createKeyword(kw)); }
VECTOR              = kw:"VECTOR"i              !ident_part { return loc(createKeyword(kw)); }
VERBOSE             = kw:"VERBOSE"i             !ident_part { return loc(createKeyword(kw)); }
VIEW                = kw:"VIEW"i                !ident_part { return loc(createKeyword(kw)); }
VIRTUAL             = kw:"VIRTUAL"i             !ident_part { return loc(createKeyword(kw)); }
VISIBLE             = kw:"VISIBLE"i             !ident_part { return loc(createKeyword(kw)); }
VOLATILE            = kw:"VOLATILE"i            !ident_part { return loc(createKeyword(kw)); }
WAIT                = kw:"WAIT"i                !ident_part { return loc(createKeyword(kw)); }
WEDNESDAY           = kw:"WEDNESDAY"i           !ident_part { return loc(createKeyword(kw)); }
WEEK                = kw:"WEEK"i                !ident_part { return loc(createKeyword(kw)); }
WHEN                = kw:"WHEN"i                !ident_part { return loc(createKeyword(kw)); }
WHERE               = kw:"WHERE"i               !ident_part { return loc(createKeyword(kw)); }
WHILE               = kw:"WHILE"i               !ident_part { return loc(createKeyword(kw)); }
WINDOW              = kw:"WINDOW"i              !ident_part { return loc(createKeyword(kw)); }
WITH                = kw:"WITH"i                !ident_part { return loc(createKeyword(kw)); }
WITHOUT             = kw:"WITHOUT"i             !ident_part { return loc(createKeyword(kw)); }
WORK                = kw:"WORK"i                !ident_part { return loc(createKeyword(kw)); }
WRITE               = kw:"WRITE"i               !ident_part { return loc(createKeyword(kw)); }
XOR                 = kw:"XOR"i                 !ident_part { return loc(createKeyword(kw)); }
YEAR                = kw:"YEAR"i                !ident_part { return loc(createKeyword(kw)); }
YEAR_MONTH          = kw:"YEAR_MONTH"i          !ident_part { return loc(createKeyword(kw)); }
ZEROFILL            = kw:"ZEROFILL"i            !ident_part { return loc(createKeyword(kw)); }
ZONE                = kw:"ZONE"i                !ident_part { return loc(createKeyword(kw)); }
/*! keywords:end */
