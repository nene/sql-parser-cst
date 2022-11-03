{
  /** Identity function */
  const identity = (x) => x;

  /** Last item in array */
  const last = (arr) => arr[arr.length-1];

  /** Creates new array with first item replaced by value */
  const setFirst = ([oldFirst, ...rest], value) => {
    return [value, ...rest];
  };

  /** Creates new array with last item replaced by value */
  const setLast = (array, value) => {
    const rest = array.slice(0, -1);
    return [...rest, value];
  };

  /** Attaches optional leading whitespace to AST node, or to array of AST nodes (to the first in array) */
  const leading = (node, ws) => {
    if (node instanceof Array) {
      // Add leading whitespace to first item in array
      return setFirst(node, leading(node[0], ws));
    }
    if (typeof node !== "object") {
      throw new Error(`Expected Node object, instead got ${JSON.stringify(node)}`);
    }
    if (ws && ws.length) {
      if (node.leading) {
        throw new Error("leading(): Node already has leading whitespace");
      }
      return {...node, leading: ws};
    }
    return node;
  };

  /** Attaches optional trailing whitespace to AST node, or to array of AST nodes (to the last in array) */
  const trailing = (node, ws) => {
    if (node instanceof Array) {
      // Add trailing whitespace to last item in array
      return setLast(node, trailing(last(node), ws));
    }
    if (typeof node !== "object") {
      throw new Error(`Expected Node object, instead got ${JSON.stringify(node)}`);
    }
    if (ws && ws.length) {
      if (node.trailing) {
        throw new Error("trailing(): Node already has trailing whitespace");
      }
      return {...node, trailing: ws};
    }
    return node;
  };

  // Shorthand for attaching both trailing or leading whitespace
  const surrounding = (leadingWs, node, trailingWs) =>
    trailing(leading(node, leadingWs), trailingWs);

  const loc = (node) => {
    if (!options.includeRange) {
      return node;
    }
    const {start, end} = range();
    return { ...node, range: [start, end] };
  };

  const deriveLoc = (binExpr) => {
    if (!options.includeRange) {
      return binExpr;
    }
    const start = binExpr.left.range[0];
    const end = binExpr.right.range[1];
    return { ...binExpr, range: [start, end] };
  }

  function createBinaryExprChain(head, tail, type = "binary_expr") {
    return tail.reduce(
      (left, [c1, op, c2, right]) => deriveLoc(createBinaryExpr(left, c1, op, c2, right, type)),
      head
    );
  }

  function createBinaryExpr(left, c1, op, c2, right, type = "binary_expr") {
    return {
      type,
      operator: op,
      left: trailing(left, c1),
      right: leading(right, c2),
    };
  }

  function createPrefixOpExpr(op, expr) {
    return {
      type: "prefix_op_expr",
      operator: op,
      expr: expr,
    };
  }

  function createPostfixOpExpr(op, expr) {
    return {
      type: "postfix_op_expr",
      expr: expr,
      operator: op,
    };
  }

  const createKeyword = (text) => ({ type: "keyword", text });

  const whitespaceType = {
    "space": true,
    "newline": true,
    "line_comment": true,
    "block_comment": true,
  };

  // True when dealing with whitespace array (as returned by __ rule)
  const isWhitespace = (item) => {
    if (!(item instanceof Array)) {
      return false;
    }
    if (item.length === 0) {
      return true;
    }
    return Boolean(whitespaceType[item[0].type]);
  }

  /**
   * Given array of syntax nodes and whitespace or single node or null,
   * associates whitespace with syntax nodes.
   *
   * @param {(Node | Whitespace)[] | Node | null} items
   * @return {Node[] | Node | undefined}
   */
  const read = (items) => {
    if (!items) {
      return undefined; // convert null to undefined
    }
    if (!(items instanceof Array)) {
      return items; // leave single syntax node as-is
    }

    // associate leading/trailing whitespace with nodes
    const nodes = [];
    let leadingWhitespace = undefined;
    for (const it of items) {
      if (isWhitespace(it)) {
        if (nodes.length > 0) {
          nodes[nodes.length - 1] = trailing(nodes[nodes.length - 1], it);
        } else {
          leadingWhitespace = it;
        }
      } else {
        if (leadingWhitespace) {
          nodes.push(leading(it, leadingWhitespace));
          leadingWhitespace = undefined;
        } else {
          nodes.push(it);
        }
      }
    }
    return nodes.length > 1 ? nodes : nodes[0];
  };

  const readCommaSepList = (head, tail) => {
    const items = [head];
    for (const [c1, comma, c2, expr] of tail) {
      const lastIdx = items.length - 1;
      items[lastIdx] = trailing(items[lastIdx], c1);
      items.push(leading(expr, c2));
    }
    return items;
  };

  const readSpaceSepList = (head, tail) => {
    const items = [head];
    for (const [c, expr] of tail) {
      items.push(leading(expr, c));
    }
    return items;
  };

  const createIdentifier = (text) => ({ type: "identifier", text });

  const createAlias = (expr, _alias) => {
    if (!_alias) {
      return expr;
    }
    const [c, partialAlias] = _alias;
    return {
      type: "alias",
      expr: trailing(expr, c),
      ...partialAlias,
    };
  }

  const createParenExpr = (c1, expr, c2) => {
    return {
      type: "paren_expr",
      expr: surrounding(c1, expr, c2),
    };
  }

  const createExprList = (head, tail) => {
    return {
      type: "expr_list",
      items: readCommaSepList(head, tail),
    };
  }
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
  = statement_standard

statement_standard
  = compound_select_stmt
  / insert_stmt
  / update_stmt
  / delete_stmt
  / create_view_stmt
  / drop_view_stmt
  / create_index_stmt
  / drop_index_stmt
  / create_table_stmt
  / drop_table_stmt
  / alter_table_stmt
  / create_trigger_stmt
  / drop_trigger_stmt
  / analyze_stmt
  / explain_stmt
  / transaction_stmt

statement$sqlite
  = statement_standard
  / sqlite_stmt
  / empty_stmt

statement$mysql
  = statement_standard
  / create_db_stmt
  / empty_stmt

empty_stmt
  = c:__ {
    return trailing(loc({ type: "empty_stmt" }), c);
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
    return createBinaryExprChain(head, tail, "compound_select_stmt");
  }

compound_op
  = kws:((UNION / EXCEPT) __ (ALL / DISTINCT)) { return read(kws); }
  / UNION
  / EXCEPT

intersect_select_stmt
  = head:sub_select tail:(__ intersect_op __ sub_select)* {
    return createBinaryExprChain(head, tail, "compound_select_stmt");
  }

sub_select
  = select_stmt
  / paren_expr_select

intersect_op
  = kws:(INTERSECT __ (ALL / DISTINCT)) { return read(kws); }
  / INTERSECT

select_stmt
  = cte:(with_clause __)?
    select:(__ select_clause)
    otherClauses:(__ other_clause)* {
      return loc({
        type: "select_stmt",
        clauses: [read(cte), read(select), ...otherClauses.map(read)].filter(identity),
      });
  }

/**
 * SELECT .. WITH
 * --------------------------------------------------------------------------------------
 */
with_clause
  = withKw:WITH
    recursiveKw:(__ RECURSIVE)?
    tables:(__ common_table_expression_list) {
      return loc({
        type: "with_clause",
        withKw,
        recursiveKw: read(recursiveKw),
        tables: read(tables),
      });
    }

common_table_expression_list
  = head:common_table_expression tail:(__ "," __ common_table_expression)* {
    return loc(createExprList(head, tail));
  }

common_table_expression
  = table:ident
    columns:(__ paren_plain_column_ref_list)?
    asKw:(__ AS)
    opt:(__ cte_option)?
    select:(__ paren_expr_select) {
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
  / locking_read
  / window_clause
  / into_clause

/**
 * SELECT .. columns
 * --------------------------------------------------------------------------------------
 */
select_clause
  = selectKw:SELECT
    options:(__ select_option)*
    columns:(__ select_columns) {
      return loc({
        type: "select_clause",
        selectKw,
        options: options.map(read),
        columns: read(columns),
      });
    }

select_option
  = ALL
  / DISTINCT

select_option$mysql
  = ALL
  / DISTINCT
  / DISTINCTROW
  / HIGH_PRIORITY
  / STRAIGHT_JOIN
  / SQL_CALC_FOUND_ROWS
  / SQL_CACHE
  / SQL_NO_CACHE
  / SQL_BIG_RESULT
  / SQL_SMALL_RESULT
  / SQL_BUFFER_RESULT

select_columns
  = head:column_list_item tail:(__ "," __ column_list_item)* {
      return loc(createExprList(head, tail));
    }

column_list_item
  = star:star {
    return loc({
      type: "column_ref",
      column: star,
    });
  }
  / table:(ident __) "." star:(__ star) {
    return loc({
      type: "column_ref",
      table: read(table),
      column: read(star),
    });
  }
  / expr:expr alias:(__ alias)? {
    return loc(createAlias(expr, alias));
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

implicit_alias
  = id:alias_ident {
    return { alias: id };
  }

/**
 * SELECT .. INTO
 * --------------------------------------------------------------------------------------
 */
into_clause
  = INTO __ k:(OUTFILE / DUMPFILE)? __ f:(literal_string / ident) {
    return "[Not implemented]";
  }

/**
 * SELECT .. FROM
 * --------------------------------------------------------------------------------------
 */
from_clause
  = kw:(FROM __) tables:table_join_list {
    return loc({
      type: "from_clause",
      fromKw: read(kw),
      tables,
    });
  }

table_to_list
  = head:table_to_item tail:(__ "," __ table_to_item)* {
    return "[Not implemented]";
  }

table_to_item
  = head:table_ref __ TO __ tail: (table_ref) {
    return "[Not implemented]";
  }

index_type
  = USING __
  t:(BTREE / HASH) {
    return "[Not implemented]";
  }

index_options
  = head:index_option tail:(__ index_option)* {
    return "[Not implemented]";
  }

index_option
  = k:KEY_BLOCK_SIZE __ e:("=")? __ kbs:literal_number {
    return "[Not implemented]";
  }
  / index_type
  / WITH __ PARSER __ pn:ident_name {
    return "[Not implemented]";
  }
  / k:(VISIBLE / INVISIBLE) {
    return "[Not implemented]";
  }
  / constraint_comment

table_join_list
  = head:table_base tail:_table_join* {
    return [head, ...tail];
  }

_table_join
  = join:(__ table_join) {
    return read(join);
  }

table_join
  = "," table:(__ table_base) {
    return loc({
      type: "join",
      operator: ",",
      table: read(table),
    });
  }
  / op:join_op t:(__ table_base) spec:(__ join_specification)? {
    return loc({
      type: "join",
      operator: op,
      table: read(t),
      specification: read(spec),
    });
  }

//NOTE that, the table assigned to `var` shouldn't write in `table_join`
table_base
  = DUAL {
    return "[Not implemented]";
  }
  / table_ref_or_alias
  / t:table_in_parens alias:(__ alias)? {
    return loc(createAlias(t, alias));
  }
  / stmt:values_clause __ alias:alias? {
    return "[Not implemented]";
  }
  / "(" __ stmt:values_clause __ ")" __ alias:alias? {
    return "[Not implemented]";
  }
  / t:paren_expr_select alias:(__ alias)? {
    return loc(createAlias(t, alias));
  }

table_ref_or_alias
  = t:table_ref alias:(__ alias)? {
    return loc(createAlias(t, alias));
  }

table_in_parens
  = "(" c1:__ t:table_ref c2:__ ")" {
    return loc(createParenExpr(c1, t, c2));
  }

join_op
  = natural_join
  / cross_join
  / join_type

join_op$mysql
  = natural_join
  / cross_join
  / join_type
  / STRAIGHT_JOIN

natural_join
  = kw:(NATURAL __) jt:join_type {
    return [read(kw), ...(jt instanceof Array ? jt : [jt])];
  }

cross_join
  = kws:(CROSS __ JOIN) { return read(kws); }

join_type
  = kws:(
      (LEFT / RIGHT / FULL) __ OUTER __ JOIN
    / (LEFT / RIGHT / FULL) __ JOIN
    / INNER __ JOIN
    / JOIN
  ) { return read(kws); }

join_type$mysql
  = kws:(
      (LEFT / RIGHT) __ OUTER __ JOIN
    / (LEFT / RIGHT) __ JOIN
    / INNER __ JOIN
    / JOIN
  ) { return read(kws); }

join_specification
  = using_clause / on_clause

using_clause
  = kw:USING expr:(__ paren_plain_column_ref_list) {
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
  = kws:(GROUP __ BY __) list:expr_list {
    return loc({
      type: "group_by_clause",
      groupByKw: read(kws),
      columns: list,
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
  = kws:(PARTITION __ BY __) list:expr_list {
    return loc({
      type: "partition_by_clause",
      partitionByKw: read(kws),
      specifications: list,
    });
  }

/**
 * SELECT .. ORDER BY
 * --------------------------------------------------------------------------------------
 */
order_by_clause
  = kws:(ORDER __ BY __) l:sort_specification_list rolKw:(__ WITH __ ROLLUP)? {
    return loc({
      type: "order_by_clause",
      orderByKw: read(kws),
      specifications: l,
      withRollupKw: read(rolKw),
    });
  }

sort_specification_list
  = head:sort_specification tail:(__ "," __ sort_specification)* {
    return loc(createExprList(head, tail));
  }

sort_specification
  = e:expr orderKw:(__ (DESC / ASC))? {
    return loc({
      type: "sort_specification",
      expr: e,
      orderKw: read(orderKw),
    });
  }

sort_specification$sqlite
  = e:expr orderKw:(__ (DESC / ASC))? nullsKw:(__ NULLS __ (FIRST / LAST))? {
    return loc({
      type: "sort_specification",
      expr: read(e),
      orderKw: read(orderKw),
      ...(nullsKw ? {nullHandlingKw: read(nullsKw)} : {}),
    });
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
  = kw:(WINDOW __) wins:named_window_list {
    return loc({
      type: "window_clause",
      windowKw: read(kw),
      namedWindows: wins,
    });
  }

named_window_list
  = head:named_window tail:(__ "," __ named_window)* {
    return readCommaSepList(head, tail);
  }

named_window
  = name:(ident __) kw:(AS __) def:window_definition_in_parens {
    return loc({
      type: "named_window",
      name: read(name),
      asKw: read(kw),
      window: def,
    });
  }

window_definition_in_parens
  = "(" c1:__ win:window_definition c2:__ ")" {
    return loc(createParenExpr(c1, win, c2));
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
  = ROWS / RANGE

frame_unit$sqlite
  = ROWS / RANGE / GROUPS

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
 * SELECT .. FOR UPDATE
 * SELECT .. LOCK IN SHARE MODE
 * --------------------------------------------------------------------------------------
 */
locking_read
  = t:(for_update / lock_in_share_mode) __ lo:lock_option? {
    return "[Not implemented]";
  }

for_update
  = fu:(FOR __ UPDATE) {
    return "[Not implemented]";
  }

lock_in_share_mode
  = m:(LOCK __ IN __ SHARE __ MODE) {
    return "[Not implemented]";
  }

lock_option
  = w:(WAIT __ literal_number) { return "[Not implemented]"; }
  / nw:NOWAIT
  / sl:(SKIP __ LOCKED) { return "[Not implemented]"; }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * INSERT INTO                                                                          *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
insert_stmt
  = insertKw:(INSERT / REPLACE)
    options:(__ insert_options)?
    intoKw:(__ INTO)?
    table:(__ table_ref_or_explicit_alias)
    columns:(__ paren_plain_column_ref_list)?
    source:(__ insert_source) {
      return loc({
        type: "insert_stmt",
        insertKw,
        options: read(options) || [],
        intoKw: read(intoKw),
        table: read(table),
        columns: read(columns),
        source: read(source),
      });
    }

insert_options
  = head:insert_opt tail:(__ insert_opt)* {
    return readSpaceSepList(head, tail);
  }

insert_opt
  = never

insert_opt$mysql
  = kw:(LOW_PRIORITY / DELAYED / HIGH_PRIORITY / IGNORE) {
    return loc({ type: "insert_option", kw });
  }
insert_opt$sqlite
  = kws:(OR __ (ABORT / FAIL / IGNORE / REPLACE / ROLLBACK)) {
    return loc({ type: "insert_option", kw: read(kws) });
  }

table_ref_or_explicit_alias
  = t:table_ref alias:(__ explicit_alias)? {
    return loc(createAlias(t, alias));
  }

insert_source
  = values_clause
  / compound_select_stmt
  / default_values

values_clause
  = kw:values_kw values:(__ values_list) {
    return loc({
      type: "values_clause",
      valuesKw: kw,
      values: read(values),
    });
  }

values_kw = VALUES
values_kw$mysql = VALUES / VALUE

values_list
  = head:values_row tail:(__ "," __ values_row)* {
    return loc(createExprList(head, tail));
  }

values_row
  = paren_expr_list

values_row$mysql
  = "(" c1:__ list:expr_list_with_default c2:__ ")" {
    return loc(createParenExpr(c1, list, c2));
  }

expr_list_with_default
  = head:(expr / default) tail:(__ "," __ (expr / default))* {
    return loc(createExprList(head, tail));
  }

default
  = kw:DEFAULT {
    return loc({ type: "default", kw });
  }

default_values
  = kws:(DEFAULT __ VALUES) {
      return loc({ type: "default_values", kw: read(kws) });
    }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * UPDATE                                                                               *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
update_stmt
  = kw:(UPDATE __)
    tables:(table_ref_list __)
    setKw:(SET __)
    set:column_assignment_list
    where:(__ where_clause)? {
      return loc({
        type: "update_stmt",
        updateKw: read(kw),
        tables: read(tables),
        setKw: read(setKw),
        assignments: set,
        where: read(where),
      });
    }

column_assignment_list
  = head:column_assignment tail:(__ "," __ column_assignment)* {
      return loc(createExprList(head, tail));
    }

column_assignment
  = col:(column_ref __) "=" expr:(__ column_value) {
    return loc({
      type: "column_assignment",
      column: read(col),
      expr: read(expr),
    });
  }

column_value = expr
column_value$mysql = expr / default

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * DELETE FROM                                                                          *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
delete_stmt
  = delKw:(DELETE __) fromKw:(FROM __) tbl:table_ref_or_alias
    where:(__ where_clause)? {
      return loc({
        type: "delete_stmt",
        deleteKw: read(delKw),
        fromKw: read(fromKw),
        table: tbl,
        where: read(where),
      });
    }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * CREATE SCHEMA                                                                        *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
create_db_stmt
  = a:CREATE __
    k:(DATABASE / SCHEMA) __
    ife:if_not_exists? __
    t:ident_name __
    c:create_db_definition? {
      return "[Not implemented]";
    }

create_db_definition
  = head:create_option_character_set tail:(__ create_option_character_set)* {
    return "[Not implemented]";
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
    tmpKw:(__ (TEMP / TEMPORARY))?
    viewKw:(__ VIEW)
    ifKw:(__ if_not_exists)?
    name:(__ table_ref)
    cols:(__ paren_plain_column_ref_list)?
    asKw:(__ AS)
    select:(__ compound_select_stmt) {
      return loc({
        type: "create_view_stmt",
        createKw,
        temporaryKw: read(tmpKw),
        viewKw: read(viewKw),
        ifNotExistsKw: read(ifKw),
        name: read(name),
        columns: read(cols),
        asKw: read(asKw),
        expr: read(select),
      });
    }

drop_view_stmt
  = kws:(DROP __ VIEW)
    ifKw:(__ if_exists)?
    views:(__ table_ref_list)
    behaviorKw:(__ (CASCADE / RESTRICT))? {
      return loc({
        type: "drop_view_stmt",
        dropViewKw: read(kws),
        ifExistsKw: read(ifKw),
        views: read(views),
        behaviorKw: read(behaviorKw),
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
  = kw:(CREATE __)
    typeKw:((UNIQUE / FULLTEXT / SPATIAL) __)?
    indexKw:(INDEX __)
    ifKw:(if_not_exists __)?
    name:(table_ref __)
    onKw:(ON __)
    table:(table_ref __)
    columns:paren_column_ref_list
    where:(__ where_clause)? {
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
        where: read(where),
      });
    }

// DROP INDEX
drop_index_stmt
  = kws:(DROP __ INDEX __)
    ifKw:(if_exists __)?
    indexes:table_ref_list {
      return loc({
        type: "drop_index_stmt",
        dropIndexKw: read(kws),
        ifExistsKw: read(ifKw),
        indexes: read(indexes)
      });
    }

drop_index_stmt$mysql
  = kws:(DROP __ INDEX __)
    index:(table_ref __)
    onKw:(ON __)
    table:table_ref {
      return loc({
        type: "drop_index_stmt",
        dropIndexKw: read(kws),
        indexes: [read(index)],
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
  = a:CREATE __
    tp:TEMPORARY? __
    TABLE __
    ife:if_not_exists? __
    t:table_ref __
    lt:create_like_table {
      return "[Not implemented]";
    }
  / createKw:CREATE
    tmpKw:(__ (TEMPORARY / TEMP))?
    tableKw:(__ TABLE)
    ifKw:(__ if_not_exists)?
    table:(__ table_ref __)
    columns:create_table_definition
    __ table_options?
    __ (IGNORE / REPLACE)?
    __ AS?
    __ compound_select_stmt? {
      return loc({
        type: "create_table_stmt",
        createKw,
        temporaryKw: read(tmpKw),
        tableKw: read(tableKw),
        ifNotExistsKw: read(ifKw),
        table: read(table),
        columns,
      });
    }

if_not_exists
  = kws:(IF __ NOT __ EXISTS) { return read(kws); }

create_like_table_simple
  = LIKE __ t: table_ref_list {
    return "[Not implemented]";
  }

create_like_table
  = create_like_table_simple
  / "(" __ e:create_like_table  __ ")" {
    return "[Not implemented]";
  }

create_table_definition
  = "(" c1:__ list:create_definition_list c2:__ ")" {
    return loc(createParenExpr(c1, list, c2));
  }

create_definition_list
  = head:create_definition tail:(__ "," __ create_definition)* {
    return loc(createExprList(head, tail));
  }

create_definition
  = table_constraint
  / column_definition

column_definition
  = name:(column_ref __)
    type:data_type
    constraints:(__ column_constraint_list)? {
      return loc({
        type: "column_definition",
        name: read(name),
        dataType: type,
        constraints: read(constraints) || [],
      });
    }

column_constraint_list
  = head:column_constraint tail:(__ column_constraint)* {
    return readSpaceSepList(head, tail);
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
    tables:table_ref_list
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
    t:(table_ref __)
    actions:alter_action_list {
      return loc({
        type: "alter_table_stmt",
        alterTableKw: read(kw),
        table: read(t),
        actions,
      });
    }

alter_action_list
  = head:alter_action tail:(__ "," __ alter_action)* {
      return loc(createExprList(head, tail));
    }

alter_action
  = alter_add_column
  / alter_drop_column
  / alter_rename_column
  / alter_rename_table

alter_add_column
  = addKw:(ADD __ COLUMN __ / ADD __)? col:column_definition {
      return loc({
        type: "alter_add_column",
        addKw: read(addKw),
        column: col
      });
    }

alter_drop_column
  = kw:(DROP __ COLUMN __ / DROP __) col:column_ref {
      return loc({
        type: "alter_drop_column",
        dropKw: read(kw),
        column: col,
      })
    }

alter_rename_table
  = kw:(rename_table_kw __) t:table_ref {
    return loc({
      type: "alter_rename_table",
      renameKw: read(kw),
      newName: t,
    });
  }

rename_table_kw
  = kw:(RENAME __ TO) { return read(kw); }

rename_table_kw$mysql
  = kw:(RENAME __ (TO / AS) / RENAME) { return read(kw); }

alter_rename_column
  = kw:(rename_column_kw __) oldName:(column_ref __) toKw:((TO / AS) __) newName:column_ref {
    return loc({
      type: "alter_rename_column",
      renameKw: read(kw),
      oldName: read(oldName),
      toKw: read(toKw),
      newName,
    });
  }

rename_column_kw
  = kw:(RENAME __ COLUMN) { return read(kw); }

rename_column_kw$sqlite
  = kw:(RENAME __ COLUMN / RENAME) { return read(kw); }

table_options
  = head:table_option tail:(__ ","? __ table_option)* {
    return "[Not implemented]";
  }

create_option_character_set
  = kw:DEFAULT? __ t:(CHARACTER __ SET / CHARSET / COLLATE) __ s:("=")? __ v:ident_name {
    return "[Not implemented]";
  }

table_option
  = kw:(AUTO_INCREMENT / AVG_ROW_LENGTH / KEY_BLOCK_SIZE / MAX_ROWS / MIN_ROWS / STATS_SAMPLE_PAGES) __ s:("=")? __ v:literal_number {
    return "[Not implemented]";
  }
  / create_option_character_set
  / kw:(COMMENT / CONNECTION) __ s:("=")? __ c:literal_string {
    return "[Not implemented]";
  }
  / kw:COMPRESSION __ s:("=")? __ v:("'" ("ZLIB"i / "LZ4"i / "NONE"i) "'") {
    return "[Not implemented]";
  }
  / kw:ENGINE __ s:("=")? __ c:ident_name {
    return "[Not implemented]";
  }
  / kw:ROW_FORMAT __ s:("=")? __ c:(DEFAULT / DYNAMIC / FIXED / COMPRESSED / REDUNDANT / COMPACT) {
    return "[Not implemented]";
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
    name:(table_ref __)
    event:(trigger_event __)
    onKw:(ON __)
    table:(table_ref __)
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
  = timeKw:(trigger_time_kw __)? eventKw:(UPDATE __) ofKw:(OF __) cols:column_ref_list {
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
  = beginKw:BEGIN statements:(__ trigger_body_statement)+ endKw:(__ END) {
    return loc({
      type: "trigger_body",
      beginKw,
      statements: statements.map(read),
      endKw: read(endKw),
    });
  }

trigger_body_statement
  = st:(statement __) ";" {
    return read(st);
  }

// DROP TRIGGER
drop_trigger_stmt
  = kw:(DROP __ TRIGGER __)
    ifKw:(if_exists __)?
    trigger:table_ref {
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
 * ANALYZE                                                                              *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
analyze_stmt
  = kw:ANALYZE tKw:(__ TABLE)? tables:(__ table_ref_list)? {
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

explain_kw = EXPLAIN
explain_kw$mysql = EXPLAIN / DESCRIBE / DESC

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
  = never
start_transaction_stmt$sqlite
  = kw:BEGIN bKw:(__ (DEFERRED / IMMEDIATE / EXCLUSIVE))? tKw:(__ TRANSACTION)? {
    return loc({
      type: "start_transaction_stmt",
      startKw: kw,
      behaviorKw: read(bKw),
      transactionKw: read(tKw),
    });
  }
start_transaction_stmt$mysql
  = kw:BEGIN tKw:(__ WORK)? {
    return loc({
      type: "start_transaction_stmt",
      startKw: kw,
      transactionKw: read(tKw),
    });
  }
  / kw:START tKw:(__ TRANSACTION) {
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

commit_kw = COMMIT
commit_kw$sqlite = COMMIT / END

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

transaction_kw = TRANSACTION
transaction_kw$mysql = WORK

savepoint_stmt
  = spKw:(SAVEPOINT __) id:ident {
    return loc({
      type: "savepoint_stmt",
      savepointKw: read(spKw),
      savepoint: id,
    });
  }

release_savepoint_stmt
  = kw:(RELEASE __) spKw:(SAVEPOINT __)? id:ident {
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
  = kw:REINDEX table:(__ table_ref)? {
    return loc({ type: "reindex_stmt", reindexKw: kw, table: read(table) });
  }

pragma_stmt
  = kw:(PRAGMA __) pragma:(pragma_assignment / pragma_func_call / table_ref) {
    return loc({
      type: "pragma_stmt",
      pragmaKw: read(kw),
      pragma,
    });
  }

pragma_assignment
  = name:(table_ref __) "=" value:(__ pragma_value) {
    return loc({
      type: "pragma_assignment",
      name: read(name),
      value: read(value),
    });
  }

pragma_func_call
  = name:(__ table_ref) args:(__ pragma_func_call_args) {
    return loc({
      type: "pragma_func_call",
      name: read(name),
      args: read(args),
    });
  }

pragma_func_call_args
  = "(" c1:__ v:pragma_value c2:__ ")" {
    return loc(createParenExpr(c1, v, c2));
  }

pragma_value
  = kw:ident_name { return createKeyword(kw); }
  / literal

create_virtual_table_stmt
  = kw:(CREATE __ VIRTUAL __ TABLE __) ifKw:(if_not_exists __)? table:(table_ref __)
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
  = kw:CONSTRAINT name:(__ ident)? {
    return loc({
      type: "constraint_name",
      constraintKw: kw,
      name: read(name),
    });
  }

constraint_deferrable
  = kw:(DEFERRABLE / NOT __ DEFERRABLE)
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
  = column_constraint_type_standard

column_constraint_type_standard
  = constraint_not_null
  / constraint_null
  / constraint_default
  / column_constraint_primary_key
  / column_constraint_unique
  / references_specification
  / constraint_check
  / constraint_collate
  / constraint_generated

column_constraint_type$mysql
  = column_constraint_type_standard
  / column_constraint_index
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
  = kw:DEFAULT e:(__ (literal / paren_expr)) {
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
  = kw:COLLATE id:(__ ident) {
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
  = kws:(GENERATED __ ALWAYS __)? asKw:AS expr:(__ paren_expr)
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
  = table_constraint_type_standard

table_constraint_type_standard
  = table_constraint_primary_key
  / table_constraint_unique
  / constraint_foreign_key
  / constraint_check

table_constraint_type$mysql
  = table_constraint_type_standard
  / table_constraint_index

table_constraint_primary_key
  = kws:(PRIMARY __ KEY __)
    t:(index_type __)?
    columns:paren_column_ref_list
    opts:(__ index_options)?
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
    i:(ident __)?
    t:(index_type __)?
    columns:paren_column_ref_list
    id:(__ index_options)?
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
  = kw:CHECK expr:(__ paren_expr)
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
    columns:paren_column_ref_list
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
    table:table_ref
    columns:(__ paren_column_ref_list)?
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
    columns:paren_column_ref_list {
      return loc({
        type: "constraint_index",
        indexKw: read(kw),
        columns,
      });
    }
  / typeKw:((FULLTEXT / SPATIAL) __)
    kw:((INDEX / KEY) __ )?
    columns:paren_column_ref_list {
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
  = kw:(type_name __) params:type_params {
    return loc({ type: "data_type", nameKw: read(kw), params });
  }
  / kw:type_name {
    return loc({ type: "data_type", nameKw: kw });
  }

type_params
  = "(" c1:__ params:literal_list c2:__ ")" {
    return loc(createParenExpr(c1, params, c2));
  }

literal_list
  = head:literal tail:(__ "," __ literal)* {
    return loc(createExprList(head, tail));
  }

type_name
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
  / VARCHAR
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
  / BIGINT
  / FLOAT
  / kws:(DOUBLE __ PRECISION) { return read(kws); }
  / DOUBLE
  / REAL
  / BIT
  / JSON
  / ENUM
  / SET

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

or_op = OR
or_op$mysql = OR / "||"

xor_expr
  = and_expr

xor_expr$mysql
  = head:and_expr tail:(__ XOR __ and_expr)* {
    return createBinaryExprChain(head, tail);
  }

and_expr
  = head:not_expr tail:(__ and_op __ not_expr)* {
    return createBinaryExprChain(head, tail);
  }

and_op = AND
and_op$mysql = AND / "&&"

not_expr
  = comparison_expr
  / kw:NOT expr:(__ not_expr) {
    return loc(createPrefixOpExpr(kw, read(expr)));
  }

comparison_expr
  = head:bitwise_or_expr tail:(__ comparison_op __ bitwise_or_expr)+ {
    return createBinaryExprChain(head, tail);
  }
  / left:bitwise_or_expr c1:__ op:(NOT __ IN / IN) c2:__ right:(paren_expr_list / bitwise_or_expr) {
    return loc(createBinaryExpr(left, c1, read(op), c2, right))
  }
  / left:bitwise_or_expr c1:__ op:(NOT __ LIKE / LIKE) c2:__ right:escape_expr {
    return loc(createBinaryExpr(left, c1, read(op), c2, right))
  }
  / left:(bitwise_or_expr __) betweenKw:between_op begin:(__ bitwise_or_expr) andKw:(__ AND) end:(__ bitwise_or_expr) {
    return loc({
      type: "between_expr",
      left: read(left),
      betweenKw,
      begin: read(begin),
      andKw: read(andKw),
      end: read(end),
    });
  }
  / expr:(bitwise_or_expr __) op:unary_null_op {
    return loc(createPostfixOpExpr(op, read(expr)));
  }
  / bitwise_or_expr

comparison_op
  = comparison_op_standard

comparison_op_standard
  = ">=" / ">" / "<=" / "<>" / "<" / "=" / "!=" / is_op / regexp_op

comparison_op$mysql
  = "<=>" / comparison_op_standard

comparison_op$sqlite
  = "==" / comparison_op_standard

is_op
  = kws:(IS __ NOT / IS) { return read(kws); }

is_op$sqlite
  = kws:(
      IS __ NOT __ DISTINCT __ FROM
    / IS __ DISTINCT __ FROM
    / IS __ NOT
    / IS) { return read(kws); }

regexp_op
  = op:(NOT __ regexp_op_kw / regexp_op_kw) { return read(op); }

regexp_op_kw = REGEXP
regexp_op_kw$mysql = REGEXP / RLIKE
regexp_op_kw$sqlite = REGEXP / GLOB / MATCH

escape_expr
  = left:bitwise_or_expr c1:__ op:ESCAPE c2:__ right:literal_string {
    return loc(createBinaryExpr(left, c1, op, c2, right));
  }
  / bitwise_or_expr

between_op
  = kws:(NOT __ BETWEEN / BETWEEN) { return read(kws); }

unary_null_op = never
unary_null_op$sqlite
  = kws:(NOT __ NULL / NOTNULL / ISNULL) { return read(kws); }

bitwise_or_expr
  = head:bitwise_and_expr tail:(__ "|"  __ bitwise_and_expr)* {
    return createBinaryExprChain(head, tail);
  }

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
  = head:bitwise_xor_expr tail:(__ multiplicative_operator  __ bitwise_xor_expr)* {
      return createBinaryExprChain(head, tail);
    }

multiplicative_operator
  = "*" / "/" / "%" / op:DIV / op:MOD

bitwise_xor_expr
  = head:concat_or_json_expr tail:(__ "^"  __ concat_or_json_expr)* {
    return createBinaryExprChain(head, tail);
  }

concat_or_json_expr
  = head:collate_expr tail:(__ concat_or_json_op  __ collate_expr)* {
      return createBinaryExprChain(head, tail);
    }

concat_or_json_op = "||" / "->>" / "->"
concat_or_json_op$mysql = "->>" / "->"

collate_expr
  = left:negation_expr c1:__ op:COLLATE c2:__ right:ident {
    return loc(createBinaryExpr(left, c1, op, c2, right));
  }
  / negation_expr

negation_expr
  = primary
  / op:negation_operator right:(__ negation_expr) {
    return loc(createPrefixOpExpr(op, read(right)));
  }

negation_operator = "-" / "~" / "!"

primary
  = primary_standard

primary$mysql
  = primary_standard
  / interval_expr

primary_standard
  = literal
  / paren_expr
  / paren_expr_select
  / cast_expr
  / func_call
  / case_expr
  / exists_expr
  / column_ref

paren_expr
  = "(" c1:__ expr:expr c2:__ ")" {
    return loc(createParenExpr(c1, expr, c2));
  }

paren_expr_select
  = "(" c1:__ stmt:compound_select_stmt c2:__ ")" {
    return loc(createParenExpr(c1, stmt, c2));
  }

paren_expr_list
  = "("  c2:__ list:expr_list c3:__ ")" {
    return loc(createParenExpr(c2, list, c3));
  }

expr_list
  = head:expr tail:(__ "," __ expr)* {
    return loc(createExprList(head, tail));
  }

cast_expr
  = kw:CAST args:(__ cast_args_in_parens)  {
    return loc({
      type: "cast_expr",
      castKw: kw,
      args: read(args),
    });
  }

cast_args_in_parens
  = "(" c1:__ arg:cast_arg c2:__ ")" {
    return loc(createParenExpr(c1, arg, c2));
  }

cast_arg
  = e:(expr __) kw:AS t:(__ data_type) {
    return loc({
      type: "cast_arg",
      expr: read(e),
      asKw: kw,
      dataType: read(t),
    });
  }

func_call
  = name:(func_name __) args:func_args
    filter:(__ filter_arg)?
    over:(__ over_arg)? {
      return loc({
        type: "func_call",
        name: read(name),
        args,
        ...(filter ? {filter: read(filter)} : {}),
        ...(over ? {over: read(over)} : {}),
      });
    }
  / name:paren_less_func_name {
      return loc({
        type: "func_call",
        name,
      });
    }

func_name
  = ident

func_name$mysql
  = ident
  / kw:mysql_window_func_keyword {
    return loc({ type: "identifier", text: kw.text })
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

paren_less_func_name
  = kw:(CURRENT_DATE / CURRENT_TIME / CURRENT_TIMESTAMP) {
    return loc(createIdentifier(kw.text));
  }

func_args
  = "(" c1:__ args:func_args_list c2:__ ")" {
    return loc(createParenExpr(c1, args, c2));
  }

func_args_list
  = head:func_1st_arg tail:(__ "," __ expr)* {
    return loc(createExprList(head, tail));
  }
  / &. {
    // even when no parameters are present, we want to create an empty args object,
    // so we can attach optional comments to it,
    // allowing us to represent comments inside empty arguments list
    return loc({ type: "expr_list", items: [] });
  }

// For aggregate functions, first argument can be "*"
func_1st_arg
  = star
  / kw:DISTINCT e:(__ expr) {
    return loc({ type: "distinct_arg", distinctKw: kw, value: read(e) });
  }
  / expr

filter_arg
  = never

filter_arg$sqlite
  = kw:(FILTER __) e:paren_where_expr {
    return loc({
      type: "filter_arg",
      filterKw: read(kw),
      where: e,
    });
  }

paren_where_expr
  = "(" c1:__ e:where_clause c2:__ ")" {
    return loc(createParenExpr(c1, e, c2));
  }

over_arg
  = kw:(OVER __) win:(window_definition_in_parens / ident) {
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
  = kw:INTERVAL e:(__ expr __) unit:interval_unit {
    return {
      type: "interval_expr",
      intervalKw: kw,
      expr: read(e),
      unitKw: unit,
    };
  }

interval_unit
  = YEAR
  / QUARTER
  / MONTH
  / WEEK
  / DAY
  / HOUR
  / MINUTE
  / SECOND
  / MICROSECOND

exists_expr
  = kw:EXISTS expr:(__ paren_expr_select) {
    return loc(createPrefixOpExpr(kw, read(expr)));
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Table names                                                                          *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
table_ref_list
  = head:table_ref tail:(__ "," __ table_ref)* {
    return loc(createExprList(head, tail));
  }

table_ref
  = schema:(ident __) "." t:(__ ident) {
    return loc({
      type: "table_ref",
      schema: read(schema),
      table: read(t),
    });
  }
  / t:ident {
    return loc({
      type: "table_ref",
      table: t,
    });
  }

/**
 * ------------------------------------------------------------------------------------ *
 *                                                                                      *
 * Column names                                                                         *
 *                                                                                      *
 * ------------------------------------------------------------------------------------ *
 */
paren_column_ref_list
  = "(" c1:__ cols:column_ref_list c2:__ ")" {
    return loc(createParenExpr(c1, cols, c2));
  }

column_ref_list
  = head:column_ref tail:(__ "," __ column_ref)* {
    return loc(createExprList(head, tail));
  }

paren_plain_column_ref_list
  = "(" c1:__ cols:plain_column_ref_list c2:__ ")" {
    return loc(createParenExpr(c1, cols, c2));
  }

plain_column_ref_list
  = head:plain_column_ref tail:(__ "," __ plain_column_ref)* {
    return loc(createExprList(head, tail));
  }

column_ref
  = tbl:(ident __) "." col:(__ qualified_column) {
    return loc({
      type: "column_ref",
      table: read(tbl),
      column: read(col),
    });
  }
  / plain_column_ref

plain_column_ref
  = col:column {
    return loc({
      type: "column_ref",
      column: col,
    });
  }

// Keywords can be used as column names when they are prefixed by table name, like tbl.update
qualified_column
  = name:ident_name {
    return loc(createIdentifier(name));
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
  / s:literal_plain_string { return loc(createIdentifier(s.text)); }

ident "identifier"
  = name:ident_name !{ return __RESERVED_KEYWORDS__[name.toUpperCase()] === true; } {
    return loc(createIdentifier(name));
  }
  / quoted_ident

quoted_ident
  = name:backticks_quoted_ident { return loc(createIdentifier(name)); }
quoted_ident$mysql
  = name:backticks_quoted_ident { return loc(createIdentifier(name)); }
quoted_ident$sqlite
  = name:bracket_quoted_ident { return loc(createIdentifier(name)); }
  / name:backticks_quoted_ident { return loc(createIdentifier(name)); }
  / str:literal_double_quoted_string_qq { return loc(createIdentifier(str.text)); }

backticks_quoted_ident
  = q:"`" chars:([^`] / "``")+ "`" { return text(); }

bracket_quoted_ident
  = q:"[" chars:([^\]] / "]]")+ "]" { return text(); }

ident_name
  = ident_start ident_part* { return text(); }
  / [0-9]+ ident_start ident_part* { return text(); }

ident_start = [A-Za-z_]

ident_part  = [A-Za-z0-9_]

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
  / literal_boolean
  / literal_null
  / literal_datetime

literal_null
  = kw:NULL {
    return loc({ type: "null", text: kw.text });
  }

literal_boolean
  = kw:TRUE {
    return loc({ type: "boolean", text: kw.text });
  }
  / kw:FALSE {
    return loc({ type: "boolean", text: kw.text});
  }

literal_string "string"
  = literal_hex_string
  / literal_plain_string

literal_string$mysql "string"
  = charset:charset_introducer string:(__ literal_string_without_charset) {
    return loc({
      type: "string_with_charset",
      charset,
      string: read(string),
    });
  }
  / literal_string_without_charset
  / literal_natural_charset_string

literal_string_without_charset // for MySQL only
  = literal_hex_string
  / literal_bit_string
  / nr:literal_hex_number { return {...nr, type: "string" }; }
  / literal_plain_string

// The most ordinary string type, without any prefixes
literal_plain_string
  = literal_single_quoted_string_qq

literal_plain_string$mysql
  = literal_single_quoted_string_qq_bs
  / literal_double_quoted_string_qq_bs

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

literal_hex_string
  = "X"i "'" [0-9A-Fa-f]* "'" {
    return loc({
      type: "string",
      text: text(),
    });
  }

literal_bit_string
  = "b"i "'" [01]* "'" {
    return loc({
      type: "string",
      text: text(),
    });
  }

literal_single_quoted_string_qq_bs // with repeated quote or backslash for escaping
  = "'" single_quoted_char* "'" {
    return loc({
      type: "string",
      text: text(),
    });
  }

literal_single_quoted_string_qq // with repeated quote for escaping
  = "'" ([^'] / "''")* "'" {
    return loc({
      type: "string",
      text: text(),
    });
  }

literal_double_quoted_string_qq // with repeated quote for escaping
  = "\"" ([^"] / '""')* "\"" {
    return loc({
      type: "string",
      text: text(),
    });
  }

literal_double_quoted_string_qq_bs // with repeated quote or backslash for escaping
  = "\"" double_quoted_char* "\"" {
    return loc({
      type: "string",
      text: text(),
    });
  }

literal_natural_charset_string
  = "N"i literal_single_quoted_string_qq_bs {
    return loc({
      type: "string",
      text: text(),
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

double_quoted_char
  = [^"\\\0-\x1F\x7f]
  / escape_char

single_quoted_char
  = [^'\\] // remove \0-\x1F\x7f pnCtrl char [^'\\\0-\x1F\x7f]
  / escape_char

escape_char
  = "\\'"  { return "\\'";  }
  / '\\"'  { return '\\"';  }
  / "\\\\" { return "\\\\"; }
  / "\\/"  { return "\\/";  }
  / "\\b"  { return "\b"; }
  / "\\f"  { return "\f"; }
  / "\\n"  { return "\n"; }
  / "\\r"  { return "\r"; }
  / "\\t"  { return "\t"; }
  / "\\u" h1:hexDigit h2:hexDigit h3:hexDigit h4:hexDigit {
      return String.fromCharCode(parseInt("0x" + h1 + h2 + h3 + h4));
    }
  / "\\" { return "\\"; }
  / "''" { return "''" }
  / '""' { return '""' }

line_terminator
  = [\n\r]

literal_number "number"
  = literal_decimal_number

literal_number$sqlite "number"
  = literal_decimal_number / literal_hex_number

literal_hex_number
  = "0x" [0-9A-Fa-f]+ {
    return loc({
      type: "number",
      text: text(),
    });
  }

literal_decimal_number
  = int frac? exp? !ident_start {
    return loc({
      type: "number",
      text: text(),
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

hexDigit
  = [0-9a-fA-F]

// Optional whitespace (or comments)
__ "whitespace"
  = xs:(space / newline / comment)* {
    return xs.filter((ws) => (
      (options.preserveComments && (ws.type === "line_comment" || ws.type === "block_comment")) ||
      (options.preserveNewlines && ws.type === "newline") ||
      (options.preserveSpaces && ws.type === "space")
    ));
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

// All keywords (sorted alphabetically)
ABORT               = kw:"ABORT"i               !ident_part { return loc(createKeyword(kw)); }
ACTION              = kw:"ACTION"i              !ident_part { return loc(createKeyword(kw)); }
ADD                 = kw:"ADD"i                 !ident_part { return loc(createKeyword(kw)); }
ADD_DATE            = kw:"ADDDATE"i             !ident_part { return loc(createKeyword(kw)); }
AFTER               = kw:"AFTER"i               !ident_part { return loc(createKeyword(kw)); }
AGAINST             = kw:"AGAINST"              !ident_part { return loc(createKeyword(kw)); }
ALGORITHM           = kw:"ALGORITHM"i           !ident_part { return loc(createKeyword(kw)); }
ALL                 = kw:"ALL"i                 !ident_part { return loc(createKeyword(kw)); }
ALTER               = kw:"ALTER"i               !ident_part { return loc(createKeyword(kw)); }
ALWAYS              = kw:"ALWAYS"i              !ident_part { return loc(createKeyword(kw)); }
ANALYZE             = kw:"ANALYZE"i             !ident_part { return loc(createKeyword(kw)); }
AND                 = kw:"AND"i                 !ident_part { return loc(createKeyword(kw)); }
AS                  = kw:"AS"i                  !ident_part { return loc(createKeyword(kw)); }
ASC                 = kw:"ASC"i                 !ident_part { return loc(createKeyword(kw)); }
ATTACH              = kw:"ATTACH"i              !ident_part { return loc(createKeyword(kw)); }
AUTO_INCREMENT      = kw:"AUTO_INCREMENT"i      !ident_part { return loc(createKeyword(kw)); }
AVG                 = kw:"AVG"i                 !ident_part { return loc(createKeyword(kw)); }
AVG_ROW_LENGTH      = kw:"AVG_ROW_LENGTH"i      !ident_part { return loc(createKeyword(kw)); }
BEFORE              = kw:"BEFORE"i              !ident_part { return loc(createKeyword(kw)); }
BEGIN               = kw:"BEGIN"i               !ident_part { return loc(createKeyword(kw)); }
BETWEEN             = kw:"BETWEEN"i             !ident_part { return loc(createKeyword(kw)); }
BIGINT              = kw:"BIGINT"i              !ident_part { return loc(createKeyword(kw)); }
BINARY              = kw:"BINARY"i              !ident_part { return loc(createKeyword(kw)); }
BINLOG              = kw:"BINLOG"i              !ident_part { return loc(createKeyword(kw)); }
BIT                 = kw:"BIT"i                 !ident_part { return loc(createKeyword(kw)); }
BLOB                = kw:"BLOB"i                !ident_part { return loc(createKeyword(kw)); }
BOOL                = kw:"BOOL"i                !ident_part { return loc(createKeyword(kw)); }
BOOLEAN             = kw:"BOOLEAN"i             !ident_part { return loc(createKeyword(kw)); }
BTREE               = kw:"BTREE"i               !ident_part { return loc(createKeyword(kw)); }
BY                  = kw:"BY"i                  !ident_part { return loc(createKeyword(kw)); }
CALL                = kw:"CALL"i                !ident_part { return loc(createKeyword(kw)); }
CASCADE             = kw:"CASCADE"i             !ident_part { return loc(createKeyword(kw)); }
CASCADED            = kw:"CASCADED"i            !ident_part { return loc(createKeyword(kw)); }
CASE                = kw:"CASE"i                !ident_part { return loc(createKeyword(kw)); }
CAST                = kw:"CAST"i                !ident_part { return loc(createKeyword(kw)); }
CHANGE              = kw:"CHANGE"i              !ident_part { return loc(createKeyword(kw)); }
CHAR                = kw:"CHAR"i                !ident_part { return loc(createKeyword(kw)); }
CHARACTER           = kw:"CHARACTER"i           !ident_part { return loc(createKeyword(kw)); }
CHARSET             = kw:"CHARSET"i             !ident_part { return loc(createKeyword(kw)); }
CHECK               = kw:"CHECK"i               !ident_part { return loc(createKeyword(kw)); }
COLLATE             = kw:"COLLATE"i             !ident_part { return loc(createKeyword(kw)); }
COLLATION           = kw:"COLLATION"i           !ident_part { return loc(createKeyword(kw)); }
COLUMN              = kw:"COLUMN"i              !ident_part { return loc(createKeyword(kw)); }
COLUMN_FORMAT       = kw:"COLUMN_FORMAT"i       !ident_part { return loc(createKeyword(kw)); }
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
CURRENT_TIME        = kw:"CURRENT_TIME"i        !ident_part { return loc(createKeyword(kw)); }
CURRENT_TIMESTAMP   = kw:"CURRENT_TIMESTAMP"i   !ident_part { return loc(createKeyword(kw)); }
CURRENT_USER        = kw:"CURRENT_USER"i        !ident_part { return loc(createKeyword(kw)); }
DATABASE            = kw:"DATABASE"i            !ident_part { return loc(createKeyword(kw)); }
DATE                = kw:"DATE"i                !ident_part { return loc(createKeyword(kw)); }
DATETIME            = kw:"DATETIME"i            !ident_part { return loc(createKeyword(kw)); }
DAY                 = kw:"DAY"i                 !ident_part { return loc(createKeyword(kw)); }
DEC                 = kw:"DEC"i                 !ident_part { return loc(createKeyword(kw)); }
DECIMAL             = kw:"DECIMAL"i             !ident_part { return loc(createKeyword(kw)); }
DEFAULT             = kw:"DEFAULT"i             !ident_part { return loc(createKeyword(kw)); }
DEFERRABLE          = kw:"DEFERRABLE"i          !ident_part { return loc(createKeyword(kw)); }
DEFERRED            = kw:"DEFERRED"i            !ident_part { return loc(createKeyword(kw)); }
DEFINER             = kw:"DEFINER"i             !ident_part { return loc(createKeyword(kw)); }
DELAYED             = kw:"DELAYED"i             !ident_part { return loc(createKeyword(kw)); }
DELETE              = kw:"DELETE"i              !ident_part { return loc(createKeyword(kw)); }
DENSE_RANK          = kw:"DENSE_RANK"i          !ident_part { return loc(createKeyword(kw)); }
DESC                = kw:"DESC"i                !ident_part { return loc(createKeyword(kw)); }
DESCRIBE            = kw:"DESCRIBE"i            !ident_part { return loc(createKeyword(kw)); }
DETACH              = kw:"DETACH"i              !ident_part { return loc(createKeyword(kw)); }
DISK                = kw:"DISK"i                !ident_part { return loc(createKeyword(kw)); }
DISTINCT            = kw:"DISTINCT"i            !ident_part { return loc(createKeyword(kw)); }
DISTINCTROW         = kw:"DISTINCTROW"i         !ident_part { return loc(createKeyword(kw)); }
DIV                 = kw:"DIV"i                 !ident_part { return loc(createKeyword(kw)); }
DOUBLE              = kw:"DOUBLE"i              !ident_part { return loc(createKeyword(kw)); }
DROP                = kw:"DROP"i                !ident_part { return loc(createKeyword(kw)); }
DUAL                = kw:"DUAL"i                !ident_part { return loc(createKeyword(kw)); }
DUMPFILE            = kw:"DUMPFILE"i            !ident_part { return loc(createKeyword(kw)); }
DUPLICATE           = kw:"DUPLICATE"i           !ident_part { return loc(createKeyword(kw)); }
DYNAMIC             = kw:"DYNAMIC"i             !ident_part { return loc(createKeyword(kw)); }
EACH                = kw:"EACH"i                !ident_part { return loc(createKeyword(kw)); }
ELSE                = kw:"ELSE"i                !ident_part { return loc(createKeyword(kw)); }
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
FAIL                = kw:"FAIL"i                !ident_part { return loc(createKeyword(kw)); }
FALSE               = kw:"FALSE"i               !ident_part { return loc(createKeyword(kw)); }
FILTER              = kw:"FILTER"i              !ident_part { return loc(createKeyword(kw)); }
FIRST               = kw:"FIRST"i               !ident_part { return loc(createKeyword(kw)); }
FIRST_VALUE         = kw:"FIRST_VALUE"i         !ident_part { return loc(createKeyword(kw)); }
FIXED               = kw:"FIXED"i               !ident_part { return loc(createKeyword(kw)); }
FLOAT               = kw:"FLOAT"i               !ident_part { return loc(createKeyword(kw)); }
FOLLOWING           = kw:"FOLLOWING"i           !ident_part { return loc(createKeyword(kw)); }
FOR                 = kw:"FOR"i                 !ident_part { return loc(createKeyword(kw)); }
FOREIGN             = kw:"FOREIGN"i             !ident_part { return loc(createKeyword(kw)); }
FROM                = kw:"FROM"i                !ident_part { return loc(createKeyword(kw)); }
FULL                = kw:"FULL"i                !ident_part { return loc(createKeyword(kw)); }
FULLTEXT            = kw:"FULLTEXT"i            !ident_part { return loc(createKeyword(kw)); }
GENERATED           = kw:"GENERATED"i           !ident_part { return loc(createKeyword(kw)); }
GLOB                = kw:"GLOB"i                !ident_part { return loc(createKeyword(kw)); }
GLOBAL              = kw:"GLOBAL"i              !ident_part { return loc(createKeyword(kw)); }
GO                  = kw:"GO"i                  !ident_part { return loc(createKeyword(kw)); }
GRANTS              = kw:"GRANTS"i              !ident_part { return loc(createKeyword(kw)); }
GROUP               = kw:"GROUP"i               !ident_part { return loc(createKeyword(kw)); }
GROUP_CONCAT        = kw:"GROUP_CONCAT"i        !ident_part { return loc(createKeyword(kw)); }
GROUPS              = kw:"GROUPS"i              !ident_part { return loc(createKeyword(kw)); }
HASH                = kw:"HASH"i                !ident_part { return loc(createKeyword(kw)); }
HAVING              = kw:"HAVING"i              !ident_part { return loc(createKeyword(kw)); }
HIGH_PRIORITY       = kw:"HIGH_PRIORITY"i       !ident_part { return loc(createKeyword(kw)); }
HOUR                = kw:"HOUR"i                !ident_part { return loc(createKeyword(kw)); }
IF                  = kw:"IF"i                  !ident_part { return loc(createKeyword(kw)); }
IGNORE              = kw:"IGNORE"i              !ident_part { return loc(createKeyword(kw)); }
IMMEDIATE           = kw:"IMMEDIATE"i           !ident_part { return loc(createKeyword(kw)); }
IN                  = kw:"IN"i                  !ident_part { return loc(createKeyword(kw)); }
INDEX               = kw:"INDEX"i               !ident_part { return loc(createKeyword(kw)); }
INITIALLY           = kw:"INITIALLY"i           !ident_part { return loc(createKeyword(kw)); }
INNER               = kw:"INNER"i               !ident_part { return loc(createKeyword(kw)); }
INPLACE             = kw:"INPLACE"i             !ident_part { return loc(createKeyword(kw)); }
INSERT              = kw:"INSERT"i              !ident_part { return loc(createKeyword(kw)); }
INSTANT             = kw:"INSTANT"i             !ident_part { return loc(createKeyword(kw)); }
INSTEAD             = kw:"INSTEAD"i             !ident_part { return loc(createKeyword(kw)); }
INT                 = kw:"INT"i                 !ident_part { return loc(createKeyword(kw)); }
INTEGER             = kw:"INTEGER"i             !ident_part { return loc(createKeyword(kw)); }
INTERSECT           = kw:"INTERSECT"i           !ident_part { return loc(createKeyword(kw)); }
INTERVAL            = kw:"INTERVAL"i            !ident_part { return loc(createKeyword(kw)); }
INTO                = kw:"INTO"i                !ident_part { return loc(createKeyword(kw)); }
INVISIBLE           = kw:"INVISIBLE"i           !ident_part { return loc(createKeyword(kw)); }
INVOKER             = kw:"INVOKER"i             !ident_part { return loc(createKeyword(kw)); }
IS                  = kw:"IS"i                  !ident_part { return loc(createKeyword(kw)); }
ISNULL              = kw:"ISNULL"               !ident_part { return loc(createKeyword(kw)); }
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
LOCK                = kw:"LOCK"i                !ident_part { return loc(createKeyword(kw)); }
LOCKED              = kw:"LOCKED"i              !ident_part { return loc(createKeyword(kw)); }
LOGS                = kw:"LOGS"i                !ident_part { return loc(createKeyword(kw)); }
LONGBLOB            = kw:"LONGBLOB"i            !ident_part { return loc(createKeyword(kw)); }
LONGTEXT            = kw:"LONGTEXT"i            !ident_part { return loc(createKeyword(kw)); }
LOW_PRIORITY        = kw:"LOW_PRIORITY"i        !ident_part { return loc(createKeyword(kw)); }
MASTER              = kw:"MASTER"i              !ident_part { return loc(createKeyword(kw)); }
MATCH               = kw:"MATCH"i               !ident_part { return loc(createKeyword(kw)); }
MATERIALIZED        = kw:"MATERIALIZED"i        !ident_part { return loc(createKeyword(kw)); }
MAX                 = kw:"MAX"i                 !ident_part { return loc(createKeyword(kw)); }
MAX_ROWS            = kw:"MAX_ROWS"i            !ident_part { return loc(createKeyword(kw)); }
MEDIUMBLOB          = kw:"MEDIUMBLOB"i          !ident_part { return loc(createKeyword(kw)); }
MEDIUMTEXT          = kw:"MEDIUMTEXT"i          !ident_part { return loc(createKeyword(kw)); }
MEMORY              = kw:"MEMORY"i              !ident_part { return loc(createKeyword(kw)); }
MERGE               = kw:"MERGE"i               !ident_part { return loc(createKeyword(kw)); }
MICROSECOND         = kw:"MICROSECOND"i         !ident_part { return loc(createKeyword(kw)); }
MIN                 = kw:"MIN"i                 !ident_part { return loc(createKeyword(kw)); }
MIN_ROWS            = kw:"MIN_ROWS"i            !ident_part { return loc(createKeyword(kw)); }
MINUTE              = kw:"MINUTE"i              !ident_part { return loc(createKeyword(kw)); }
MOD                 = kw:"MOD"i                 !ident_part { return loc(createKeyword(kw)); }
MODE                = kw:"MODE"i                !ident_part { return loc(createKeyword(kw)); }
MONTH               = kw:"MONTH"i               !ident_part { return loc(createKeyword(kw)); }
NATURAL             = kw:"NATURAL"i             !ident_part { return loc(createKeyword(kw)); }
NO                  = kw:"NO"i                  !ident_part { return loc(createKeyword(kw)); }
NOCHECK             = kw:"NOCHECK"i             !ident_part { return loc(createKeyword(kw)); }
NONE                = kw:"NONE"i                !ident_part { return loc(createKeyword(kw)); }
NOT                 = kw:"NOT"i                 !ident_part { return loc(createKeyword(kw)); }
NOTNULL             = kw:"NOTNULL"              !ident_part { return loc(createKeyword(kw)); }
NOWAIT              = kw:"NOWAIT"i              !ident_part { return loc(createKeyword(kw)); }
NTH_VALUE           = kw:"NTH_VALUE"i           !ident_part { return loc(createKeyword(kw)); }
NTILE               = kw:"NTILE"i               !ident_part { return loc(createKeyword(kw)); }
NULL                = kw:"NULL"i                !ident_part { return loc(createKeyword(kw)); }
NULLS               = kw:"NULLS"i               !ident_part { return loc(createKeyword(kw)); }
NUMERIC             = kw:"NUMERIC"i             !ident_part { return loc(createKeyword(kw)); }
OF                  = kw:"OF"i                  !ident_part { return loc(createKeyword(kw)); }
OFFSET              = kw:"OFFSET"i              !ident_part { return loc(createKeyword(kw)); }
ON                  = kw:"ON"i                  !ident_part { return loc(createKeyword(kw)); }
OPTION              = kw:"OPTION"i              !ident_part { return loc(createKeyword(kw)); }
OR                  = kw:"OR"i                  !ident_part { return loc(createKeyword(kw)); }
ORDER               = kw:"ORDER"i               !ident_part { return loc(createKeyword(kw)); }
OTHERS              = kw:"OTHERS"i              !ident_part { return loc(createKeyword(kw)); }
OUTER               = kw:"OUTER"i               !ident_part { return loc(createKeyword(kw)); }
OUTFILE             = kw:"OUTFILE"i             !ident_part { return loc(createKeyword(kw)); }
OVER                = kw:"OVER"i                !ident_part { return loc(createKeyword(kw)); }
PARSER              = kw:"PARSER"i              !ident_part { return loc(createKeyword(kw)); }
PARTIAL             = kw:"PARTIAL"i             !ident_part { return loc(createKeyword(kw)); }
PARTITION           = kw:"PARTITION"i           !ident_part { return loc(createKeyword(kw)); }
PERCENT_RANK        = kw:"PERCENT_RANK"i        !ident_part { return loc(createKeyword(kw)); }
PERSIST             = kw:"PERSIST"i             !ident_part { return loc(createKeyword(kw)); }
PERSIST_ONLY        = kw:"PERSIST_ONLY"i        !ident_part { return loc(createKeyword(kw)); }
PLAN                = kw:"PLAN"i                !ident_part { return loc(createKeyword(kw)); }
PRAGMA              = kw:"PRAGMA"i              !ident_part { return loc(createKeyword(kw)); }
PRECEDING           = kw:"PRECEDING"i           !ident_part { return loc(createKeyword(kw)); }
PRECISION           = kw:"PRECISION"i           !ident_part { return loc(createKeyword(kw)); }
PRIMARY             = kw:"PRIMARY"i             !ident_part { return loc(createKeyword(kw)); }
QUARTER             = kw:"QUARTER"i             !ident_part { return loc(createKeyword(kw)); }
QUERY               = kw:"QUERY"i               !ident_part { return loc(createKeyword(kw)); }
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
RENAME              = kw:"RENAME"i              !ident_part { return loc(createKeyword(kw)); }
REPLACE             = kw:"REPLACE"i             !ident_part { return loc(createKeyword(kw)); }
REPLICATION         = kw:"REPLICATION"i         !ident_part { return loc(createKeyword(kw)); }
RESTRICT            = kw:"RESTRICT"i            !ident_part { return loc(createKeyword(kw)); }
RETURN              = kw:"RETURN"i              !ident_part { return loc(createKeyword(kw)); }
RIGHT               = kw:"RIGHT"i               !ident_part { return loc(createKeyword(kw)); }
RLIKE               = kw:"RLIKE"i               !ident_part { return loc(createKeyword(kw)); }
ROLLBACK            = kw:"ROLLBACK"i            !ident_part { return loc(createKeyword(kw)); }
ROLLUP              = kw:"ROLLUP"i              !ident_part { return loc(createKeyword(kw)); }
ROW                 = kw:"ROW"i                 !ident_part { return loc(createKeyword(kw)); }
ROW_FORMAT          = kw:"ROW_FORMAT"i          !ident_part { return loc(createKeyword(kw)); }
ROW_NUMBER          = kw:"ROW_NUMBER"i          !ident_part { return loc(createKeyword(kw)); }
ROWS                = kw:"ROWS"i                !ident_part { return loc(createKeyword(kw)); }
SAVEPOINT           = kw:"SAVEPOINT"i           !ident_part { return loc(createKeyword(kw)); }
SCHEMA              = kw:"SCHEMA"i              !ident_part { return loc(createKeyword(kw)); }
SECOND              = kw:"SECOND"i              !ident_part { return loc(createKeyword(kw)); }
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
SPATIAL             = kw:"SPATIAL"i             !ident_part { return loc(createKeyword(kw)); }
SQL                 = kw:"SQL"i                 !ident_part { return loc(createKeyword(kw)); }
SQL_BIG_RESULT      = kw:"SQL_BIG_RESULT"i      !ident_part { return loc(createKeyword(kw)); }
SQL_BUFFER_RESULT   = kw:"SQL_BUFFER_RESULT"i   !ident_part { return loc(createKeyword(kw)); }
SQL_CACHE           = kw:"SQL_CACHE"i           !ident_part { return loc(createKeyword(kw)); }
SQL_CALC_FOUND_ROWS = kw:"SQL_CALC_FOUND_ROWS"i !ident_part { return loc(createKeyword(kw)); }
SQL_NO_CACHE        = kw:"SQL_NO_CACHE"i        !ident_part { return loc(createKeyword(kw)); }
SQL_SMALL_RESULT    = kw:"SQL_SMALL_RESULT"i    !ident_part { return loc(createKeyword(kw)); }
START               = kw:"START"i               !ident_part { return loc(createKeyword(kw)); }
STATS_SAMPLE_PAGES  = kw:"STATS_SAMPLE_PAGES"i  !ident_part { return loc(createKeyword(kw)); }
STORAGE             = kw:"STORAGE"i             !ident_part { return loc(createKeyword(kw)); }
STORED              = kw:"STORED"i              !ident_part { return loc(createKeyword(kw)); }
STRAIGHT_JOIN       = kw:"STRAIGHT_JOIN"i       !ident_part { return loc(createKeyword(kw)); }
SUM                 = kw:"SUM"i                 !ident_part { return loc(createKeyword(kw)); }
SYSTEM_USER         = kw:"SYSTEM_USER"i         !ident_part { return loc(createKeyword(kw)); }
TABLE               = kw:"TABLE"i               !ident_part { return loc(createKeyword(kw)); }
TABLES              = kw:"TABLES"i              !ident_part { return loc(createKeyword(kw)); }
TEMP                = kw:"TEMP"i                !ident_part { return loc(createKeyword(kw)); }
TEMPORARY           = kw:"TEMPORARY"i           !ident_part { return loc(createKeyword(kw)); }
TEMPTABLE           = kw:"TEMPTABLE"i           !ident_part { return loc(createKeyword(kw)); }
TEXT                = kw:"TEXT"i                !ident_part { return loc(createKeyword(kw)); }
THEN                = kw:"THEN"i                !ident_part { return loc(createKeyword(kw)); }
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
UNBOUNDED           = kw:"UNBOUNDED"i           !ident_part { return loc(createKeyword(kw)); }
UNDEFINED           = kw:"UNDEFINED"i           !ident_part { return loc(createKeyword(kw)); }
UNION               = kw:"UNION"i               !ident_part { return loc(createKeyword(kw)); }
UNIQUE              = kw:"UNIQUE"i              !ident_part { return loc(createKeyword(kw)); }
UNLOCK              = kw:"UNLOCK"i              !ident_part { return loc(createKeyword(kw)); }
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
VIEW                = kw:"VIEW"i                !ident_part { return loc(createKeyword(kw)); }
VIRTUAL             = kw:"VIRTUAL"i             !ident_part { return loc(createKeyword(kw)); }
VISIBLE             = kw:"VISIBLE"i             !ident_part { return loc(createKeyword(kw)); }
WAIT                = kw:"WAIT"i                !ident_part { return loc(createKeyword(kw)); }
WEEK                = kw:"WEEK"i                !ident_part { return loc(createKeyword(kw)); }
WHEN                = kw:"WHEN"i                !ident_part { return loc(createKeyword(kw)); }
WHERE               = kw:"WHERE"i               !ident_part { return loc(createKeyword(kw)); }
WINDOW              = kw:"WINDOW"i              !ident_part { return loc(createKeyword(kw)); }
WITH                = kw:"WITH"i                !ident_part { return loc(createKeyword(kw)); }
WORK                = kw:"WORK"i                !ident_part { return loc(createKeyword(kw)); }
WRITE               = kw:"WRITE"i               !ident_part { return loc(createKeyword(kw)); }
XOR                 = kw:"XOR"i                 !ident_part { return loc(createKeyword(kw)); }
YEAR                = kw:"YEAR"i                !ident_part { return loc(createKeyword(kw)); }
ZEROFILL            = kw:"ZEROFILL"i            !ident_part { return loc(createKeyword(kw)); }
