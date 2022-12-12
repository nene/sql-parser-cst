{
  import { identity } from "./utils/generic";
  import {
    readCommaSepList,
    readSpaceSepList,
  } from "./utils/list";
  import {
    parseHexBlob,
    parseBitBlob,
    parseAsciiBlob,
  } from "./utils/blob";
  import {
    createBinaryExprChain,
    createBinaryExpr,
    createCompoundSelectStmtChain,
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
    isSqlite,
    hasParamType,
    isEnabledWhitespace,
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
  = statements:multiple_stmt {
    return loc({ type: "program", statements });
  }

multiple_stmt
  = head:statement tail:(__ ";" __ statement)* {
    return readCommaSepList(head, tail);
  }

statement
  = dml_statement
  / ddl_statement
  / x:analyze_stmt (&mysql / &sqlite) { return x; }
  / x:explain_stmt (&mysql / &sqlite) { return x; }
  / transaction_stmt
  / x:sqlite_stmt &sqlite { return x; }
  / x:bigquery_stmt &bigquery { return x; }
  / empty

ddl_statement
  = create_view_stmt
  / drop_view_stmt
  / x:alter_view_stmt &bigquery { return x; }
  / create_index_stmt
  / drop_index_stmt
  / x:(create_function_stmt / drop_function_stmt) &bigquery { return x; }
  / x:(create_procedure_stmt / drop_procedure_stmt) &bigquery { return x; }
  / create_table_stmt
  / drop_table_stmt
  / alter_table_stmt
  / x:create_trigger_stmt (&mysql / &sqlite) { return x; }
  / x:drop_trigger_stmt (&mysql / &sqlite) { return x; }
  / x:(create_schema_stmt / drop_schema_stmt / alter_schema_stmt) (&mysql / &bigquery) { return x; }

dml_statement
  = compound_select_stmt
  / insert_stmt
  / update_stmt
  / delete_stmt
  / x:truncate_stmt &bigquery { return x; }
  / x:merge_stmt &bigquery { return x; }

empty
  = (&. / end_of_file) {
    return loc({ type: "empty" });
  }

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

/**
 * SELECT .. WITH
 * --------------------------------------------------------------------------------------
 */
with_clause
  = withKw:WITH
    recursiveKw:(__ RECURSIVE)?
    tables:(__ list$common_table_expression) {
      return loc({
        type: "with_clause",
        withKw,
        recursiveKw: read(recursiveKw),
        tables: read(tables),
      });
    }

common_table_expression
  = table:ident
    columns:(__ paren$list$column)?
    asKw:(__ AS)
    opt:(__ cte_option)?
    select:(__ paren$compound_select_stmt) {
      return loc({
        type: "common_table_expression",
        table: table,
        columns: read(columns),
        asKw: read(asKw),
        optionKw: read(opt),
        expr: read(select),
      });
    }

cte_option
  = kws:(NOT __ MATERIALIZED / MATERIALIZED) { return read(kws); }

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

/**
 * SELECT .. columns
 * --------------------------------------------------------------------------------------
 */
select_clause
  = selectKw:SELECT
    distinctKw:(__ distinct_kw)?
    options:(__ select_option)*
    asKw:(__ AS __ (STRUCT / VALUE))?
    columns:(__ select_columns) {
      return loc({
        type: "select_clause",
        selectKw,
        distinctKw: read(distinctKw),
        options: options.map(read),
        asStructOrValueKw: read(asKw),
        columns: read(columns),
      });
    }

distinct_kw
  = ALL
  / DISTINCT
  / &mysql kw:DISTINCTROW { return kw; }

select_option
  = &mysql kw:(
    HIGH_PRIORITY
  / STRAIGHT_JOIN
  / SQL_CALC_FOUND_ROWS
  / SQL_CACHE
  / SQL_NO_CACHE
  / SQL_BIG_RESULT
  / SQL_SMALL_RESULT
  / SQL_BUFFER_RESULT) {
    return kw;
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
  = star:star {
    return star;
  }
  / table:(ident __) "." star:(__ star) {
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
  = kw:AS id:(__ alias_ident) {
    return {
      asKw: kw,
      alias: read(id),
    };
  }

// BigQuery allows PIVOT and UNPIVOT as implicit alias names.
// But implicit alias can where PIVOT/UNPIVOT expression can appear.
// So we check if we can treat it as pivot/unpivot_expr, and only if not,
// will we treat it as alias.
implicit_alias
  = &bigquery !(pivot_expr_right / unpivot_expr_right) id:alias_ident {
    return { alias: id };
  }
  / !bigquery id:alias_ident {
    return { alias: id };
  }

/**
 * SELECT .. FROM
 * --------------------------------------------------------------------------------------
 */
from_clause
  = kw:(FROM __) expr:join_expr {
    return loc({
      type: "from_clause",
      fromKw: read(kw),
      expr,
    });
  }

join_expr
  = head:table_or_subquery
    tail:(__ (join_expr_right / pivot_expr_right / unpivot_expr_right / tablesample_expr_right))* {
      return createJoinExprChain(head, tail);
    }

join_expr_right
  = op:(join_op / ",") right:(__ table_or_subquery) spec:(__ join_specification)? {
    return {
      type: "join_expr_right",
      operator: op,
      right: read(right),
      specification: read(spec),
    };
  }

table_or_subquery
  = t:(unnest_with_offset_expr / func_call / paren$join_expr / paren$compound_select_stmt) alias:(__ alias)? {
    return loc(createAlias(t, alias));
  }
  / table_or_alias

table_or_alias
  = &sqlite table:(alias$table __) kw:(INDEXED __ BY) id:(__ ident) {
    return loc({
      type: "indexed_table",
      table: read(table),
      indexedByKw: read(kw),
      index: read(id),
    });
  }
  / &sqlite table:(alias$table __) kw:(NOT __ INDEXED) {
    return loc({
      type: "not_indexed_table",
      table: read(table),
      notIndexedKw: read(kw),
    });
  }
  / alias$table

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
  = &bigquery kw:(PIVOT __) args:paren$pivot_for_in {
    return {
      type: "pivot_expr_right",
      pivotKw: read(kw),
      args,
    };
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
  = &bigquery kw:(UNPIVOT __)
    nulls:((INCLUDE / EXCLUDE) __ NULLS __)?
    args:paren$unpivot_for_in {
      return {
        type: "unpivot_expr_right",
        unpivotKw: read(kw),
        nullHandlingKw: read(nulls),
        args,
      };
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
  = &bigquery kw:(TABLESAMPLE __ SYSTEM __) args:paren$tablesample_percent {
    return {
      type: "tablesample_expr_right",
      tablesampleKw: read(kw),
      args,
    };
  }

tablesample_percent
  = p:(literal / parameter) kw:(__ PERCENT) {
    return loc({
      type: "tablesample_percent",
      percent: p,
      percentKw: read(kw),
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
  = kws:(GROUP __ BY __) list:(group_by_rollup / list$expr) {
    return loc({
      type: "group_by_clause",
      groupByKw: read(kws),
      columns: list,
    });
  }

group_by_rollup
  = &bigquery kw:(ROLLUP __) cols:paren$list$expr {
    return loc({
      type: "group_by_rollup",
      rollupKw: read(kw),
      columns: cols,
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
  = e:expr orderKw:(__ (DESC / ASC))? nullsKw:(__ sort_specification_nulls)? {
    // don't create full sort_specification node when dealing with just a column name
    if (!orderKw && !nullsKw && e.type === "identifier") {
      return e;
    }

    return loc({
      type: "sort_specification",
      expr: read(e),
      orderKw: read(orderKw),
      ...(nullsKw ? {nullHandlingKw: read(nullsKw)} : {}),
    });
  }

sort_specification_nulls
  = kws:(NULLS __ (FIRST / LAST)) &sqlite {
    return read(kws);
  }


/**
 * SELECT .. LIMIT
 * --------------------------------------------------------------------------------------
 */
limit_clause
  = kw:LIMIT count:(__ expr __) offkw:OFFSET offset:(__ expr)  {
    return loc({
      type: "limit_clause",
      limitKw: kw,
      count: read(count),
      offsetKw: offkw,
      offset: read(offset),
    });
  }
  / kw:LIMIT offset:(__ expr __) "," count:(__ expr)  {
    return loc({
      type: "limit_clause",
      limitKw: kw,
      offset: read(offset),
      count: read(count),
    });
  }
  / kw:LIMIT count:(__ expr) {
    return loc({ type: "limit_clause", limitKw: kw, count: read(count) });
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
  = name:ident?
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
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * INSERT INTO                                                                          *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
insert_stmt
  = withCls:(with_clause __)?
    insertCls:insert_clause
    source:(__ insert_source)
    upsert:(__ upsert_clause)*
    returning:(__ returning_clause)? {
      return loc({
        type: "insert_stmt",
        clauses: [
          read(withCls),
          insertCls,
          read(source),
          ...upsert.map(read),
          read(returning),
        ].filter(identity),
      });
    }

insert_clause
  = insertKw:(INSERT / REPLACE)
    options:(__ upsert_options)?
    orAction:(__ or_alternate_action)?
    intoKw:(__ INTO)?
    table:(__ table_or_explicit_alias)
    columns:(__ paren$list$column)? {
      return loc({
        type: "insert_clause",
        insertKw,
        options: read(options) || [],
        orAction: read(orAction),
        intoKw: read(intoKw),
        table: read(table),
        columns: read(columns),
      });
    }

upsert_options
  = head:upsert_opt tail:(__ upsert_opt)* {
    return readSpaceSepList(head, tail);
  }

upsert_opt
  = kw:(LOW_PRIORITY / DELAYED / HIGH_PRIORITY / IGNORE) &mysql {
    return loc({ type: "upsert_option", kw });
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
  = t:table alias:(__ explicit_alias)? {
    return loc(createAlias(t, alias));
  }

insert_source
  = values_clause
  / compound_select_stmt
  / default_values

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
  / &bigquery list:paren$list$expr_or_default { return list; }
  / &mysql list:(paren$list$expr_or_default / row_constructor) { return list; }

row_constructor
  = kw:(ROW __) row:paren$list$expr_or_default {
    return loc({
      type: "row_constructor",
      rowKw: read(kw),
      row,
    });
  }

expr_or_default
  = expr / default

default
  = kw:DEFAULT {
    return loc({ type: "default", kw });
  }

default_values
  = kws:(DEFAULT __ VALUES) {
      return loc({ type: "default_values", kw: read(kws) });
    }

upsert_clause
  = &sqlite
    kw:(ON __ CONFLICT __) columns:(paren$list$sort_specification __)? where:(where_clause __)?
    doKw:DO action:(__ upsert_action) {
    return loc({
      type: "upsert_clause",
      onConflictKw: read(kw),
      columns: read(columns),
      where: read(where),
      doKw,
      action: read(action),
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
    clauses:(__ other_update_clause_list)? {
      return loc({
        type: "update_stmt",
        clauses: [
          read(withClause),
          read(updateClause),
          read(setClause),
          ...(read(clauses) || []),
        ].filter(identity),
      });
    }

update_clause
  = kw:(UPDATE __)
    options:(upsert_options __)?
    orAction:(or_alternate_action __)?
    tables:list$table_or_alias {
      return loc({
        type: "update_clause",
        updateKw: read(kw),
        options: read(options) || [],
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

other_update_clause_list
  = head:other_update_clause tail:(__ other_update_clause)* {
    return readSpaceSepList(head, tail);
  }

other_update_clause
  = from_clause
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
  = expr
  / x:default &mysql { return x; }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * DELETE FROM                                                                          *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
delete_stmt
  = withCls:(with_clause __)?
    delKw:(DELETE __) fromKw:(FROM __)? tbl:table_or_alias
    where:(__ where_clause)?
    returning:(__ returning_clause)? {
      return loc({
        type: "delete_stmt",
        with: read(withCls),
        deleteKw: read(delKw),
        fromKw: read(fromKw),
        table: tbl,
        where: read(where),
        returning: read(returning),
      });
    }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * TRUNCATE TABLE                                                                       *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
truncate_stmt
  = kws:(TRUNCATE __ TABLE __) tbl:table {
    return loc({
      type: "truncate_stmt",
      truncateTableKw: read(kws),
      table: tbl,
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
  = mergeKw:(MERGE __) intoKw:(INTO __)? target:(table_or_alias __)
    usingKw:(USING __) source:((table_or_alias / alias$paren$compound_select_stmt) __)
    onKw:(ON __) condition:expr
    clauses:(__ merge_when_clause)+ {
      return loc({
        type: "merge_stmt",
        mergeKw: read(mergeKw),
        intoKw: read(intoKw),
        target: read(target),
        usingKw: read(usingKw),
        source: read(source),
        onKw: read(onKw),
        condition,
        clauses: clauses.map(read),
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
  = merge_action_delete
  / merge_action_update
  / merge_action_insert

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
  = insertKw:(INSERT __) columns:(paren$list$column __)? values:(values_clause / ROW) {
    return loc({
      type: "merge_action_insert",
      insertKw: read(insertKw),
      columns: read(columns),
      values,
    });
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
    tmpKw:(__ (TEMP / TEMPORARY))?
    materKw:(__ MATERIALIZED)?
    viewKw:(__ VIEW)
    ifKw:(__ if_not_exists)?
    name:(__ table)
    cols:(__ paren$list$column)?
    options:(__ create_view_option)*
    asKw:(__ AS)
    select:(__ compound_select_stmt) {
      return loc({
        type: "create_view_stmt",
        createKw,
        orReplaceKw: read(repKw),
        temporaryKw: read(tmpKw),
        materializedKw: read(materKw),
        viewKw: read(viewKw),
        ifNotExistsKw: read(ifKw),
        name: read(name),
        columns: read(cols),
        options: options.map(read),
        asKw: read(asKw),
        expr: read(select),
      });
    }

create_view_option
  = &bigquery op:(
        bigquery_options
      / cluster_by_clause
      / partition_by_clause
    ) { return op; }

drop_view_stmt
  = dropKw:DROP
    materKw:(__ MATERIALIZED)?
    viewKw:(__ VIEW)
    ifKw:(__ if_exists)?
    views:(__ list$table)
    behaviorKw:(__ (CASCADE / RESTRICT))? {
      return loc({
        type: "drop_view_stmt",
        dropKw: read(dropKw),
        materializedKw: read(materKw),
        viewKw: read(viewKw),
        ifExistsKw: read(ifKw),
        views: read(views),
        behaviorKw: read(behaviorKw),
      });
    }

alter_view_stmt
  = alterKw:ALTER
    materKw:(__ MATERIALIZED)?
    viewKw:(__ VIEW)
    ifKw:(__ if_exists)?
    name:(__ table)
    actions:(__ alter_view_action)+ {
      return loc({
        type: "alter_view_stmt",
        alterKw,
        materializedKw: read(materKw),
        viewKw: read(viewKw),
        ifExistsKw: read(ifKw),
        name: read(name),
        actions: actions.map(read),
      });
    }

alter_view_action
  = &bigquery ac:alter_action_set_options { return ac; }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * CREATE INDEX  /  DROP INDEX                                                          *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
create_index_stmt
  = kw:(CREATE __)
    typeKw:(index_type_kw __)?
    indexKw:(INDEX __)
    ifKw:(if_not_exists __)?
    name:(table __)
    onKw:(ON __)
    table:(table __)
    columns:(paren$list$sort_specification / paren$verbose_all_columns)
    clauses: (__ create_index_subclause)* {
      return loc({
        type: "create_index_stmt",
        createKw: read(kw),
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

index_type_kw
  = x:UNIQUE (&mysql / &sqlite) { return x; }
  / x:FULLTEXT &mysql { return x; }
  / x:SPATIAL &mysql { return x; }
  / x:SEARCH &bigquery { return x; }

create_index_subclause
  = &sqlite x:where_clause { return x; }
  / &bigquery x:bigquery_options { return x; }

verbose_all_columns
  = &bigquery kws:(ALL __ COLUMNS) {
    return loc({ type: "verbose_all_columns", allColumnsKw: read(kws) })
  }

// DROP INDEX
drop_index_stmt
  = &sqlite
    kw:(DROP __)
    indexKw:(INDEX __)
    ifKw:(if_exists __)?
    indexes:list$table {
      return loc({
        type: "drop_index_stmt",
        dropKw: read(kw),
        indexKw: read(indexKw),
        ifExistsKw: read(ifKw),
        indexes: read(indexes)
      });
    }
  / (&mysql / &bigquery)
    kw:(DROP __)
    indexTypeKw:(SEARCH __)?
    indexKw:(INDEX __)
    ifKw:(if_exists __)?
    indexes:(list$table __)
    onKw:(ON __)
    table:table {
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
    tmpKw:(__ (TEMPORARY / TEMP))?
    externalKw:(__ EXTERNAL)?
    snapshotKw:(__ SNAPSHOT)?
    tableKw:(__ TABLE)
    ifKw:(__ if_not_exists)?
    table:(__ table)
    columns:(__ paren$list$create_definition)?
    options:(__ table_options)?
    clauses:(__ create_table_clause)*
    {
      return loc({
        type: "create_table_stmt",
        createKw,
        orReplaceKw: read(replKw),
        temporaryKw: read(tmpKw),
        externalKw: read(externalKw),
        snapshotKw: read(snapshotKw),
        tableKw: read(tableKw),
        ifNotExistsKw: read(ifKw),
        table: read(table),
        columns: read(columns),
        options: read(options),
        clauses: clauses.map(read),
      });
    }

if_not_exists
  = kws:(IF __ NOT __ EXISTS) { return read(kws); }

create_definition
  = !bigquery c:table_constraint { return c; }
  / column_definition

column_definition
  = name:(ident __)
    type:data_type?
    constraints:(__ column_constraint_list)? {
      return loc({
        type: "column_definition",
        name: read(name),
        dataType: read(type),
        constraints: read(constraints) || [],
      });
    }

column_constraint_list
  = head:column_constraint tail:(__ column_constraint)* {
    return readSpaceSepList(head, tail);
  }

create_table_clause
  = create_table_as_clause
  / (&bigquery / &mysql) x:create_table_like_clause { return x; }
  / &bigquery x:create_table_clause_bigquery { return x; }

create_table_as_clause
  = asKw:AS expr:(__ sub_select) {
    return loc({
      type: "as_clause",
      asKw,
      expr: read(expr),
    });
  }

create_table_like_clause
  = kw:(LIKE __) name:table {
    return loc({
      type: "create_table_like_clause",
      likeKw: read(kw),
      name,
    });
  }

create_table_clause_bigquery
  = create_table_copy_clause
  / create_table_clone_clause
  / for_system_time_as_of_clause
  / bigquery_options
  / bigquery_option_default_collate
  / partition_by_clause
  / cluster_by_clause

create_table_copy_clause
  = kw:(COPY __) name:table {
    return loc({
      type: "create_table_copy_clause",
      copyKw: read(kw),
      name,
    });
  }

create_table_clone_clause
  = kw:(CLONE __) name:table {
    return loc({
      type: "create_table_clone_clause",
      cloneKw: read(kw),
      name,
    });
  }

for_system_time_as_of_clause
  = kw:(FOR __ SYSTEM __ TIME __ AS __ OF __) expr:expr {
    return loc({
      type: "for_system_time_as_of_clause",
      forSystemTimeAsOfKw: read(kw),
      expr,
    });
  }

bigquery_options
  = kw:(OPTIONS __) options:paren$list$equals_expr {
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
  = kw:(DEFAULT __ COLLATE __) value:literal_string {
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
    temporaryKw:(TEMPORARY __)?
    tableKw:(TABLE __)
    ifExistsKw:(if_exists __)?
    tables:list$table
    behaviorKw:(__ (CASCADE / RESTRICT))?
    {
      return loc({
        type: "drop_table_stmt",
        dropKw: read(dropKw),
        temporaryKw: read(temporaryKw),
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
    t:(table __)
    actions:list$alter_action {
      return loc({
        type: "alter_table_stmt",
        alterTableKw: read(kw),
        ifExistsKw: read(ifKw),
        table: read(t),
        actions,
      });
    }

alter_action
  = alter_action_add_column
  / alter_action_drop_column
  / alter_action_rename_column
  / alter_action_rename_table
  / x:alter_action_alter_column (&mysql / &bigquery) { return x; }
  / x:alter_action_set_default_collate &bigquery { return x; }
  / x:alter_action_set_options &bigquery { return x; }

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
  = kw:(DROP __ COLUMN __ / DROP __) ifKw:(if_exists __)? col:ident {
      return loc({
        type: "alter_action_drop_column",
        dropKw: read(kw),
        ifExistsKw: read(ifKw),
        column: col,
      })
    }

alter_action_rename_table
  = kw:(rename_table_kw __) t:table {
    return loc({
      type: "alter_action_rename_table",
      renameKw: read(kw),
      newName: t,
    });
  }

rename_table_kw
  = kw:(RENAME __ TO) { return read(kw); }
  / kw:(RENAME __ AS) &mysql { return read(kw); }
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
  / kw:RENAME &sqlite { return kw; }

alter_action_alter_column
  = alterKw:(alter_column_kw __) ifKw:(if_exists __)? column:(column __) action:alter_column_action {
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
  / kw:ALTER &sqlite { return kw; }

alter_action_set_default_collate
  = kw:(SET __ DEFAULT __ COLLATE __) collation:literal_string {
    return loc({
      type: "alter_action_set_default_collate",
      setDefaultCollateKw: read(kw),
      collation,
    });
  }

alter_action_set_options
  = kw:(SET __ ) options:bigquery_options {
    return loc({
      type: "alter_action_set_options",
      setKw: read(kw),
      options,
    });
  }

alter_column_action
  = alter_action_set_default
  / alter_action_drop_default
  / x:alter_action_drop_not_null &bigquery { return x; }
  / x:alter_action_set_data_type &bigquery { return x; }
  / x:alter_action_set_options &bigquery { return x; }

alter_action_set_default
  = kw:(SET __ DEFAULT __) expr:expr {
    return loc({ type: "alter_action_set_default", setDefaultKw: read(kw), expr });
  }

alter_action_drop_default
  = kw:(DROP __ DEFAULT) {
    return loc({ type: "alter_action_drop_default", dropDefaultKw: read(kw) });
  }

alter_action_drop_not_null
  = kw:(DROP __ NOT __ NULL) {
    return loc({ type: "alter_action_drop_not_null", dropNotNullKw: read(kw) });
  }

alter_action_set_data_type
  = kw:(SET __ DATA __ TYPE __) type:data_type {
    return loc({ type: "alter_action_set_data_type", setDataTypeKw: read(kw), dataType: type });
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
    tmpKw:((TEMPORARY / TEMP) __)?
    trigKw:(TRIGGER __)
    ifKw:(if_not_exists __)?
    name:(table __)
    event:(trigger_event __)
    onKw:(ON __)
    table:(table __)
    eachKw:(FOR __ EACH __ ROW __)?
    when:(trigger_condition __)?
    body:trigger_body
    {
      return loc({
        type: "create_trigger_stmt",
        createKw: read(kw),
        temporaryKw: read(tmpKw),
        triggerKw: read(trigKw),
        ifNotExistsKw: read(ifKw),
        name: read(name),
        event: read(event),
        onKw: read(onKw),
        table: read(table),
        forEachRowKw: read(eachKw),
        condition: read(when),
        body,
      });
    }

trigger_event
  = timeKw:(trigger_time_kw __)? eventKw:(UPDATE __) ofKw:(OF __) cols:list$column {
      return loc({
        type: "trigger_event",
        timeKw: read(timeKw),
        eventKw: read(eventKw),
        ofKw: read(ofKw),
        columns: cols,
      });
    }
  / timeKw:(trigger_time_kw __)? eventKw:(DELETE / INSERT / UPDATE) {
      return loc({
        type: "trigger_event",
        timeKw: read(timeKw),
        eventKw: eventKw,
      });
    }

trigger_time_kw = kw:(BEFORE / AFTER / INSTEAD __ OF) { return read(kw); }

trigger_condition
  = kw:(WHEN __) e:expr {
    return loc({
      type: "trigger_condition",
      whenKw: read(kw),
      expr: e,
    });
  }

trigger_body
  = beginKw:(BEGIN __) program:trigger_program endKw:(__ END) {
    return loc({
      type: "code_block",
      beginKw: read(beginKw),
      program,
      endKw: read(endKw),
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
    trigger:table {
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
  = kw:(CREATE __ schema_kw __) ifKw:(if_not_exists __)? name:table options:(__ create_schema_option)* {
    return loc({
      type: "create_schema_stmt",
      createSchemaKw: read(kw),
      ifNotExistsKw: read(ifKw),
      name,
      options: options.map(read),
    });
  }

create_schema_option
  = x:bigquery_options &bigquery { return x; }
  / x:bigquery_option_default_collate &bigquery { return x; }

drop_schema_stmt
  = kw:(DROP __ schema_kw __) ifKw:(if_exists __)? name:table behaviorKw:(__ (CASCADE / RESTRICT))? {
    return loc({
      type: "drop_schema_stmt",
      dropSchemaKw: read(kw),
      ifExistsKw: read(ifKw),
      name,
      behaviorKw: read(behaviorKw)
    });
  }

alter_schema_stmt
  = kw:(ALTER __ schema_kw __) ifKw:(if_exists __)? name:table actions:(__ alter_schema_action)+ {
    return loc({
      type: "alter_schema_stmt",
      alterSchemaKw: read(kw),
      ifExistsKw: read(ifKw),
      name,
      actions: actions.map(read),
    });
  }

alter_schema_action
  = &bigquery ac:alter_action_set_options { return ac; }
  / &bigquery ac:alter_action_set_default_collate { return ac; }

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
  = kw:(CREATE __)
    orKw:(OR __ REPLACE __)?
    tempKw:((TEMPORARY / TEMP) __)?
    tableKw:(TABLE __)?
    funKw:(FUNCTION __)
    ifKw:(if_not_exists __)?
    name:(table __)
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

func_param
  = name:(ident __) type:data_type {
    return loc({
      type: "function_param",
      name: read(name),
      dataType: type,
    });
  }

create_function_clause
  = returns_clause
  / determinism_clause
  / language_clause
  / as_clause
  / with_connection_clause
  / bigquery_options

returns_clause
  = kw:(RETURNS __) type:data_type {
    return loc({
      type: "returns_clause",
      returnsKw: read(kw),
      dataType: type,
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

as_clause
  = kw:(AS __) expr:(paren$expr / literal_string / compound_select_stmt) {
    return loc({
      type: "as_clause",
      asKw: read(kw),
      expr,
    });
  }

with_connection_clause
  = kw:(REMOTE __ WITH __ CONNECTION __ / WITH __ CONNECTION __) name:table {
    return loc({
      type: "with_connection_clause",
      withConnectionKw: read(kw),
      connection: name,
    });
  }

drop_function_stmt
  = kw:(DROP __) tableKw:(TABLE __)? funKw:(FUNCTION __)
    ifKw:(if_exists __)? name:table {
      return loc({
        type: "drop_function_stmt",
        dropKw: read(kw),
        tableKw: read(tableKw),
        functionKw: read(funKw),
        ifExistsKw: read(ifKw),
        name,
      });
    }

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
    name:(table __)
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
  = mode:((INOUT / IN / OUT) __)? name:(ident __) type:data_type {
    return loc({
      type: "procedure_param",
      mode: read(mode),
      name: read(name),
      dataType: type,
    });
  }

create_procedure_clause
  = bigquery_options
  / procedure_body
  / with_connection_clause
  / language_clause
  / as_clause

procedure_body
  = beginKw:(BEGIN __) program:proc_program endKw:(__ END) {
    return loc({
      type: "code_block",
      beginKw: read(beginKw),
      program,
      endKw: read(endKw),
    });
  }

proc_program
  = head:proc_statement tail:(__ ";" __ (proc_statement / empty))+ {
    return loc({
      type: "program",
      statements: readCommaSepList(head, tail),
    });
  }

proc_statement
  = dml_statement
  / ddl_statement
  / bigquery_stmt;

drop_procedure_stmt
  = kw:(DROP __) procKw:(PROCEDURE __) ifKw:(if_exists __)? name:table {
    return loc({
      type: "drop_procedure_stmt",
      dropKw: read(kw),
      procedureKw: read(procKw),
      ifExistsKw: read(ifKw),
      name,
    });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * ANALYZE                                                                              *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
analyze_stmt
  = kw:ANALYZE tKw:(__ TABLE)? tables:(__ list$table)? {
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
transaction_stmt
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
  / &mysql kw:BEGIN tKw:(__ WORK)? {
    return loc({
      type: "start_transaction_stmt",
      startKw: kw,
      transactionKw: read(tKw),
    });
  }
  / &mysql kw:START tKw:(__ TRANSACTION) {
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
 * SQLite statements                                                                    *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
sqlite_stmt
  = attach_database_stmt
  / detach_database_stmt
  / vacuum_stmt
  / reindex_stmt
  / pragma_stmt
  / create_virtual_table_stmt

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
  = kw:(VACUUM __) schema:(ident __)? intoKw:(INTO __) file:literal_string {
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

reindex_stmt
  = kw:REINDEX table:(__ table)? {
    return loc({ type: "reindex_stmt", reindexKw: kw, table: read(table) });
  }

pragma_stmt
  = kw:(PRAGMA __) pragma:(pragma_assignment / pragma_func_call / table) {
    return loc({
      type: "pragma_stmt",
      pragmaKw: read(kw),
      pragma,
    });
  }

pragma_assignment
  = name:(table __) "=" value:(__ pragma_value) {
    return loc({
      type: "pragma_assignment",
      name: read(name),
      value: read(value),
    });
  }

pragma_func_call
  = name:(__ table) args:(__ paren$pragma_value) {
    return loc({
      type: "pragma_func_call",
      name: read(name),
      args: read(args),
    });
  }

pragma_value
  = kw:ident_name { return createKeyword(kw); }
  / literal

create_virtual_table_stmt
  = kw:(CREATE __ VIRTUAL __ TABLE __) ifKw:(if_not_exists __)? table:(table __)
    usingKw:(USING __) func:(func_call / ident) {
      return loc({
        type: "create_virtual_table_stmt",
        createVirtualTableKw: read(kw),
        ifNotExistsKw: read(ifKw),
        table: read(table),
        usingKw: read(usingKw),
        module: func.type === "identifier" ? { type: "func_call", name: func } : func,
      });
    }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * BigQuery statements                                                                  *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
bigquery_stmt
  = create_bigquery_entity_stmt
  / drop_bigquery_entity_stmt
  / create_row_access_policy_stmt
  / drop_row_access_policy_stmt
  / alter_organization_stmt
  / alter_project_stmt
  / alter_bi_capacity_stmt

// CREATE CAPACITY
// CREATE RESERVATION
// CREATE ASSIGNMENT
create_bigquery_entity_stmt
  = kw:(CREATE __ bigquery_entity __) name:(table __) asKw:(AS __) json:literal_json {
    const createKw = read(kw);
    const node = {
      createKw,
      name: read(name),
      asKw: read(asKw),
      json,
    };
    switch (createKw[1].name) {
      case "CAPACITY": return loc({ type: "create_capacity_stmt", ...node });
      case "RESERVATION": return loc({ type: "create_reservation_stmt", ...node });
      case "ASSIGNMENT": return loc({ type: "create_assignment_stmt", ...node });
    }
  }

// DROP CAPACITY
// DROP RESERVATION
// DROP ASSIGNMENT
drop_bigquery_entity_stmt
  = kw:(DROP __ bigquery_entity __) ifKw:(if_exists __)? name:table {
    const dropKw = read(kw);
    const node = {
      dropKw,
      ifExistsKw: read(ifKw),
      name,
    };
    switch (dropKw[1].name) {
      case "CAPACITY": return loc({ type: "drop_capacity_stmt", ...node });
      case "RESERVATION": return loc({ type: "drop_reservation_stmt", ...node });
      case "ASSIGNMENT": return loc({ type: "drop_assignment_stmt", ...node });
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
    table:(table __)
    grantTo:(row_access_policy_grant __)?
    filterKw:(FILTER __ USING __)
    filterExpr:paren$list$expr {
      return loc({
        type: "create_row_access_policy_stmt",
        createKw: read(kw),
        orReplaceKw: read(orKw),
        rowAccessPolicyKw: read(policyKw),
        ifNotExistsKw: read(ifKw),
        name: read(name),
        onKw: read(onKw),
        table: read(table),
        grantTo: read(grantTo),
        filterUsingKw: read(filterKw),
        filterExpr,
      });
    }

row_access_policy_grant
  = kw:(GRANT __ TO __) list:paren$list$literal_string {
    return loc({
      type: "row_access_policy_grant",
      grantToKw: read(kw),
      grantees: list,
    });
  }

drop_row_access_policy_stmt
  = kw:(DROP __)
    policyKw:(ROW __ ACCESS __ POLICY __)
    ifKw:(if_exists __)?
    name:(ident __)
    onKw:(ON __)
    table:table {
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
    table:table {
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
  = kw:(ALTER __ ORGANIZATION __) action:alter_action_set_options {
    return loc({
      type: "alter_organization_stmt",
      alterOrganizationKw: read(kw),
      actions: [action],
    });
  }

alter_project_stmt
  = kw:(ALTER __ PROJECT __) name:(ident __) action:alter_action_set_options {
    return loc({
      type: "alter_project_stmt",
      alterProjectKw: read(kw),
      name: read(name),
      actions: [action],
    });
  }

alter_bi_capacity_stmt
  = kw:(ALTER __ BI_CAPACITY __) name:(table __) action:alter_action_set_options {
    return loc({
      type: "alter_bi_capacity_stmt",
      alterBiCapacityKw: read(kw),
      name: read(name),
      actions: [action],
    });
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

mysql_table_opt_value
  = literal_string
  / literal_number
  / ident
  / DEFAULT
  / DYNAMIC / FIXED / COMPRESSED / REDUNDANT / COMPACT  // for ROW_FORMAT
  / NO / FIRST / LAST  // for INSERT_METHOD

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
    defer:(__ constraint_deferrable)? {
      if (!name && !defer) {
        return constraint;
      }
      return loc({
        type: "constraint",
        name: read(name),
        constraint,
        deferrable: read(defer),
      });
    }

table_constraint
  = name:(constraint_name __)?
    constraint:table_constraint_type
    defer:(__ constraint_deferrable)? {
      if (!name && !defer) {
        return constraint;
      }
      return loc({
        type: "constraint",
        name: read(name),
        constraint,
        deferrable: read(defer),
      });
    }

constraint_name
  = !bigquery kw:CONSTRAINT name:(__ ident)? {
    return loc({
      type: "constraint_name",
      constraintKw: kw,
      name: read(name),
    });
  }

constraint_deferrable
  = !bigquery kw:(DEFERRABLE / NOT __ DEFERRABLE)
    init:(__ initially_immediate_or_deferred)? {
      return loc({
        type: "constraint_deferrable",
        deferrableKw: read(kw),
        initiallyKw: read(init),
      });
    }

initially_immediate_or_deferred
  = kws:(INITIALLY __ (IMMEDIATE / DEFERRED)) { return read(kws); }

column_constraint_type
  = constraint_not_null
  / !bigquery con:constraint_null { return con; }
  / constraint_default
  / constraint_collate
  / !bigquery con:column_constraint_type_common { return con; }
  / &mysql con:column_constraint_type_mysql { return con; }
  / &bigquery con:bigquery_options { return con; }

column_constraint_type_common
  = column_constraint_primary_key
  / column_constraint_unique
  / references_specification
  / constraint_check
  / constraint_generated

column_constraint_type_mysql
  = column_constraint_index
  / constraint_auto_increment
  / constraint_comment
  / constraint_visible
  / constraint_column_format
  / constraint_storage
  / constraint_engine_attribute

constraint_not_null
  = kws:(NOT __ NULL) confl:(__ on_conflict_clause)? {
    return loc({
      type: "constraint_not_null",
      notNullKw: read(kws),
      onConflict: read(confl),
    });
  }

constraint_null
  = kw:NULL {
    return loc({ type: "constraint_null", nullKw: kw });
  }

constraint_default
  = kw:DEFAULT e:(__ (literal / paren$expr)) {
    return loc({ type: "constraint_default", defaultKw: kw, expr: read(e) });
  }

constraint_auto_increment
  = kw:AUTO_INCREMENT {
    return loc({ type: "constraint_auto_increment", autoIncrementKw: kw });
  }

constraint_comment
  = kw:COMMENT str:(__ literal_string) {
    return loc({
      type: "constraint_comment",
      commentKw: kw,
      value: read(str),
    });
  }

constraint_collate
  = kw:COLLATE id:(__ (ident / literal_string)) {
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
  = kw:(STORAGE __) t:(DISK / MEMORY) {
    return loc({
      type: "constraint_storage",
      storageKw: read(kw),
      typeKw: t,
    });
  }

constraint_engine_attribute
  = kw:(ENGINE_ATTRIBUTE / SECONDARY_ENGINE_ATTRIBUTE) eq:(__ "=")? v:(__ literal_string) {
    return loc({
      type: "constraint_engine_attribute",
      engineAttributeKw: eq ? trailing(kw, eq[0]) : kw,
      hasEq: !!eq,
      value: read(v),
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

table_constraint_type
  = table_constraint_primary_key
  / table_constraint_unique
  / constraint_foreign_key
  / constraint_check
  / &mysql con:table_constraint_index { return con; }

table_constraint_primary_key
  = kws:(PRIMARY __ KEY __)
    columns:paren$list$sort_specification
    confl:(__ on_conflict_clause)? {
      return loc({
        type: "constraint_primary_key",
        primaryKeyKw: read(kws),
        columns,
        onConflict: read(confl),
      });
    }

column_constraint_primary_key
  = kws:(PRIMARY __ KEY) confl:(__ on_conflict_clause)? {
      return loc({
        type: "constraint_primary_key",
        primaryKeyKw: read(kws),
        onConflict: read(confl),
      });
    }

table_constraint_unique
  = kws:(unique_key __)
    columns:paren$list$column
    confl:(__ on_conflict_clause)? {
      return loc({
        type: "constraint_unique",
        uniqueKw: read(kws),
        columns,
        onConflict: read(confl),
      });
    }

column_constraint_unique
  = kws:unique_key confl:(__ on_conflict_clause)? {
      return loc({
        type: "constraint_unique",
        uniqueKw: kws,
        onConflict: read(confl),
      });
    }

unique_key
  = kws:(UNIQUE __ (INDEX / KEY) / UNIQUE) {
    return read(kws);
  }

constraint_check
  = kw:CHECK expr:(__ paren$expr)
    ((__ NOT)? __ ENFORCED)?
    confl:(__ on_conflict_clause)? {
      return loc({
        type: "constraint_check",
        checkKw: kw,
        expr: read(expr),
        onConflict: read(confl),
      });
    }

constraint_foreign_key
  = kws:(FOREIGN __ KEY __)
    i:(ident __)?
    columns:paren$list$column
    ref:(__ references_specification) {
      return loc({
        type: "constraint_foreign_key",
        foreignKeyKw: read(kws),
        columns,
        references: read(ref),
      });
    }

references_specification
  = kw:(REFERENCES __)
    table:table
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
  = onKw:(ON __) eventKw:((UPDATE / DELETE) __) actionKw:reference_action_type {
    return loc({
      type: "referential_action",
      onKw: read(onKw),
      eventKw: read(eventKw),
      actionKw,
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

column_constraint_index
  = kw:KEY {
      return loc({
        type: "constraint_index",
        indexKw: kw,
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

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Data types                                                                           *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
data_type
  = kw:(type_name __) params:paren$list$literal {
    return loc({ type: "data_type", nameKw: read(kw), params });
  }
  / &bigquery type:(array_type / struct_type / table_type) {
    return type;
  }
  / kw:type_name {
    return loc({ type: "data_type", nameKw: kw });
  }

array_type
  = kw:ARRAY params:(__ generic_type_params)? {
    return loc({ type: "data_type", nameKw: read(kw), params: read(params) });
  }

struct_type
  = kw:STRUCT params:(__ generic_type_params)? {
    return loc({ type: "data_type", nameKw: read(kw), params: read(params) });
  }

table_type
  = kw:TABLE params:(__ generic_type_params) {
    return loc({ type: "data_type", nameKw: read(kw), params: read(params) });
  }

generic_type_params
  = "<" list:(__ list$name_and_type_pair __) ">" {
    return loc({
      type: "generic_type_params",
      params: read(list),
    });
  }

name_and_type_pair
  = expr1:ident expr2:(__ data_type) {
    return loc({ type: "pair_expr", expr1, expr2: read(expr2) });
  }
  / data_type

type_name
  = &bigquery t:type_name_bigquery { return t; }
  / &mysql t:type_name_mysql { return t; }
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

type_name_sqlite
  = head:sqlite_type_name_part tail:(__ sqlite_type_name_part)* {
    if (tail.length === 0) {
      return head;
    }
    return readSpaceSepList(head, tail);
  }

sqlite_type_name_part
  = name:ident_name !{ return isReservedKeyword(name); } {
    return loc(createKeyword(name));
  }

/**
 * Expressions
 *
 * Operator precedence, as implemented currently
 * ---------------------------------------------------------------------------------------------------
 * | OR, ||                                                   | disjunction                          |
 * | XOR                                                      | exclusive or                         |
 * | AND, &&                                                  | conjunction                          |
 * | NOT                                                      | logical negation                     |
 * | =, <, >, <=, >=, <>, !=, <=>, IS, LIKE, BETWEEN, IN      | comparion                            |
 * | |                                                        | bitwise or                           |
 * | &                                                        | bitwise and                          |
 * | >>, <<                                                   | bit shift                            |
 * | +, -                                                     | addition, subtraction                |
 * | *, /, %, DIV, MOD                                        | multiplication, division, modulo     |
 * | ^                                                        | bitwise XOR                          |
 * | ||, ->, ->>                                              | concatenation and JSON               |
 * | COLLATE                                                  | collation                            |
 * | -, ~, !                                                  | negation, bit inversion, logical not |
 * ---------------------------------------------------------------------------------------------------
 */

expr
  = or_expr

or_expr
  = head:xor_expr tail:(__ or_op __ xor_expr)* {
    return createBinaryExprChain(head, tail);
  }

or_op
  = OR
  / op:"||" & mysql { return op; }

xor_expr
  = &mysql head:and_expr tail:(__ XOR __ and_expr)* {
    return createBinaryExprChain(head, tail);
  }
  / and_expr

and_expr
  = head:not_expr tail:(__ and_op __ not_expr)* {
    return createBinaryExprChain(head, tail);
  }

and_op
  = AND
  / op:"&&" &mysql { return op; }

not_expr
  = kw:NOT expr:(__ not_expr) {
    return loc(createPrefixOpExpr(kw, read(expr)));
  }
  / comparison_expr

comparison_expr
  = left:bitwise_or_expr rightFn:_comparison_expr_right? {
    if (rightFn) {
      return loc(rightFn(left));
    } else {
      return left;
    }
  }

_comparison_expr_right
  = op:(__ unary_comparison_op) {
    return (expr: any) => createPostfixOpExpr(read(op), expr);
  }
  / tail:(__ comparison_op __ bitwise_or_expr)+ {
    return (head: any) => createBinaryExprChain(head, tail);
  }
  / c1:__ op:(NOT __ IN / IN) c2:__ right:(paren$list$expr / bitwise_or_expr) {
    return (left: any) => createBinaryExpr(left, c1, read(op), c2, right);
  }
  / c1:__ op:(NOT __ LIKE / LIKE) c2:__ right:escape_expr {
    return (left: any) => createBinaryExpr(left, c1, read(op), c2, right);
  }
  / betweenKw:(__ between_op) begin:(__ bitwise_or_expr) andKw:(__ AND) end:(__ bitwise_or_expr) {
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
  = kws:(NOT __ NULL / NOTNULL / ISNULL) &sqlite {
    return read(kws);
  }
  / kws:(IS __ UNKNOWN / IS __ NOT __ UNKNOWN) (&mysql / &bigquery) {
    return read(kws);
  }

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
  = kws:(IS __ NOT __ DISTINCT __ FROM) (&sqlite / &bigquery) { return read(kws); }
  / kws:(IS __ DISTINCT __ FROM) (&sqlite / &bigquery) { return read(kws); }
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
  = left:bitwise_or_expr c1:__ op:ESCAPE c2:__ right:literal_string {
    return loc(createBinaryExpr(left, c1, op, c2, right));
  }
  / bitwise_or_expr

between_op
  = kws:(NOT __ BETWEEN / BETWEEN) { return read(kws); }

bitwise_or_expr
  = head:bitwise_xor_expr tail:(__ "|"  __ bitwise_xor_expr)* {
    return createBinaryExprChain(head, tail);
  }

bitwise_xor_expr
  = &bigquery head:bitwise_and_expr tail:(__ "^"  __ bitwise_and_expr)* {
    return createBinaryExprChain(head, tail);
  }
  / bitwise_and_expr

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
  / concat_or_json_expr

concat_or_json_expr
  = head:collate_expr tail:(__ concat_or_json_op  __ collate_expr)* {
      return createBinaryExprChain(head, tail);
    }

concat_or_json_op
  = op:"||" &sqlite { return op; }
  / op:"->>" (&sqlite / &mysql) { return op; }
  / op:"->" (&sqlite / &mysql) { return op; }

collate_expr
  = (&mysql / &sqlite) left:negation_expr c1:__ op:COLLATE c2:__ right:ident {
    return loc(createBinaryExpr(left, c1, op, c2, right));
  }
  / negation_expr

negation_expr
  = op:negation_operator right:(__ negation_expr) {
    return loc(createPrefixOpExpr(op, read(right)));
  }
  / member_expr_or_func_call

negation_operator = "-" / "~" / "!"

member_expr_or_func_call
  = obj:primary props:(__ "." __ qualified_column / __ array_subscript &bigquery / __ func_call_right)+ {
    return createMemberExprChain(obj, props);
  }
  / name:func_name_kw fnRight:(__ func_call_right) {
    return loc(createFuncCall(name, fnRight));
  }
  / paren_less_func_call
  / primary

// Plain member_expr node chain, without function calls and array subscripts
member_expr
  = obj:ident props:(__ "." __ qualified_column)* {
    return createMemberExprChain(obj, props);
  }

array_subscript
  = "[" expr:(__ (array_subscript_specifier / expr) __) "]" {
    return loc({
      type: "array_subscript",
      expr: read(expr),
    });
  }

array_subscript_specifier
  = kw:(OFFSET / SAFE_OFFSET / ORDINAL / SAFE_ORDINAL) args:(__ paren$expr) {
    return loc({
      type: "array_subscript_specifier",
      specifierKw: kw,
      args: read(args),
    });
  }

primary
  = literal
  / &bigquery x:(typed_array_expr / typed_struct_expr) { return x; }
  / paren$expr
  / paren$compound_select_stmt
  / paren$list$expr
  / cast_expr
  / &sqlite e:raise_expr { return e; }
  / (&mysql / &bigquery) e:extract_expr { return e; }
  / case_expr
  / exists_expr
  / ident
  / (&mysql / &bigquery) e:interval_expr { return e; }
  / parameter

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
  = &bigquery kw:(FORMAT __) e:expr {
    return loc({
      type: "cast_format",
      formatKw: read(kw),
      string: e,
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
  = head:(IGNORE / ROLLBACK / ABORT / FAIL) tail:(__ "," __ literal_string)* {
    return loc(createListExpr(head, tail));
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

extract_unit_bigquery
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
  / week_expr
  / WEEK

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
  = &mysql kw:mysql_window_func_keyword {
    return loc(createIdentifier(kw.text, kw.text));
  }
  / &bigquery kw:bigquery_func_keyword {
    return loc(createIdentifier(kw.text, kw.text));
  }

// In MySQL, window functions are reserved keywords
mysql_window_func_keyword
  = CUME_DIST
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

bigquery_func_keyword
  = LEFT
  / RIGHT
  / ARRAY
  / COLLATE

paren_less_func_call
  = name:paren_less_func_name {
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
  ) {
    return loc(createIdentifier(kw.text, kw.text));
  }

paren_less_func_name_bigquery
  = kw:CURRENT_DATETIME &bigquery { return kw; }

paren_less_func_name_mysql
  = kw:(LOCALTIME / LOCALTIMESTAMP / CURRENT_USER) &mysql { return kw; }

func_args
  = distinctKw:(DISTINCT __)? args:func_args_list
    nulls:(__ (IGNORE / RESPECT) __ NULLS)?
    orderBy:(__ order_by_clause)?
    limit:(__ limit_clause)? {
    return loc({
      type: "func_args",
      distinctKw: read(distinctKw),
      args,
      nullHandlingKw: read(nulls),
      orderBy: read(orderBy),
      limit: read(limit),
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
func_1st_arg
  = star
  / named_arg
  / expr
  / compound_select_stmt

func_arg
  = named_arg
  / expr

named_arg
  = name:(ident __) "=>" value:(__ expr) &bigquery {
    return loc({
      type: "named_arg",
      name: read(name),
      value: read(value),
    });
  }

filter_arg
  = kw:(FILTER __) e:paren$where_clause &sqlite {
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
  = fromUnitKw:interval_unit toKw:(__ TO __) toUnitKw:interval_unit {
    return loc({
      type: "interval_unit_range",
      fromUnitKw,
      toKw: read(toKw),
      toUnitKw,
    });
  }

interval_unit
  = YEAR
  / MONTH
  / DAY
  / HOUR
  / MINUTE
  / SECOND
  / x:interval_unit_mysql &mysql { return x; }

interval_unit_mysql
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
    / "$" ident_name &{ return hasParamType("$name"); }
    / "@" ident_name &{ return hasParamType("@name"); }
  ) {
    return loc({ type: "parameter", text: text() });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Parenthesis and lists                                                                *
 *                                                                                      *
 * Code for these rules is generated by dollar-rules.ts plugin                          *
 * ------------------------------------------------------------------------------------ *
 */
paren$cast_arg = .
paren$compound_select_stmt = .
paren$empty_list = .
paren$expr = .
paren$extract_from = .
paren$func_args = .
paren$join_expr = .
paren$list$alias$column = .
paren$list$alias$expr = .
paren$list$alias$paren$list$column = .
paren$list$column = .
paren$list$create_definition = .
paren$list$equals_expr = .
paren$list$expr = .
paren$list$expr_or_default = .
paren$list$func_param = .
paren$list$literal = .
paren$list$literal_string = .
paren$list$procedure_param = .
paren$list$sort_specification = .
paren$pivot_for_in = .
paren$pragma_value = .
paren$raise_args = .
paren$tablesample_percent = .
paren$unpivot_for_in = .
paren$verbose_all_columns = .
paren$weekday_unit = .
paren$where_clause = .
paren$window_definition = .

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Lists                                                                                *
 *                                                                                      *
 * Code for these rules is generated by dollar-rules.ts plugin                          *
 * ------------------------------------------------------------------------------------ *
 */
list$alias$column = .
list$alias$expr = .
list$alias$func_call = .
list$alias$paren$list$column = .
list$alter_action = .
list$column = .
list$column_assignment = .
list$common_table_expression = .
list$create_definition = .
list$equals_expr = .
list$expr = .
list$expr_or_default = .
list$expr_or_explicit_alias = .
list$func_param = .
list$literal = .
list$literal_string = .
list$name_and_type_pair = .
list$named_window = .
list$procedure_param = .
list$sort_specification = .
list$table = .
list$table_or_alias = .
list$values_row = .

empty_list
  = &. {
    return loc({ type: "list_expr", items: [] });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Aliases                                                                              *
 *                                                                                      *
 * Code for these rules is generated by dollar-rules.ts plugin                          *
 * ------------------------------------------------------------------------------------ *
 */
alias$column = .
alias$expr = .
alias$func_call = .
alias$paren$compound_select_stmt = .
alias$paren$list$column = .
alias$table = .
alias$unnest_or_member_expr = .

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Table names                                                                          *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
table
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
alias_ident
  = ident
  / s:literal_plain_string { return loc(createIdentifier(s.text, s.value)); }

ident "identifier"
  = name:ident_name !{ return isReservedKeyword(name); } {
    return loc(createIdentifier(name, name));
  }
  / quoted_ident

quoted_ident
  = &sqlite ident:bracket_quoted_ident { return ident; }
  / (&sqlite / &mysql) ident:backticks_quoted_ident_qq { return ident; }
  / &bigquery ident:(bigquery_quoted_member_expr / backticks_quoted_ident_bs) { return ident; }
  / &sqlite str:literal_double_quoted_string_qq { return loc(createIdentifier(str.text, str.value)); }

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
  / ident_name_basic { return text(); }
  / (&mysql / &sqlite) digits ident_name_basic { return text(); }

ident_name_bigquery
  = ident_name_basic ("-" (ident_name_basic / digits))*

ident_name_basic
  = ident_start ident_part*

ident_start = [A-Za-z_]

ident_part  = [A-Za-z0-9_]

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Arrays and structs                                                                   *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
typed_array_expr
  = type:(array_type __) expr:array_expr {
    return loc({
      type: "typed_expr",
      dataType: read(type),
      expr,
    });
  }
  / array_expr

array_expr
  = "[" items:(__ (list$expr / empty_list) __) "]" {
    return loc({
      type: "array_expr",
      expr: read(items),
    });
  }

typed_struct_expr
  = type:(struct_type __) expr:struct_expr {
    return loc({
      type: "typed_expr",
      dataType: read(type),
      expr,
    });
  }
  / untyped_struct_expr

struct_expr
  = "(" expr:(__ list$expr_or_explicit_alias __) ")" {
    return loc({
      type: "struct_expr",
      expr: read(expr),
    });
  }

// untyped struct must have at least 2 elements in it
untyped_struct_expr
  = "(" expr:(__ e:list$expr __ &{ return e.items.length > 1; }) ")" {
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
  = literal_string
  / literal_number
  / literal_blob
  / literal_boolean
  / literal_null
  / literal_datetime
  / literal_json
  / literal_numeric

literal_null
  = kw:NULL {
    return loc({ type: "null", text: kw.text, value: null });
  }

literal_boolean
  = kw:TRUE {
    return loc({ type: "boolean", text: kw.text, value: true });
  }
  / kw:FALSE {
    return loc({ type: "boolean", text: kw.text, value: false });
  }

literal_string "string"
  = &mysql s:literal_string_mysql { return s; }
  / (&sqlite / &bigquery) s:literal_plain_string { return s; }

literal_string_mysql
  = literal_string_with_charset
  / literal_plain_string
  / literal_natural_charset_string

literal_string_with_charset // for MySQL only
  = charset:charset_introducer string:(__ literal_string_without_charset) {
    return loc({
      type: "string_with_charset",
      charset,
      string: read(string),
    });
  }

literal_string_without_charset // for MySQL only
  = literal_blob
  / literal_plain_string

// The most ordinary string type, without any prefixes
literal_plain_string
  = &bigquery s:(
      literal_triple_single_quoted_string
    / literal_triple_double_quoted_string
    / literal_single_quoted_string_bs
    / literal_double_quoted_string_bs
    / literal_raw_string) { return s; }
  / &sqlite s:literal_single_quoted_string_qq { return s; }
  / &mysql s:(
      literal_single_quoted_string_qq_bs
    / literal_double_quoted_string_qq_bs) { return s; }

charset_introducer
  = "_" cs:charset_name !ident_part { return cs; }

// these are sorted by length, so we try to match first the longest
charset_name
  = "armscii8"i
  / "macroman"i
  / "keybcs2"i
  / "utf8mb4"i
  / "utf16le"i
  / "geostd8"i
  / "eucjpms"i
  / "gb18030"i
  / "latin1"i
  / "latin2"i
  / "hebrew"i
  / "tis620"i
  / "gb2312"i
  / "cp1250"i
  / "latin5"i
  / "latin7"i
  / "cp1251"i
  / "cp1256"i
  / "cp1257"i
  / "binary"i
  / "cp850"i
  / "koi8r"i
  / "ascii"i
  / "euckr"i
  / "koi8u"i
  / "greek"i
  / "cp866"i
  / "macce"i
  / "cp852"i
  / "utf16"i
  / "utf32"i
  / "cp932"i
  / "big5"i
  / "dec8"i
  / "swe7"i
  / "ujis"i
  / "sjis"i
  / "utf8"i
  / "ucs2"i
  / "hp8"i
  / "gbk"i

literal_single_quoted_string_qq_bs // with repeated quote or backslash for escaping
  = "'" chars:([^'\\] / escaped_single_quote_qq / backslash_escape)* "'" {
    return loc({
      type: "string",
      text: text(),
      value: chars.join(""),
    });
  }

literal_single_quoted_string_bs // with backslash for escaping
  = "'" chars:([^'\\] / backslash_escape)* "'" {
    return loc({
      type: "string",
      text: text(),
      value: chars.join(""),
    });
  }

literal_single_quoted_string_qq // with repeated quote for escaping
  = "'" chars:([^'] / escaped_single_quote_qq)* "'" {
    return loc({
      type: "string",
      text: text(),
      value: chars.join(""),
    });
  }

escaped_single_quote_qq
  = "''" { return "'"; }

literal_double_quoted_string_qq // with repeated quote for escaping
  = "\"" chars:([^"] / escaped_double_quote_qq)* "\"" {
    return loc({
      type: "string",
      text: text(),
      value: chars.join(""),
    });
  }

escaped_double_quote_qq
  = '""' { return '"'; }

literal_double_quoted_string_qq_bs // with repeated quote or backslash for escaping
  = "\"" chars:([^"\\] / escaped_double_quote_qq / backslash_escape)* "\"" {
    return loc({
      type: "string",
      text: text(),
      value: chars.join(""),
    });
  }

literal_double_quoted_string_bs // with backslash for escaping
  = "\"" chars:([^"\\] / backslash_escape)* "\"" {
    return loc({
      type: "string",
      text: text(),
      value: chars.join(""),
    });
  }

literal_triple_single_quoted_string
  = "'''" chars:([^'\\] / single_quote_in_3quote / backslash_escape)* "'''" {
    return loc({
      type: "string",
      text: text(),
      value: chars.join(""),
    });
  }

single_quote_in_3quote
  = s:("''" / "'") !"'" { return s; }

literal_triple_double_quoted_string
  = '"""' chars:([^"\\] / double_quote_in_3quote / backslash_escape)* '"""' {
    return loc({
      type: "string",
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
  / "\\f" &bigquery { return "\f"; }
  / "\\v" &bigquery { return "\v"; }
  / "\\a" &bigquery { return "\x07"; /* BELL, ASCII code 7 */ }
  / "\\" oct:([0-7] [0-7] [0-7]) &bigquery {
    // 3-digit octal escape
    return String.fromCodePoint(parseInt(oct.join(""), 8));
  }
  / "\\" "x"i hex:(hex_digit hex_digit) &bigquery {
    // 2-digit unicode escape
    return String.fromCodePoint(parseInt(hex.join(""), 16));
  }
  / "\\" "u" hex:(hex_digit hex_digit hex_digit hex_digit) &bigquery {
    // 4-digit unicode escape
    return String.fromCodePoint(parseInt(hex.join(""), 16));
  }
  / "\\" "U" hex:(hex_digit hex_digit hex_digit hex_digit hex_digit hex_digit hex_digit hex_digit) &bigquery {
    // 8-digit unicode escape
    return String.fromCodePoint(parseInt(hex.join(""), 16));
  }
  / "\\%" &mysql { return "\\%"; }
  / "\\_" &mysql { return "\\_"; }
  / "\\0" &mysql { return "\0"; }
  / "\\Z" &mysql { return "\x1A"; /* Ctrl+Z (ASCII code 26 dec, 1A hex) */ }
  / "\\" c:. { return c; }

literal_natural_charset_string
  = "N"i str:literal_single_quoted_string_qq_bs {
    return loc({
      type: "string",
      text: text(),
      value: str.value,
    });
  }

literal_raw_string
  = "R"i cs:literal_raw_string_chars {
    return loc({
      type: "string",
      text: text(),
      value: cs.join(""),
    });
  }

literal_raw_byte_string
  = ("RB"i / "BR"i) cs:literal_raw_string_chars {
    return loc({
      type: "blob",
      text: text(),
      value: parseAsciiBlob(cs),
    });
  }

literal_raw_string_chars
  = "'''" cs:([^'] / single_quote_in_3quote)* "'''" { return cs; }
  / '"""' cs:([^"] / double_quote_in_3quote)* '"""' { return cs; }
  / "'" cs:[^']* "'" { return cs; }
  / '"' cs:[^"]* '"' { return cs; }

literal_byte_string
  = "B"i str:(
      literal_triple_double_quoted_string
    / literal_triple_single_quoted_string
    / literal_double_quoted_string_bs
    / literal_single_quoted_string_bs) {
      return loc({
        type: "blob",
        text: text(),
        value: parseAsciiBlob(str.value.split("")),
      });
    }

literal_datetime
  = kw:(TIME / DATE / TIMESTAMP / DATETIME)
    str:(__ literal_plain_string) {
      return loc({
        type: "datetime",
        kw,
        string: read(str)
      });
    }

literal_json
  = &bigquery kw:JSON str:(__ literal_plain_string) {
    return loc({
      type: "json",
      jsonKw: kw,
      string: read(str),
    });
  }

literal_numeric
  = &bigquery kw:(NUMERIC / BIGNUMERIC) str:(__ literal_plain_string) {
    return loc({
      type: "numeric",
      numericKw: kw,
      string: read(str),
    });
  }

literal_blob
  = literal_hex_blob
  / &mysql n:literal_bit_blob { return n; }
  / &mysql n:literal_hex_number_blob { return n; }
  / &bigquery n:literal_raw_byte_string { return n; }
  / &bigquery n:literal_byte_string { return n; }

literal_hex_blob
  = "X"i "'" chars:hex_digit* "'" {
    return loc({
      type: "blob",
      text: text(),
      value: parseHexBlob(chars.join("")),
    });
  }

literal_bit_blob
  = "b"i "'" chars:[01]* "'" {
    return loc({
      type: "blob",
      text: text(),
      value: parseBitBlob(chars.join("")),
    });
  }

literal_number "number"
  = literal_decimal_number
  / n:literal_hex_number (&sqlite / &bigquery) { return n; }

literal_hex_number
  = "0x" hex_digit+ {
    return loc({
      type: "number",
      text: text(),
      value: parseInt(text(), 16),
    });
  }

// The exact same syntax as above, but treated as blob
literal_hex_number_blob
  = "0x" chars:hex_digit+ {
    return loc({
      type: "blob",
      text: text(),
      value: parseHexBlob(chars.join("")),
    });
  }

literal_decimal_number
  = int frac? exp? !ident_start {
    return loc({
      type: "number",
      text: text(),
      value: parseFloat(text()),
    });
  }

int
  = digits
  / [+-] digits { return text(); }

frac
  = "." digits

exp
  = [eE] [+-]? digits

digits
  = [0-9]+ { return text(); }

hex_digit
  = [0-9a-fA-F]


// Optional whitespace (or comments)
__ "whitespace"
  = xs:(space / newline / comment)* {
    return xs.filter(isEnabledWhitespace);
  }

// Comments
comment
  = block_comment
  / line_comment
  / pound_sign_comment

block_comment
  = "/*" (!"*/" .)* "*/" {
    return {
      type: "block_comment",
      text: text(),
    };
  }

line_comment
  = "--" (!end_of_line .)* {
    return {
      type: "line_comment",
      text: text(),
    };
  }

pound_sign_comment
  = "#" (!end_of_line .)* {
    return {
      type: "line_comment",
      text: text(),
    };
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
mysql = &{ return isMysql(); }
sqlite = &{ return isSqlite(); }

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
ASSIGNMENT          = kw:"ASSIGNMENT"i          !ident_part { return loc(createKeyword(kw)); }
ATTACH              = kw:"ATTACH"i              !ident_part { return loc(createKeyword(kw)); }
AUTO_INCREMENT      = kw:"AUTO_INCREMENT"i      !ident_part { return loc(createKeyword(kw)); }
AUTOEXTEND_SIZE     = kw:"AUTOEXTEND_SIZE"i     !ident_part { return loc(createKeyword(kw)); }
AVG                 = kw:"AVG"i                 !ident_part { return loc(createKeyword(kw)); }
AVG_ROW_LENGTH      = kw:"AVG_ROW_LENGTH"i      !ident_part { return loc(createKeyword(kw)); }
BEFORE              = kw:"BEFORE"i              !ident_part { return loc(createKeyword(kw)); }
BEGIN               = kw:"BEGIN"i               !ident_part { return loc(createKeyword(kw)); }
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
BTREE               = kw:"BTREE"i               !ident_part { return loc(createKeyword(kw)); }
BY                  = kw:"BY"i                  !ident_part { return loc(createKeyword(kw)); }
BYTEINT             = kw:"BYTEINT"i             !ident_part { return loc(createKeyword(kw)); }
BYTES               = kw:"BYTES"i               !ident_part { return loc(createKeyword(kw)); }
CALL                = kw:"CALL"i                !ident_part { return loc(createKeyword(kw)); }
CAPACITY            = kw:"CAPACITY"i            !ident_part { return loc(createKeyword(kw)); }
CASCADE             = kw:"CASCADE"i             !ident_part { return loc(createKeyword(kw)); }
CASCADED            = kw:"CASCADED"i            !ident_part { return loc(createKeyword(kw)); }
CASE                = kw:"CASE"i                !ident_part { return loc(createKeyword(kw)); }
CAST                = kw:"CAST"i                !ident_part { return loc(createKeyword(kw)); }
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
COMMIT              = kw:"COMMIT"i              !ident_part { return loc(createKeyword(kw)); }
COMPACT             = kw:"COMPACT"i             !ident_part { return loc(createKeyword(kw)); }
COMPRESSED          = kw:"COMPRESSED"i          !ident_part { return loc(createKeyword(kw)); }
COMPRESSION         = kw:"COMPRESSION"i         !ident_part { return loc(createKeyword(kw)); }
CONFLICT            = kw:"CONFLICT"i            !ident_part { return loc(createKeyword(kw)); }
CONNECTION          = kw:"CONNECTION"i          !ident_part { return loc(createKeyword(kw)); }
CONSTRAINT          = kw:"CONSTRAINT"i          !ident_part { return loc(createKeyword(kw)); }
COPY                = kw:"COPY"i                !ident_part { return loc(createKeyword(kw)); }
COUNT               = kw:"COUNT"i               !ident_part { return loc(createKeyword(kw)); }
CREATE              = kw:"CREATE"i              !ident_part { return loc(createKeyword(kw)); }
CROSS               = kw:"CROSS"i               !ident_part { return loc(createKeyword(kw)); }
CUME_DIST           = kw:"CUME_DIST"i           !ident_part { return loc(createKeyword(kw)); }
CURRENT             = kw:"CURRENT"i             !ident_part { return loc(createKeyword(kw)); }
CURRENT_DATE        = kw:"CURRENT_DATE"i        !ident_part { return loc(createKeyword(kw)); }
CURRENT_DATETIME    = kw:"CURRENT_DATETIME"i    !ident_part { return loc(createKeyword(kw)); }
CURRENT_TIME        = kw:"CURRENT_TIME"i        !ident_part { return loc(createKeyword(kw)); }
CURRENT_TIMESTAMP   = kw:"CURRENT_TIMESTAMP"i   !ident_part { return loc(createKeyword(kw)); }
CURRENT_USER        = kw:"CURRENT_USER"i        !ident_part { return loc(createKeyword(kw)); }
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
DECIMAL             = kw:"DECIMAL"i             !ident_part { return loc(createKeyword(kw)); }
DEFAULT             = kw:"DEFAULT"i             !ident_part { return loc(createKeyword(kw)); }
DEFERRABLE          = kw:"DEFERRABLE"i          !ident_part { return loc(createKeyword(kw)); }
DEFERRED            = kw:"DEFERRED"i            !ident_part { return loc(createKeyword(kw)); }
DEFINER             = kw:"DEFINER"i             !ident_part { return loc(createKeyword(kw)); }
DELAY_KEY_WRITE     = kw:"DELAY_KEY_WRITE"i     !ident_part { return loc(createKeyword(kw)); }
DELAYED             = kw:"DELAYED"i             !ident_part { return loc(createKeyword(kw)); }
DELETE              = kw:"DELETE"i              !ident_part { return loc(createKeyword(kw)); }
DENSE_RANK          = kw:"DENSE_RANK"i          !ident_part { return loc(createKeyword(kw)); }
DESC                = kw:"DESC"i                !ident_part { return loc(createKeyword(kw)); }
DESCRIBE            = kw:"DESCRIBE"i            !ident_part { return loc(createKeyword(kw)); }
DETACH              = kw:"DETACH"i              !ident_part { return loc(createKeyword(kw)); }
DETERMINISTIC       = kw:"DETERMINISTIC"i       !ident_part { return loc(createKeyword(kw)); }
DIRECTORY           = kw:"DIRECTORY"i           !ident_part { return loc(createKeyword(kw)); }
DISK                = kw:"DISK"i                !ident_part { return loc(createKeyword(kw)); }
DISTINCT            = kw:"DISTINCT"i            !ident_part { return loc(createKeyword(kw)); }
DISTINCTROW         = kw:"DISTINCTROW"i         !ident_part { return loc(createKeyword(kw)); }
DIV                 = kw:"DIV"i                 !ident_part { return loc(createKeyword(kw)); }
DO                  = kw:"DO"i                  !ident_part { return loc(createKeyword(kw)); }
DOUBLE              = kw:"DOUBLE"i              !ident_part { return loc(createKeyword(kw)); }
DROP                = kw:"DROP"i                !ident_part { return loc(createKeyword(kw)); }
DUAL                = kw:"DUAL"i                !ident_part { return loc(createKeyword(kw)); }
DUMPFILE            = kw:"DUMPFILE"i            !ident_part { return loc(createKeyword(kw)); }
DUPLICATE           = kw:"DUPLICATE"i           !ident_part { return loc(createKeyword(kw)); }
DYNAMIC             = kw:"DYNAMIC"i             !ident_part { return loc(createKeyword(kw)); }
EACH                = kw:"EACH"i                !ident_part { return loc(createKeyword(kw)); }
ELSE                = kw:"ELSE"i                !ident_part { return loc(createKeyword(kw)); }
ENCRYPTION          = kw:"ENCRYPTION"i          !ident_part { return loc(createKeyword(kw)); }
END                 = kw:"END"i                 !ident_part { return loc(createKeyword(kw)); }
ENFORCED            = kw:"ENFORCED"i            !ident_part { return loc(createKeyword(kw)); }
ENGINE              = kw:"ENGINE"i              !ident_part { return loc(createKeyword(kw)); }
ENGINE_ATTRIBUTE    = kw:"ENGINE_ATTRIBUTE"i    !ident_part { return loc(createKeyword(kw)); }
ENUM                = kw:"ENUM"i                !ident_part { return loc(createKeyword(kw)); }
ESCAPE              = kw:"ESCAPE"i              !ident_part { return loc(createKeyword(kw)); }
EVENTS              = kw:"EVENTS"i              !ident_part { return loc(createKeyword(kw)); }
EXCEPT              = kw:"EXCEPT"i              !ident_part { return loc(createKeyword(kw)); }
EXCLUDE             = kw:"EXCLUDE"i             !ident_part { return loc(createKeyword(kw)); }
EXCLUSIVE           = kw:"EXCLUSIVE"i           !ident_part { return loc(createKeyword(kw)); }
EXISTS              = kw:"EXISTS"i              !ident_part { return loc(createKeyword(kw)); }
EXPANSION           = kw:"EXPANSION"i           !ident_part { return loc(createKeyword(kw)); }
EXPLAIN             = kw:"EXPLAIN"i             !ident_part { return loc(createKeyword(kw)); }
EXTERNAL            = kw:"EXTERNAL"i            !ident_part { return loc(createKeyword(kw)); }
EXTRACT             = kw:"EXTRACT"i             !ident_part { return loc(createKeyword(kw)); }
FAIL                = kw:"FAIL"i                !ident_part { return loc(createKeyword(kw)); }
FALSE               = kw:"FALSE"i               !ident_part { return loc(createKeyword(kw)); }
FILTER              = kw:"FILTER"i              !ident_part { return loc(createKeyword(kw)); }
FIRST               = kw:"FIRST"i               !ident_part { return loc(createKeyword(kw)); }
FIRST_VALUE         = kw:"FIRST_VALUE"i         !ident_part { return loc(createKeyword(kw)); }
FIXED               = kw:"FIXED"i               !ident_part { return loc(createKeyword(kw)); }
FLOAT               = kw:"FLOAT"i               !ident_part { return loc(createKeyword(kw)); }
FLOAT64             = kw:"FLOAT64"i             !ident_part { return loc(createKeyword(kw)); }
FOLLOWING           = kw:"FOLLOWING"i           !ident_part { return loc(createKeyword(kw)); }
FOR                 = kw:"FOR"i                 !ident_part { return loc(createKeyword(kw)); }
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
GROUPS              = kw:"GROUPS"i              !ident_part { return loc(createKeyword(kw)); }
HASH                = kw:"HASH"i                !ident_part { return loc(createKeyword(kw)); }
HAVING              = kw:"HAVING"i              !ident_part { return loc(createKeyword(kw)); }
HIGH_PRIORITY       = kw:"HIGH_PRIORITY"i       !ident_part { return loc(createKeyword(kw)); }
HOUR                = kw:"HOUR"i                !ident_part { return loc(createKeyword(kw)); }
HOUR_MICROSECOND    = kw:"HOUR_MICROSECOND"     !ident_part { return loc(createKeyword(kw)); }
HOUR_MINUTE         = kw:"HOUR_MINUTE"          !ident_part { return loc(createKeyword(kw)); }
HOUR_SECOND         = kw:"HOUR_SECOND"          !ident_part { return loc(createKeyword(kw)); }
IF                  = kw:"IF"i                  !ident_part { return loc(createKeyword(kw)); }
IGNORE              = kw:"IGNORE"i              !ident_part { return loc(createKeyword(kw)); }
IMMEDIATE           = kw:"IMMEDIATE"i           !ident_part { return loc(createKeyword(kw)); }
IN                  = kw:"IN"i                  !ident_part { return loc(createKeyword(kw)); }
INCLUDE             = kw:"INCLUDE"i             !ident_part { return loc(createKeyword(kw)); }
INDEX               = kw:"INDEX"i               !ident_part { return loc(createKeyword(kw)); }
INDEXED             = kw:"INDEXED"              !ident_part { return loc(createKeyword(kw)); }
INITIALLY           = kw:"INITIALLY"i           !ident_part { return loc(createKeyword(kw)); }
INNER               = kw:"INNER"i               !ident_part { return loc(createKeyword(kw)); }
INOUT               = kw:"INOUT"i               !ident_part { return loc(createKeyword(kw)); }
INPLACE             = kw:"INPLACE"i             !ident_part { return loc(createKeyword(kw)); }
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
ISOWEEK             = kw:"ISOWEEK"i             !ident_part { return loc(createKeyword(kw)); }
ISOYEAR             = kw:"ISOYEAR"i             !ident_part { return loc(createKeyword(kw)); }
JOIN                = kw:"JOIN"i                !ident_part { return loc(createKeyword(kw)); }
JSON                = kw:"JSON"i                !ident_part { return loc(createKeyword(kw)); }
KEY                 = kw:"KEY"i                 !ident_part { return loc(createKeyword(kw)); }
KEY_BLOCK_SIZE      = kw:"KEY_BLOCK_SIZE"i      !ident_part { return loc(createKeyword(kw)); }
LAG                 = kw:"LAG"i                 !ident_part { return loc(createKeyword(kw)); }
LANGUAGE            = kw:"LANGUAGE"i            !ident_part { return loc(createKeyword(kw)); }
LAST                = kw:"LAST"i                !ident_part { return loc(createKeyword(kw)); }
LAST_VALUE          = kw:"LAST_VALUE"i          !ident_part { return loc(createKeyword(kw)); }
LEAD                = kw:"LEAD"i                !ident_part { return loc(createKeyword(kw)); }
LEFT                = kw:"LEFT"i                !ident_part { return loc(createKeyword(kw)); }
LIKE                = kw:"LIKE"i                !ident_part { return loc(createKeyword(kw)); }
LIMIT               = kw:"LIMIT"i               !ident_part { return loc(createKeyword(kw)); }
LOCAL               = kw:"LOCAL"i               !ident_part { return loc(createKeyword(kw)); }
LOCALTIME           = kw:"LOCALTIME"i           !ident_part { return loc(createKeyword(kw)); }
LOCALTIMESTAMP      = kw:"LOCALTIMESTAMP"i      !ident_part { return loc(createKeyword(kw)); }
LOCK                = kw:"LOCK"i                !ident_part { return loc(createKeyword(kw)); }
LOCKED              = kw:"LOCKED"i              !ident_part { return loc(createKeyword(kw)); }
LOGS                = kw:"LOGS"i                !ident_part { return loc(createKeyword(kw)); }
LONGBLOB            = kw:"LONGBLOB"i            !ident_part { return loc(createKeyword(kw)); }
LONGTEXT            = kw:"LONGTEXT"i            !ident_part { return loc(createKeyword(kw)); }
LOW_PRIORITY        = kw:"LOW_PRIORITY"i        !ident_part { return loc(createKeyword(kw)); }
MASTER              = kw:"MASTER"i              !ident_part { return loc(createKeyword(kw)); }
MATCH               = kw:"MATCH"i               !ident_part { return loc(createKeyword(kw)); }
MATCHED             = kw:"MATCHED"i             !ident_part { return loc(createKeyword(kw)); }
MATERIALIZED        = kw:"MATERIALIZED"i        !ident_part { return loc(createKeyword(kw)); }
MAX                 = kw:"MAX"i                 !ident_part { return loc(createKeyword(kw)); }
MAX_ROWS            = kw:"MAX_ROWS"i            !ident_part { return loc(createKeyword(kw)); }
MEDIUMBLOB          = kw:"MEDIUMBLOB"i          !ident_part { return loc(createKeyword(kw)); }
MEDIUMINT           = kw:"MEDIUMINT"i           !ident_part { return loc(createKeyword(kw)); }
MEDIUMTEXT          = kw:"MEDIUMTEXT"i          !ident_part { return loc(createKeyword(kw)); }
MEMORY              = kw:"MEMORY"i              !ident_part { return loc(createKeyword(kw)); }
MERGE               = kw:"MERGE"i               !ident_part { return loc(createKeyword(kw)); }
MICROSECOND         = kw:"MICROSECOND"i         !ident_part { return loc(createKeyword(kw)); }
MILLISECOND         = kw:"MILLISECOND"i         !ident_part { return loc(createKeyword(kw)); }
MIN                 = kw:"MIN"i                 !ident_part { return loc(createKeyword(kw)); }
MIN_ROWS            = kw:"MIN_ROWS"i            !ident_part { return loc(createKeyword(kw)); }
MINUTE              = kw:"MINUTE"i              !ident_part { return loc(createKeyword(kw)); }
MINUTE_MICROSECOND  = kw:"MINUTE_MICROSECOND"   !ident_part { return loc(createKeyword(kw)); }
MINUTE_SECOND       = kw:"MINUTE_SECOND"        !ident_part { return loc(createKeyword(kw)); }
MOD                 = kw:"MOD"i                 !ident_part { return loc(createKeyword(kw)); }
MODE                = kw:"MODE"i                !ident_part { return loc(createKeyword(kw)); }
MONDAY              = kw:"MONDAY"i              !ident_part { return loc(createKeyword(kw)); }
MONTH               = kw:"MONTH"i               !ident_part { return loc(createKeyword(kw)); }
NATIVE              = kw:"NATIVE"i              !ident_part { return loc(createKeyword(kw)); }
NATURAL             = kw:"NATURAL"i             !ident_part { return loc(createKeyword(kw)); }
NCHAR               = kw:"NCHAR"i               !ident_part { return loc(createKeyword(kw)); }
NO                  = kw:"NO"i                  !ident_part { return loc(createKeyword(kw)); }
NOCHECK             = kw:"NOCHECK"i             !ident_part { return loc(createKeyword(kw)); }
NONE                = kw:"NONE"i                !ident_part { return loc(createKeyword(kw)); }
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
OFFSET              = kw:"OFFSET"i              !ident_part { return loc(createKeyword(kw)); }
ON                  = kw:"ON"i                  !ident_part { return loc(createKeyword(kw)); }
OPTION              = kw:"OPTION"i              !ident_part { return loc(createKeyword(kw)); }
OPTIONS             = kw:"OPTIONS"i             !ident_part { return loc(createKeyword(kw)); }
OR                  = kw:"OR"i                  !ident_part { return loc(createKeyword(kw)); }
ORDER               = kw:"ORDER"i               !ident_part { return loc(createKeyword(kw)); }
ORDINAL             = kw:"ORDINAL"i             !ident_part { return loc(createKeyword(kw)); }
ORGANIZATION        = kw:"ORGANIZATION"i        !ident_part { return loc(createKeyword(kw)); }
OTHERS              = kw:"OTHERS"i              !ident_part { return loc(createKeyword(kw)); }
OUT                 = kw:"OUT"i                 !ident_part { return loc(createKeyword(kw)); }
OUTER               = kw:"OUTER"i               !ident_part { return loc(createKeyword(kw)); }
OUTFILE             = kw:"OUTFILE"i             !ident_part { return loc(createKeyword(kw)); }
OVER                = kw:"OVER"i                !ident_part { return loc(createKeyword(kw)); }
PACK_KEYS           = kw:"PACK_KEYS"i           !ident_part { return loc(createKeyword(kw)); }
PARSER              = kw:"PARSER"i              !ident_part { return loc(createKeyword(kw)); }
PARTIAL             = kw:"PARTIAL"i             !ident_part { return loc(createKeyword(kw)); }
PARTITION           = kw:"PARTITION"i           !ident_part { return loc(createKeyword(kw)); }
PASSWORD            = kw:"PASSWORD"i            !ident_part { return loc(createKeyword(kw)); }
PERCENT             = kw:"PERCENT"i             !ident_part { return loc(createKeyword(kw)); }
PERCENT_RANK        = kw:"PERCENT_RANK"i        !ident_part { return loc(createKeyword(kw)); }
PERSIST             = kw:"PERSIST"i             !ident_part { return loc(createKeyword(kw)); }
PERSIST_ONLY        = kw:"PERSIST_ONLY"i        !ident_part { return loc(createKeyword(kw)); }
PIVOT               = kw:"PIVOT"i               !ident_part { return loc(createKeyword(kw)); }
PLAN                = kw:"PLAN"i                !ident_part { return loc(createKeyword(kw)); }
POLICIES            = kw:"POLICIES"i            !ident_part { return loc(createKeyword(kw)); }
POLICY              = kw:"POLICY"i              !ident_part { return loc(createKeyword(kw)); }
PRAGMA              = kw:"PRAGMA"i              !ident_part { return loc(createKeyword(kw)); }
PRECEDING           = kw:"PRECEDING"i           !ident_part { return loc(createKeyword(kw)); }
PRECISION           = kw:"PRECISION"i           !ident_part { return loc(createKeyword(kw)); }
PRIMARY             = kw:"PRIMARY"i             !ident_part { return loc(createKeyword(kw)); }
PROCEDURE           = kw:"PROCEDURE"i           !ident_part { return loc(createKeyword(kw)); }
PROJECT             = kw:"PROJECT"i             !ident_part { return loc(createKeyword(kw)); }
QUALIFY             = kw:"QUALIFY"i             !ident_part { return loc(createKeyword(kw)); }
QUARTER             = kw:"QUARTER"i             !ident_part { return loc(createKeyword(kw)); }
QUERY               = kw:"QUERY"i               !ident_part { return loc(createKeyword(kw)); }
RAISE               = kw:"RAISE"i               !ident_part { return loc(createKeyword(kw)); }
RANGE               = kw:"RANGE"i               !ident_part { return loc(createKeyword(kw)); }
RANK                = kw:"RANK"i                !ident_part { return loc(createKeyword(kw)); }
READ                = kw:"READ"i                !ident_part { return loc(createKeyword(kw)); }
REAL                = kw:"REAL"i                !ident_part { return loc(createKeyword(kw)); }
RECURSIVE           = kw:"RECURSIVE"            !ident_part { return loc(createKeyword(kw)); }
REDUNDANT           = kw:"REDUNDANT"i           !ident_part { return loc(createKeyword(kw)); }
REFERENCES          = kw:"REFERENCES"i          !ident_part { return loc(createKeyword(kw)); }
REGEXP              = kw:"REGEXP"i              !ident_part { return loc(createKeyword(kw)); }
REINDEX             = kw:"REINDEX"i             !ident_part { return loc(createKeyword(kw)); }
RELEASE             = kw:"RELEASE"i             !ident_part { return loc(createKeyword(kw)); }
REMOTE              = kw:"REMOTE"i              !ident_part { return loc(createKeyword(kw)); }
RENAME              = kw:"RENAME"i              !ident_part { return loc(createKeyword(kw)); }
REPLACE             = kw:"REPLACE"i             !ident_part { return loc(createKeyword(kw)); }
REPLICATION         = kw:"REPLICATION"i         !ident_part { return loc(createKeyword(kw)); }
RESERVATION         = kw:"RESERVATION"i         !ident_part { return loc(createKeyword(kw)); }
RESPECT             = kw:"RESPECT"i             !ident_part { return loc(createKeyword(kw)); }
RESTRICT            = kw:"RESTRICT"i            !ident_part { return loc(createKeyword(kw)); }
RETURN              = kw:"RETURN"i              !ident_part { return loc(createKeyword(kw)); }
RETURNING           = kw:"RETURNING"i           !ident_part { return loc(createKeyword(kw)); }
RETURNS             = kw:"RETURNS"i             !ident_part { return loc(createKeyword(kw)); }
RIGHT               = kw:"RIGHT"i               !ident_part { return loc(createKeyword(kw)); }
RLIKE               = kw:"RLIKE"i               !ident_part { return loc(createKeyword(kw)); }
ROLLBACK            = kw:"ROLLBACK"i            !ident_part { return loc(createKeyword(kw)); }
ROLLUP              = kw:"ROLLUP"i              !ident_part { return loc(createKeyword(kw)); }
ROW                 = kw:"ROW"i                 !ident_part { return loc(createKeyword(kw)); }
ROW_FORMAT          = kw:"ROW_FORMAT"i          !ident_part { return loc(createKeyword(kw)); }
ROW_NUMBER          = kw:"ROW_NUMBER"i          !ident_part { return loc(createKeyword(kw)); }
ROWID               = kw:"ROWID"i               !ident_part { return loc(createKeyword(kw)); }
ROWS                = kw:"ROWS"i                !ident_part { return loc(createKeyword(kw)); }
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
SESSION             = kw:"SESSION"i             !ident_part { return loc(createKeyword(kw)); }
SESSION_USER        = kw:"SESSION_USER"i        !ident_part { return loc(createKeyword(kw)); }
SET                 = kw:"SET"i                 !ident_part { return loc(createKeyword(kw)); }
SHARE               = kw:"SHARE"i               !ident_part { return loc(createKeyword(kw)); }
SHARED              = kw:"SHARED"i              !ident_part { return loc(createKeyword(kw)); }
SHOW                = kw:"SHOW"i                !ident_part { return loc(createKeyword(kw)); }
SIGNED              = kw:"SIGNED"i              !ident_part { return loc(createKeyword(kw)); }
SIMPLE              = kw:"SIMPLE"i              !ident_part { return loc(createKeyword(kw)); }
SKIP                = kw:"SKIP"i                !ident_part { return loc(createKeyword(kw)); }
SMALLINT            = kw:"SMALLINT"i            !ident_part { return loc(createKeyword(kw)); }
SNAPSHOT            = kw:"SNAPSHOT"i            !ident_part { return loc(createKeyword(kw)); }
SOURCE              = kw:"SOURCE"i              !ident_part { return loc(createKeyword(kw)); }
SPATIAL             = kw:"SPATIAL"i             !ident_part { return loc(createKeyword(kw)); }
SQL                 = kw:"SQL"i                 !ident_part { return loc(createKeyword(kw)); }
SQL_BIG_RESULT      = kw:"SQL_BIG_RESULT"i      !ident_part { return loc(createKeyword(kw)); }
SQL_BUFFER_RESULT   = kw:"SQL_BUFFER_RESULT"i   !ident_part { return loc(createKeyword(kw)); }
SQL_CACHE           = kw:"SQL_CACHE"i           !ident_part { return loc(createKeyword(kw)); }
SQL_CALC_FOUND_ROWS = kw:"SQL_CALC_FOUND_ROWS"i !ident_part { return loc(createKeyword(kw)); }
SQL_NO_CACHE        = kw:"SQL_NO_CACHE"i        !ident_part { return loc(createKeyword(kw)); }
SQL_SMALL_RESULT    = kw:"SQL_SMALL_RESULT"i    !ident_part { return loc(createKeyword(kw)); }
START               = kw:"START"i               !ident_part { return loc(createKeyword(kw)); }
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
SYSTEM              = kw:"SYSTEM"i              !ident_part { return loc(createKeyword(kw)); }
SYSTEM_USER         = kw:"SYSTEM_USER"i         !ident_part { return loc(createKeyword(kw)); }
TABLE               = kw:"TABLE"i               !ident_part { return loc(createKeyword(kw)); }
TABLES              = kw:"TABLES"i              !ident_part { return loc(createKeyword(kw)); }
TABLESAMPLE         = kw:"TABLESAMPLE"i         !ident_part { return loc(createKeyword(kw)); }
TARGET              = kw:"TARGET"i              !ident_part { return loc(createKeyword(kw)); }
TEMP                = kw:"TEMP"i                !ident_part { return loc(createKeyword(kw)); }
TEMPORARY           = kw:"TEMPORARY"i           !ident_part { return loc(createKeyword(kw)); }
TEMPTABLE           = kw:"TEMPTABLE"i           !ident_part { return loc(createKeyword(kw)); }
TEXT                = kw:"TEXT"i                !ident_part { return loc(createKeyword(kw)); }
THEN                = kw:"THEN"i                !ident_part { return loc(createKeyword(kw)); }
THURSDAY            = kw:"THURSDAY"i            !ident_part { return loc(createKeyword(kw)); }
TIES                = kw:"TIES"i                !ident_part { return loc(createKeyword(kw)); }
TIME                = kw:"TIME"i                !ident_part { return loc(createKeyword(kw)); }
TIMESTAMP           = kw:"TIMESTAMP"i           !ident_part { return loc(createKeyword(kw)); }
TINYBLOB            = kw:"TINYBLOB"i            !ident_part { return loc(createKeyword(kw)); }
TINYINT             = kw:"TINYINT"i             !ident_part { return loc(createKeyword(kw)); }
TINYTEXT            = kw:"TINYTEXT"i            !ident_part { return loc(createKeyword(kw)); }
TO                  = kw:"TO"i                  !ident_part { return loc(createKeyword(kw)); }
TRANSACTION         = kw:"TRANSACTION"i         !ident_part { return loc(createKeyword(kw)); }
TRIGGER             = kw:"TRIGGER"i             !ident_part { return loc(createKeyword(kw)); }
TRUE                = kw:"TRUE"i                !ident_part { return loc(createKeyword(kw)); }
TRUNCATE            = kw:"TRUNCATE"i            !ident_part { return loc(createKeyword(kw)); }
TUESDAY             = kw:"TUESDAY"i             !ident_part { return loc(createKeyword(kw)); }
TYPE                = kw:"TYPE"i                !ident_part { return loc(createKeyword(kw)); }
UNBOUNDED           = kw:"UNBOUNDED"i           !ident_part { return loc(createKeyword(kw)); }
UNDEFINED           = kw:"UNDEFINED"i           !ident_part { return loc(createKeyword(kw)); }
UNION               = kw:"UNION"i               !ident_part { return loc(createKeyword(kw)); }
UNIQUE              = kw:"UNIQUE"i              !ident_part { return loc(createKeyword(kw)); }
UNKNOWN             = kw:"UNKNOWN"i             !ident_part { return loc(createKeyword(kw)); }
UNLOCK              = kw:"UNLOCK"i              !ident_part { return loc(createKeyword(kw)); }
UNNEST              = kw:"UNNEST"i              !ident_part { return loc(createKeyword(kw)); }
UNPIVOT             = kw:"UNPIVOT"              !ident_part { return loc(createKeyword(kw)); }
UNSIGNED            = kw:"UNSIGNED"i            !ident_part { return loc(createKeyword(kw)); }
UPDATE              = kw:"UPDATE"i              !ident_part { return loc(createKeyword(kw)); }
USE                 = kw:"USE"i                 !ident_part { return loc(createKeyword(kw)); }
USER                = kw:"USER"i                !ident_part { return loc(createKeyword(kw)); }
USING               = kw:"USING"i               !ident_part { return loc(createKeyword(kw)); }
VACUUM              = kw:"VACUUM"i              !ident_part { return loc(createKeyword(kw)); }
VALUE               = kw:"VALUE"i               !ident_part { return loc(createKeyword(kw)); }
VALUES              = kw:"VALUES"i              !ident_part { return loc(createKeyword(kw)); }
VARBINARY           = kw:"VARBINARY"i           !ident_part { return loc(createKeyword(kw)); }
VARCHAR             = kw:"VARCHAR"i             !ident_part { return loc(createKeyword(kw)); }
VARYING             = kw:"VARYING"i             !ident_part { return loc(createKeyword(kw)); }
VIEW                = kw:"VIEW"i                !ident_part { return loc(createKeyword(kw)); }
VIRTUAL             = kw:"VIRTUAL"i             !ident_part { return loc(createKeyword(kw)); }
VISIBLE             = kw:"VISIBLE"i             !ident_part { return loc(createKeyword(kw)); }
WAIT                = kw:"WAIT"i                !ident_part { return loc(createKeyword(kw)); }
WEDNESDAY           = kw:"WEDNESDAY"i           !ident_part { return loc(createKeyword(kw)); }
WEEK                = kw:"WEEK"i                !ident_part { return loc(createKeyword(kw)); }
WHEN                = kw:"WHEN"i                !ident_part { return loc(createKeyword(kw)); }
WHERE               = kw:"WHERE"i               !ident_part { return loc(createKeyword(kw)); }
WINDOW              = kw:"WINDOW"i              !ident_part { return loc(createKeyword(kw)); }
WITH                = kw:"WITH"i                !ident_part { return loc(createKeyword(kw)); }
WITHOUT             = kw:"WITHOUT"i             !ident_part { return loc(createKeyword(kw)); }
WORK                = kw:"WORK"i                !ident_part { return loc(createKeyword(kw)); }
WRITE               = kw:"WRITE"i               !ident_part { return loc(createKeyword(kw)); }
XOR                 = kw:"XOR"i                 !ident_part { return loc(createKeyword(kw)); }
YEAR                = kw:"YEAR"i                !ident_part { return loc(createKeyword(kw)); }
YEAR_MONTH          = kw:"YEAR_MONTH"           !ident_part { return loc(createKeyword(kw)); }
ZEROFILL            = kw:"ZEROFILL"i            !ident_part { return loc(createKeyword(kw)); }
/*! keywords:end */
