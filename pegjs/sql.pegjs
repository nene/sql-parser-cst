{
  /** Identity function */
  const identity = (x) => x;

  /** Extracts second item from array */
  const second = ([_, x]) => x;

  /** Last item in array */
  const last = (arr) => arr[arr.length-1];

  /** True when value is object */
  const isObject = (value) => typeof value === "object";

  /** Prefer undefined over null */
  const nullToUndefined = (value) => value === null ? undefined : value;

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

  function createBinaryExprChain(head, tail) {
    return tail.reduce(
      (left, [c1, op, c2, right]) => deriveLoc(createBinaryExpr(left, c1, op, c2, right)),
      head
    );
  }

  function createBinaryExpr(left, c1, op, c2, right) {
    return {
      type: 'binary_expr',
      operator: op,
      left: trailing(left, c1),
      right: leading(right, c2),
    };
  }

  function createUnaryExpr(op, c, right) {
    return {
      type: "unary_expr",
      operator: op,
      expr: leading(right, c),
    };
  }

  const createKeyword = (text) => ({ type: "keyword", text });

  const createKeywordList = (items) => {
    if (!items) {
      return undefined;
    }
    if (!(items instanceof Array)) {
      return [items];
    }
    const keywords = [];
    for (const it of items) {
      if (it instanceof Array) {
        keywords[keywords.length - 1] = trailing(keywords[keywords.length - 1], it);
      } else {
        keywords.push(it);
      }
    }
    return keywords;
  }

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
}

start
  = multiple_stmt

multiple_stmt
  = head:statement tail:(__ ";" __ statement)* {
    return readCommaSepList(head, tail);
  }

statement
  = union_stmt
  / drop_table_stmt
  / drop_index_stmt
  / create_table_stmt
  / create_index_stmt
  / create_db_stmt
  / create_view_stmt
  / truncate_stmt
  / rename_stmt
  / use_stmt
  / alter_table_stmt
  / lock_stmt
  / unlock_stmt
  / show_stmt
  / desc_stmt
  / update_stmt
  / replace_insert_stmt
  / insert_no_columns_stmt
  / insert_into_set
  / delete_stmt
  / empty_stmt

empty_stmt
  = c:__ {
    return trailing(loc({ type: "empty_statement" }), c);
  }

union_stmt
  = head:select_stmt tail:(__ UNION __ ALL? __ select_stmt)* (__ ob:order_by_clause)? (__ l:limit_clause)? {
    return head; // TODO
  }

column_order_list
  = head:column_order_item tail:(__ "," __ column_order_item)* {
    return "[Not implemented]";
  }

column_order_item
  = c:expr o:(ASC / DESC)? {
    return "[Not implemented]";
  }
  / column_order

column_order
  = c:column_ref __ o:(ASC / DESC)? {
    return "[Not implemented]";
  }
create_db_definition
  = head:create_option_character_set tail:(__ create_option_character_set)* {
    return "[Not implemented]";
  }

create_db_stmt
  = a:CREATE __
    k:(DATABASE / SCHEME) __
    ife:if_not_exists? __
    t:ident_name __
    c:create_db_definition? {
      return "[Not implemented]";
    }

view_with
  = WITH __ c:("CASCADED"i / "LOCAL"i) __ "CHECK"i __ "OPTION" {
    return "[Not implemented]";
  }
  / WITH __ "CHECK"i __ "OPTION" {
    return "[Not implemented]";
  }

create_view_stmt
  = a:CREATE __
  or:(OR __ REPLACE)? __
  al:("ALGORITHM"i __ "=" __ ("UNDEFINED"i / "MERGE"i / "TEMPTABLE"i))? __
  df:("DEFINER"i __ "=" __ ident)? __
  ss:("SQL"i __ "SECURITY"i __ ("DEFINER"i / "INVOKER"i))? __
  VIEW __ v:table_ref __ c:("(" __ column_list __ ")")? __
  AS __ s:select_stmt_nake __
  w:view_with? {
    return "[Not implemented]";
  }

create_index_stmt
  = a:CREATE __
  kw:(UNIQUE / FULLTEXT / SPATIAL)? __
  t:INDEX __
  n:ident __
  um:index_type? __
  on:ON __
  ta:table_ref __
  "(" __ cols:column_order_list __ ")" __
  io:index_options? __
  al:alter_algorithm? __
  lo:alter_lock? __ {
    return "[Not implemented]";
  }

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
    tmpKw:(c:__ kw:(TEMPORARY / TEMP) { return leading(kw, c); })?
    tableKw:(c:__ kw:TABLE { return leading(kw, c); })
    ifKw:(c:__ kw:if_not_exists { return leading(kw, c); })?
    table:(c1:__ t:table_ref c2:__ { return surrounding(c1, t, c2); })
    columns:create_table_definition
    __ table_options?
    __ (IGNORE / REPLACE)?
    __ AS?
    __ union_stmt? {
      return loc({
        type: "create_table_statement",
        createKw,
        temporaryKw: nullToUndefined(tmpKw),
        tableKw,
        ifNotExistsKw: nullToUndefined(ifKw),
        table,
        columns,
      });
    }

if_not_exists
  = kws:(IF __ NOT __ EXISTS) { return createKeywordList(kws); }

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
  = "(" c1:__ head:create_definition tail:(__ "," __ create_definition)* c2:__ ")" {
    return surrounding(c1, readCommaSepList(head, tail), c2);
  }

create_definition
  = create_constraint_definition
  / create_column_definition
  / create_index_definition
  / create_fulltext_spatial_index_definition

column_definition_opt
  = kws:(NOT __ NULL) {
    return loc({ type: "column_option_nullable", kw: createKeywordList(kws), value: false });
  }
  / kw:NULL {
    return loc({ type: "column_option_nullable", kw, value: true });
  }
  / kw:DEFAULT c:__ e:(literal / paren_expr) {
    return loc({ type: "column_option_default", kw, expr: leading(e, c) });
  }
  / kw:AUTO_INCREMENT {
    return loc({ type: "column_option_auto_increment", kw });
  }
  / kws:(UNIQUE __ KEY / UNIQUE / PRIMARY __ KEY / KEY) {
    return loc({ type: "column_option_key", kw: createKeywordList(kws) });
  }
  / column_option_comment
  / ca:collate_expr {
    return "[Not implemented]";
  }
  / cf:column_format {
    return "[Not implemented]";
  }
  / s:storage {
    return "[Not implemented]";
  }
  / re:reference_definition {
    return "[Not implemented]";
  }
  / ck:check_constraint_definition {
    return "[Not implemented]";
  }
  / t:create_option_character_set_kw __ s:"="? __ v:ident_name {
    return "[Not implemented]";
  }

column_definition_opt_list
  = head:column_definition_opt tail:(__ column_definition_opt)* {
    return readSpaceSepList(head, tail);
  }

create_column_definition
  = name:column_ref c1:__
    type:data_type
    options:(c:__ list:column_definition_opt_list { return leading(list, c); })? {
      return loc({
        type: "column_definition",
        name: trailing(name, c1),
        dataType: type,
        options: options || [],
      });
    }

column_option_comment
  = kw:COMMENT c:__ str:literal_string {
    return loc({
      type: "column_option_comment",
      kw,
      value: leading(str, c),
    });
  }

collate_expr
  = COLLATE __ s:"="? __ ca:ident_name {
    return "[Not implemented]";
  }
column_format
  = k:COLUMN_FORMAT __ f:(FIXED / DYNAMIC / DEFAULT) {
    return "[Not implemented]";
  }
storage
  = k:STORAGE __ s:(DISK / MEMORY) {
    return "[Not implemented]";
  }
drop_index_opt
  = head:(alter_algorithm / alter_lock) tail:(__ (alter_algorithm / alter_lock))* {
    return "[Not implemented]";
  }

if_exists
  = kws:(IF __ EXISTS) { return createKeywordList(kws); }

drop_table_stmt
  = dropKw:(kw:DROP c:__ { return trailing(kw, c); })
    temporaryKw:(kw:TEMPORARY c:__ { return trailing(kw, c); })?
    tableKw:(kw:TABLE c:__ { return trailing(kw, c); })
    ifExistsKw:(kw:if_exists c:__ { return trailing(kw, c); } )?
    tables:table_ref_list
    behaviorKw:(c:__ kw:(CASCADE / RESTRICT) { return leading(kw, c); })?
    {
      return loc({
        type: "drop_table_statement",
        dropKw,
        ...(temporaryKw ? {temporaryKw} : {}),
        tableKw,
        ...(ifExistsKw ? {ifExistsKw} : {}),
        tables,
        ...(behaviorKw ? {behaviorKw} : {}),
      });
    }

drop_index_stmt
  = a:DROP __
    r:INDEX __
    i:column_ref __
    ON __
    t:table_ref __
    op:drop_index_opt? __ {
      return "[Not implemented]";
    }

table_ref_list
  = head:table_ref tail:(__ "," __ table_ref)* {
    return readCommaSepList(head, tail);
  }

truncate_stmt
  = a:TRUNCATE  __
    kw:TABLE? __
    t:table_ref_list {
      return "[Not implemented]";
    }

use_stmt
  = USE  __
    d:ident {
      return "[Not implemented]";
    }

alter_table_stmt
  = ALTER  __
    TABLE __
    t:table_ref __
    e:alter_action_list {
      return "[Not implemented]";
    }

alter_action_list
  = head:alter_action tail:(__ "," __ alter_action)* {
      return "[Not implemented]";
    }

alter_action
  = alter_add_constraint
  / alter_drop_constraint
  / alter_drop_key
  / alter_enable_constraint
  / alter_disable_constraint
  / alter_add_column
  / alter_drop_column
  / alter_add_index_or_key
  / alter_add_fulletxt_sparital_index
  / alter_rename_column
  / alter_rename_table
  / alter_algorithm
  / alter_lock
  / alter_change_column
  / t:table_option {
    return "[Not implemented]";
  }

alter_add_column
  = ADD __
    kc:COLUMN? __
    cd:create_column_definition {
      return "[Not implemented]";
    }

alter_drop_column
  = DROP __
    kc:COLUMN? __
    c:column_ref {
      return "[Not implemented]";
    }

alter_add_index_or_key
  = ADD __
    id:create_index_definition {
      return "[Not implemented]";
    }

alter_rename_table
  = RENAME __
  kw:(TO / AS)? __
  tn:ident {
    return "[Not implemented]";
  }

alter_rename_column
  = RENAME __ COLUMN __ c:column_ref __
  kw:(TO / AS)? __
  tn:column_ref {
    return "[Not implemented]";
  }

alter_algorithm
  = "ALGORITHM"i __ s:"="? __ val:("DEFAULT"i / "INSTANT"i / "INPLACE"i / "COPY"i) {
    return "[Not implemented]";
  }

alter_lock
  = "LOCK"i __ s:"="? __ val:("DEFAULT"i / "NONE"i / "SHARED"i / "EXCLUSIVE"i) {
    return "[Not implemented]";
  }

alter_change_column
  = 'CHANGE'i __ kc:COLUMN? __ od:column_ref __ cd:create_column_definition __ fa:(('FIRST'i / 'AFTER'i) __ column_ref)? {
    return "[Not implemented]";
  }

alter_add_constraint
  = ADD __ c:create_constraint_definition {
    return "[Not implemented]";
  }

alter_drop_key
  = DROP __ 'PRIMARY'i __ KEY {
    return "[Not implemented]";
  }
  / DROP __ 'FOREIGN'i __ KEY __ c:ident_name {
    return "[Not implemented]";
  }

alter_drop_constraint
  = DROP __ kc:'CHECK'i __ c:ident_name {
    return "[Not implemented]";
  }

alter_enable_constraint
  = WITH __ 'CHECK'i __ 'CHECK'i __ CONSTRAINT __ c:ident_name {
    return "[Not implemented]";
  }

alter_disable_constraint
  = 'NOCHECK'i __ CONSTRAINT __ c:ident_name {
    return "[Not implemented]";
  }


create_index_definition
  = kc:(INDEX / KEY) __
    c:column? __
    t:index_type? __
    de:cte_columns_definition __
    id:index_options? __ {
      return "[Not implemented]";
    }

create_fulltext_spatial_index_definition
  = p: (FULLTEXT / SPATIAL) __
    kc:(INDEX / KEY)? __
    c:column? __
    de: cte_columns_definition __
    id: index_options? {
      return "[Not implemented]";
    }

create_constraint_definition
  = create_constraint_primary
  / create_constraint_unique
  / create_constraint_foreign
  / create_constraint_check

constraint_name
  = kc:CONSTRAINT __
  c:ident? {
    return "[Not implemented]";
  }

create_constraint_primary
  = kc:constraint_name? __
  p:(PRIMARY __ KEY) __
  t:index_type? __
  de:cte_columns_definition __
  id:index_options? {
    return "[Not implemented]";
  }

create_constraint_unique
  = kc:constraint_name? __
  u:UNIQUE __
  p:(INDEX / KEY)? __
  i:column? __
  t:index_type? __
  de:cte_columns_definition __
  id:index_options? {
    return "[Not implemented]";
  }

create_constraint_check
  = kc:constraint_name? __ u:CHECK __ nfr:(NOT __ FOR __ REPLICATION __)? "(" __ c:expr __ ")" {
    return "[Not implemented]";
  }

create_constraint_foreign
  = kc:constraint_name? __
  p:(FOREIGN KEY) __
  i:column? __
  de:cte_columns_definition __
  id:reference_definition? {
    return "[Not implemented]";
  }

check_constraint_definition
  = kc:constraint_name? __ u:CHECK __ "(" __ c:expr __ ")" __ ne:(NOT? __ ENFORCED)?  {
    return "[Not implemented]";
  }

reference_definition
  = kc:REFERENCES __
  t:table_ref_list __
  de:cte_columns_definition __
  m:(MATCH __ FULL / MATCH __ PARTIAL / MATCH __ SIMPLE)? __
  od:on_reference? __
  ou:on_reference? {
    return "[Not implemented]";
  }
  / oa:on_reference {
    return "[Not implemented]";
  }

on_reference
  = on_kw:ON __ kw:(DELETE / UPDATE) __ ro:reference_option {
    return "[Not implemented]";
  }
reference_option
  = kc:(RESTRICT / CASCADE / SET __ NULL / NO __ ACTION / SET __ DEFAULT / CURRENT_TIMESTAMP) {
    return "[Not implemented]";
  }

table_options
  = head:table_option tail:(__ ","? __ table_option)* {
    return "[Not implemented]";
  }

create_option_character_set_kw
  = CHARACTER __ SET {
    return "[Not implemented]";
  }
create_option_character_set
  = kw:DEFAULT? __ t:(create_option_character_set_kw / CHARSET / COLLATE) __ s:("=")? __ v:ident_name {
    return "[Not implemented]";
  }

table_option
  = kw:(AUTO_INCREMENT / AVG_ROW_LENGTH / KEY_BLOCK_SIZE / MAX_ROWS / MIN_ROWS / STATS_SAMPLE_PAGES) __ s:("=")? __ v:literal_numeric {
    return "[Not implemented]";
  }
  / create_option_character_set
  / kw:(COMMENT / CONNECTION) __ s:("=")? __ c:literal_string {
    return "[Not implemented]";
  }
  / kw:COMPRESSION __ s:("=")? __ v:("'"('ZLIB'i / 'LZ4'i / 'NONE'i)"'") {
    return "[Not implemented]";
  }
  / kw:ENGINE __ s:("=")? __ c:ident_name {
    return "[Not implemented]";
  }
  / kw:ROW_FORMAT __ s:("=")? __ c:(DEFAULT / DYNAMIC / FIXED / COMPRESSED / REDUNDANT / COMPACT) {
    return "[Not implemented]";
  }


alter_add_fulletxt_sparital_index
  = ADD __
    fsid:create_fulltext_spatial_index_definition {
      return "[Not implemented]";
    }

rename_stmt
  = RENAME  __
    TABLE __
    t:table_to_list {
      return "[Not implemented]";
    }

unlock_stmt
  = UNLOCK __ TABLES {
    return "[Not implemented]";
  }

lock_type
  = "READ"i __ s:("LOCAL"i)? {
    return "[Not implemented]";
  }
  / p:("LOW_PRIORITY"i)? __ "WRITE"i {
    return "[Not implemented]";
  }

lock_table
  = t:table_base __ lt:lock_type {
    return "[Not implemented]";
  }

lock_table_list
  = head:lock_table tail:(__ "," __ lock_table)* {
    return "[Not implemented]";
  }

lock_stmt
  = LOCK __ TABLES __ ltl:lock_table_list {
    return "[Not implemented]";
  }

show_stmt
  = SHOW __ t:('BINARY'i / 'MASTER'i) __ 'LOGS'i {
    return "[Not implemented]";
  }
  / SHOW __ 'BINLOG'i __ 'EVENTS'i __ ins:in_op_right? __ from: from_clause? __ limit: limit_clause? {
    return "[Not implemented]";
  }
  / SHOW __ k:(('CHARACTER'i __ 'SET'i) / 'COLLATION'i) __ e:(like_op_right / where_clause)? {
    return "[Not implemented]";
  }
  / SHOW __ CREATE __ VIEW __ t:table_ref {
    return "[Not implemented]";
  }
  / show_grant_stmt

show_grant_stmt
  = SHOW __ 'GRANTS'i __ f:show_grant_for? {
    return "[Not implemented]";
  }

show_grant_for
  = 'FOR'i __ n:ident __ h:("@" __ ident)? __ u:show_grant_for_using? {
    return "[Not implemented]";
  }

show_grant_for_using
  = USING __ l:show_grant_for_using_list {
    return "[Not implemented]";
  }

show_grant_for_using_list
  = head:ident tail:(__ "," __ ident)* {
    return "[Not implemented]";
  }

desc_stmt
  = (DESC / DESCRIBE) __ t:ident {
    return "[Not implemented]";
  }

select_stmt
  = select_stmt_nake
  / s:('(' __ select_stmt __ ')') {
      return "[Not implemented]";
    }

with_clause
  = withKw:WITH
    recursiveKw:(c:__ kw:RECURSIVE { return leading(kw, c) })?
    c:__ head:common_table_expression tail:(__ "," __ common_table_expression)* {
      return loc({
        type: "with_clause",
        withKw,
        recursiveKw: nullToUndefined(recursiveKw),
        tables: leading(readCommaSepList(head, tail), c),
      });
    }

common_table_expression
  = table:ident
    columns:(c:__ cols:cte_columns_definition { return {cols, c}; })?
    c1:__ asKw:AS
    opt:(c:__ op:cte_option { return leading(op, c); })?
    c2:__ select:cte_select {
      return loc({
        type: "common_table_expression",
        table: columns ? trailing(table, columns.c) : table,
        columns: columns ? columns.cols : [],
        asKw: leading(asKw, c1),
        optionKw: nullToUndefined(opt),
        expr: leading(select, c2),
      });
    }

cte_select
  = "(" c1:__ select:union_stmt c2:__ ")" {
    return loc(createParenExpr(c1, select, c2));
  }

cte_option
  = kws:(NOT __ MATERIALIZED) { return createKeywordList(kws); }
  / MATERIALIZED

cte_columns_definition
  = "(" c1:__ head:ident tail:(__ "," __ ident)* c2:__ ")" {
      return surrounding(c1, readCommaSepList(head, tail), c2);
    }

for_update
  = fu:('FOR'i __ UPDATE) {
    return "[Not implemented]";
  }

lock_in_share_mode
  = m:('LOCK'i __ 'IN'i __ 'SHARE'i __ 'MODE'i) {
    return "[Not implemented]";
  }

lock_option
  = w:('WAIT'i __ literal_numeric) { return "[Not implemented]"; }
  / nw:'NOWAIT'i
  / sl:('SKIP'i __ 'LOCKED'i) { return "[Not implemented]"; }

locking_read
  = t:(for_update / lock_in_share_mode) __ lo:lock_option? {
    return "[Not implemented]";
  }

select_stmt_nake
  = cte:(cls:with_clause c:__ { return trailing(cls, c); })?
    select:(c:__ cls:select_clause { return leading(cls, c); })
    otherClauses:(c:__ cls:other_clause { return leading(cls, c); })* {
      return loc({
        type: "select_statement",
        clauses: [cte, select, ...otherClauses].filter(identity),
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
  / locking_read
  / window_clause
  / into_clause

select_clause
  = selectKw:SELECT
    options:(c:__ kw:select_option { return leading(kw, c) })*
    columns:(c:__ cls:select_columns { return leading(cls, c) }) {
      return loc({
        type: "select_clause",
        selectKw,
        options,
        columns,
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
      return readCommaSepList(head, tail);
    }

fulltext_search_mode
  = IN __ 'NATURAL'i __ 'LANGUAGE'i __ 'MODE'i __ 'WITH'i __ 'QUERY'i __ 'EXPANSION'i  {
    return "[Not implemented]";
  }
  / IN __ 'NATURAL'i __ 'LANGUAGE'i __ 'MODE'i {
    return "[Not implemented]";
  }
  / IN __ 'BOOLEAN'i __ 'MODE'i {
    return "[Not implemented]";
  }
  / WITH __ 'QUERY'i __ 'EXPANSION'i {
    return "[Not implemented]";
  }

fulltext_search
  = 'MATCH'i __ "(" __ c:column_ref_list __ ")" __ 'AGAINST' __ "(" __ e:expr __ mo:fulltext_search_mode? __ ")" __ as:alias_clause? {
    return "[Not implemented]";
  }

column_list_item
  = fs:fulltext_search {
    return "[Not implemented]";
  }
  / star:star {
    return loc({
      type: "column_ref",
      column: star,
    });
  }
  / table:ident c1:__ "." c2:__ star:star {
    return  loc({
      type: "column_ref",
      table: trailing(table, c1),
      column: leading(star, c2),
    });
  }
  / expr:expr alias:(__ alias_clause)? {
    return loc(createAlias(expr, alias));
  }

star
  = "*" { return loc({ type: "all_columns" }) }

alias_clause
  = kw:AS c:__ id:alias_ident {
    return {
      asKw: kw,
      alias: leading(id, c),
    };
  }
  / id:alias_ident {
    return { alias: id };
  }

into_clause
  = INTO __ k:('OUTFILE'i / 'DUMPFILE'i)? __ f:(literal_string / ident) {
    return "[Not implemented]";
  }

from_clause
  = kw:FROM c:__ tables:table_join_list {
    return loc({
      type: "from_clause",
      fromKw: trailing(kw, c),
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
  t:("BTREE"i / "HASH"i) {
    return "[Not implemented]";
  }

index_options
  = head:index_option tail:(__ index_option)* {
    return "[Not implemented]";
  }

index_option
  = k:KEY_BLOCK_SIZE __ e:("=")? __ kbs:literal_numeric {
    return "[Not implemented]";
  }
  / index_type
  / "WITH"i __ "PARSER"i __ pn:ident_name {
    return "[Not implemented]";
  }
  / k:("VISIBLE"i / "INVISIBLE"i) {
    return "[Not implemented]";
  }
  / column_option_comment

table_join_list
  = head:table_base tail:_table_join* {
    return [head, ...tail];
  }

_table_join
  = c:__ join:table_join {
    return leading(join, c);
  }

table_join
  = "," c:__ table:table_base {
    return loc({
      type: "join",
      operator: ",",
      table: leading(table, c),
    });
  }
  / op:join_op c1:__ t:table_base spec:(c:__ j:join_specification { return leading(j, c) })? {
    return loc({
      type: "join",
      operator: op,
      table: leading(t, c1),
      specification: spec || undefined,
    });
  }

//NOTE that, the table assigned to `var` shouldn't write in `table_join`
table_base
  = DUAL {
    return "[Not implemented]";
  }
  / t:table_ref alias:(__ alias_clause)? {
    return loc(createAlias(t, alias));
  }
  / t:table_in_parens alias:(__ alias_clause)? {
    return loc(createAlias(t, alias));
  }
  / stmt:value_clause __ alias:alias_clause? {
    return "[Not implemented]";
  }
  / "(" __ stmt:value_clause __ ")" __ alias:alias_clause? {
    return "[Not implemented]";
  }
  / t:union_in_parens alias:(__ alias_clause)? {
    return loc(createAlias(t, alias));
  }

table_in_parens
  = "(" c1:__ t:table_ref c2:__ ")" {
    return loc(createParenExpr(c1, t, c2));
  }

union_in_parens
  = "(" c1:__ stmt:union_stmt c2:__ ")" {
    return loc(createParenExpr(c1, stmt, c2));
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
  = kw:NATURAL c:__ jt:join_type { return [trailing(kw, c), ...jt]; }

cross_join
  = kws:(CROSS __ JOIN) { return createKeywordList(kws); }

join_type
  = kws:(LEFT __ OUTER __ JOIN) { return createKeywordList(kws); }
  / kws:(LEFT __ JOIN) { return createKeywordList(kws); }
  / kws:(RIGHT __ OUTER __ JOIN) { return createKeywordList(kws); }
  / kws:(RIGHT __ JOIN) { return createKeywordList(kws); }
  / kws:(FULL __ OUTER __ JOIN) { return createKeywordList(kws); }
  / kws:(FULL __ JOIN) { return createKeywordList(kws); }
  / kws:(INNER __ JOIN) { return createKeywordList(kws); }
  / kw:JOIN { return createKeywordList([kw]); }

join_type$mysql
  = kws:(LEFT __ OUTER __ JOIN) { return createKeywordList(kws); }
  / kws:(LEFT __ JOIN) { return createKeywordList(kws); }
  / kws:(RIGHT __ OUTER __ JOIN) { return createKeywordList(kws); }
  / kws:(RIGHT __ JOIN) { return createKeywordList(kws); }
  / kws:(INNER __ JOIN) { return createKeywordList(kws); }
  / kw:JOIN { return createKeywordList([kw]); }

table_ref
  = db:ident c1:__ "." c2:__ t:ident {
    return loc({
      type: "table_ref",
      db: trailing(db, c1),
      table: leading(t, c2),
    });
  }
  / t:ident {
    return loc({
      type: "table_ref",
      table: t,
    });
  }

join_specification
  = using_clause / on_clause

using_clause
  = kw:USING c1:__ expr:using_clause_paren_expr {
    return loc({
      type: "join_using_specification",
      usingKw: kw,
      expr: leading(expr, c1),
    });
  }

using_clause_paren_expr
  = "(" c1:__ cols:using_clause_columns c2:__ ")" {
    return loc(createParenExpr(c1, cols, c2));
  }

using_clause_columns
  = head:plain_column_ref tail:(__ "," __ plain_column_ref)* {
     return loc({ type: "expr_list", items: readCommaSepList(head, tail) });
  }

plain_column_ref
  = col:column {
    return loc({ type: "column_ref", column: col });
  }

on_clause
  = kw:ON c:__ expr:expr {
    return loc({
      type: "join_on_specification",
      onKw: kw,
      expr: leading(expr, c),
    });
  }

where_clause
  = kw:WHERE c:__ expr:expr {
    return loc({
      type: "where_clause",
      whereKw: kw,
      expr: leading(expr, c),
    });
  }

group_by_clause
  = kws:(GROUP __ BY __) list:expr_list {
    return loc({
      type: "group_by_clause",
      groupByKw: createKeywordList(kws),
      columns: list.items,
    });
  }

column_ref_list
  = head:column_ref tail:(__ "," __ column_ref)* {
      return "[Not implemented]";
    }

having_clause
  = kw:HAVING c:__ expr:expr {
    return loc({
      type: "having_clause",
      havingKw: kw,
      expr: leading(expr, c),
    });
  }

partition_by_clause
  = kws:(PARTITION __ BY __) list:expr_list {
    return loc({
      type: "partition_by_clause",
      partitionByKw: createKeywordList(kws),
      specifications: list.items,
    });
  }

order_by_clause
  = kws:(ORDER __ BY __) l:order_by_list {
    return loc({
      type: "order_by_clause",
      orderByKw: createKeywordList(kws),
      specifications: l,
    });
  }

order_by_list
  = head:order_by_element tail:(__ "," __ order_by_element)* {
    return readCommaSepList(head, tail);
  }

order_by_element
  = e:expr c:__ orderKw:(DESC / ASC) {
    return loc({
      type: "sort_specification",
      expr: trailing(e, c),
      orderKw,
    });
  }
  / e:expr {
    return loc({
      type: "sort_specification",
      expr: e,
    });
  }

limit_clause
  = kw:LIMIT c1:__ count:expr c2:__ offkw:OFFSET c3:__ offset:expr  {
    return loc({
      type: "limit_clause",
      limitKw: kw,
      count: surrounding(c1, count, c2),
      offsetKw: offkw,
      offset: leading(offset, c3),
    });
  }
  / kw:LIMIT c1:__ offset:expr c2:__ "," c3:__ count:expr  {
    return loc({
      type: "limit_clause",
      limitKw: kw,
      offset: surrounding(c1, offset, c2),
      count: leading(count, c3),
    });
  }
  / kw:LIMIT c:__ count:expr {
    return loc({ type: "limit_clause", limitKw: kw, count: leading(count, c) });
  }

update_stmt
  = UPDATE    __
    t:table_ref_list __
    SET       __
    l:set_list   __
    w:where_clause? __
    or:order_by_clause? __
    lc:limit_clause? {
      return "[Not implemented]";
    }

delete_stmt
  = DELETE    __
    t: table_ref_list? __
    f:from_clause __
    w:where_clause? __
    or:order_by_clause? __
    l:limit_clause? {
      return "[Not implemented]";
    }

set_list
  = head:set_item tail:(__ "," __ set_item)* {
      return "[Not implemented]";
    }

/**
 * here only use `additive_expr` to support 'col1 = col1+2'
 * if you want to use lower operator, please use '()' like below
 * 'col1 = (col2 > 3)'
 */
set_item
  = tbl:(ident __ ".")? __ c:column __ '=' __ v:additive_expr {
    return "[Not implemented]";
  }

insert_value_clause
  = value_clause
  / select_stmt_nake

insert_partition
  = PARTITION __ "(" __ head:ident_name tail:(__ "," __ ident_name)* __ ")" {
    return "[Not implemented]";
  }
  / PARTITION __ v: value_item {
    return "[Not implemented]";
  }

replace_insert_stmt
  = ri:replace_insert       __
    ig:IGNORE?  __
    it:INTO? __
    t:table_ref  __
    p:insert_partition? __ "(" __ c:column_list  __ ")" __
    v:insert_value_clause __
    odp:on_duplicate_update_stmt? {
      return "[Not implemented]";
    }

insert_no_columns_stmt
  = ri:replace_insert __
    ig:IGNORE?  __
    it:INTO?   __
    t:table_ref  __
    p:insert_partition? __
    v:insert_value_clause __
    odp: on_duplicate_update_stmt? {
      return "[Not implemented]";
    }

insert_into_set
  = ri:replace_insert __
    INTO __
    t:table_ref  __
    p:insert_partition? __
    SET       __
    l:set_list   __
    odp:on_duplicate_update_stmt? {
      return "[Not implemented]";
    }

on_duplicate_update_stmt
  = ON __ 'DUPLICATE'i __ KEY __ UPDATE __ s:set_list {
    return "[Not implemented]";
  }

replace_insert
  = INSERT   { return "[Not implemented]"; }
  / REPLACE  { return "[Not implemented]"; }

value_clause
  = VALUES __ l:value_list  { return "[Not implemented]"; }

value_list
  = head:value_item tail:(__ "," __ value_item)* {
    return "[Not implemented]";
  }

value_item
  = 'ROW'i? __ "(" __ l:expr_list  __ ")" {
    return "[Not implemented]";
  }

/**
 * Data types
 */
data_type
  = kw:type_name c:__ params:type_params {
    return loc({ type: "data_type", nameKw: trailing(kw, c), params });
  }
  / kw:type_name {
    return loc({ type: "data_type", nameKw: kw });
  }

type_params
  = "(" c1:__ params:literal_list c2:__ ")" {
    return loc({
      type: "paren_expr",
      expr: surrounding(c1, params, c2),
    });
  }

literal_list
  = head:literal tail:(__ "," __ literal)* {
    return {
      type: "expr_list",
      items: readCommaSepList(head, tail),
    };
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
  / kws:(DOUBLE __ PRECISION) { return createKeywordList(kws); }
  / DOUBLE
  / REAL
  / BIT
  / JSON
  / ENUM
  / SET

/**
 * Expressions
 *
 * Operator precedence, as implemented currently (though incorrect)
 * ---------------------------------------------------------------------------------------------------
 * | -, ~, !                                                  | negation, bit inversion              |
 * | *, /, DIV, MOD                                           | multiplication, division             |
 * | +, -                                                     | addition, subtraction, concatenation |
 * | =, <, >, <=, >=, <>, !=, <=>, IS, LIKE, BETWEEN, IN      | comparion                            |
 * | NOT                                                      | logical negation                     |
 * | AND, &&                                                  | conjunction                          |
 * | XOR                                                      | exclusive or                         |
 * | OR, ||                                                   | disjunction                          |
 * ---------------------------------------------------------------------------------------------------
 */

expr
  = or_expr
  / union_stmt

or_expr
  = head:xor_expr tail:(__ or_op __ xor_expr)* {
    return createBinaryExprChain(head, tail);
  }

or_op = kw:OR / "||"

xor_expr
  = head:and_expr tail:(__ XOR __ and_expr)* {
    return createBinaryExprChain(head, tail);
  }

and_expr
  = head:not_expr tail:(__ and_op __ not_expr)* {
    return createBinaryExprChain(head, tail);
  }

and_op = kw:AND / "&&"

//here we should use `NOT` instead of `comparision_expr` to support chain-expr
not_expr
  = comparison_expr
  / exists_expr
  / kw:NOT c:__ expr:not_expr {
    return loc(createUnaryExpr(kw, c, expr));
  }

comparison_expr
  = head:additive_expr tail:(__ comparison_op_right)? {
    if (!tail) {
      return head;
    }
    const [c, right] = tail;
    if (right.kind === "arithmetic") {
      // overwrite the first comment (which never matches) in tail,
      // because the comment inside this rule matches first.
      right.tail[0][0] = c;
      return createBinaryExprChain(head, right.tail);
    }
    else if (right.kind === "between") {
      return loc({
        type: "between_expr",
        left: trailing(head, c),
        betweenKw: right.betweenKw,
        begin: right.begin,
        andKw: right.andKw,
        end: right.end,
      });
    }
    else {
      return loc(createBinaryExpr(head, c, right.op, right.c, right.right));
    }
  }
  / literal_string
  / column_ref

exists_expr
  = op:exists_op __ "(" __ stmt:union_stmt __ ")" {
    return "[Not implemented]";
  }

exists_op
  = nk:(NOT __ EXISTS) { return "[Not implemented]"; }
  / EXISTS

comparison_op_right
  = arithmetic_op_right
  / in_op_right
  / is_op_right
  / like_op_right
  / regexp_op_right
  / between_op_right

arithmetic_op_right
  = tail:(__ arithmetic_comparison_operator __ additive_expr)+ {
    return { kind: "arithmetic", tail };
  }

arithmetic_comparison_operator
  = "<=>" / ">=" / ">" / "<=" / "<>" / "<" / "=" / "!="

in_op_right
  = op:in_op c1:__ right:paren_expr_list {
    return {
      kind: "in",
      op,
      c: c1,
      right,
    };
  }
  / op:in_op c:__ right:(column_ref / literal_string) {
    return { kind: "in", op, c, right };
  }

in_op
  = kws:(NOT __ IN) { return createKeywordList(kws); }
  / kw:IN

is_op_right
  = kw:IS c:__ right:additive_expr {
    return { kind: "is", op: kw, c, right };
  }
  / kws:(IS __ NOT) c:__ right:additive_expr {
    return { kind: "is", op: createKeywordList(kws), c, right };
  }

like_op_right
  = op:like_op c:__ right:(literal / comparison_expr) {
    return { kind: "like", op, c, right };
  }

like_op
  = kws:(NOT __ LIKE) { return createKeywordList(kws); }
  / kw:LIKE

regexp_op_right
  = op:regexp_op c:__ b:'BINARY'i? __ right:(literal_string / column_ref) {
    return { kind: "regexp", op, c, right }; // TODO
  }

regexp_op
  = kws:(NOT __ (REGEXP / RLIKE)) {
    return createKeywordList(kws);
  }
  / REGEXP
  / RLIKE

between_op_right
  = betweenKw:between_op c1:__  begin:additive_expr c2:__ andKw:AND c3:__ end:additive_expr {
    return {
      kind: "between",
      betweenKw,
      begin: leading(begin, c1),
      andKw: leading(andKw, c2),
      end: leading(end, c3),
    };
  }

between_op
  = kws:(NOT __ BETWEEN) { return createKeywordList(kws); }
  / kw:BETWEEN { return createKeywordList([kw]); }

additive_expr
  = head: multiplicative_expr
    tail:(__ additive_operator  __ multiplicative_expr)* {
      return createBinaryExprChain(head, tail);
    }

additive_operator
  = "+" / "-"

multiplicative_expr
  = head:negation_expr
    tail:(__ multiplicative_operator  __ negation_expr)* {
      return createBinaryExprChain(head, tail);
    }

multiplicative_operator
  = "*" / "/" / "%" / '&' / '>>' / '<<' / '^' / '|' / op:DIV / op:MOD

negation_expr
  = primary
  / op:negation_operator c:__ right:negation_expr {
    return loc(createUnaryExpr(op, c, right));
  }

negation_operator = "-" / "~" / "!"

primary
  = cast_expr
  / literal
  / fulltext_search
  / func_call
  / case_expr
  / interval_expr
  / column_ref
  / paren_expr

paren_expr
  = "(" c1:__ expr:expr c2:__ ")" {
    return loc(createParenExpr(c1, expr, c2));
  }

paren_expr_list
  = "("  c2:__ list:expr_list c3:__ ")" {
    return loc(createParenExpr(c2, list, c3));
  }

expr_list
  = head:expr tail:(__ "," __ expr)* {
    return loc({ type: "expr_list", items: readCommaSepList(head, tail) });
  }

column_ref
  = tbl:(ident __ "." __)? col:column __ a:(("->>" / "->") __ (literal_string / literal_numeric))+ __ ca:collate_expr? {
    return "[Not implemented]";
  }
  / tbl:ident c1:__ "." c2:__ col:qualified_column {
    return loc({
      type: "column_ref",
      table: trailing(tbl, c1),
      column: leading(col, c2),
    });
  }
  / col:column {
    return loc({
      type: "column_ref",
      column: col,
    });
  }

column_list
  = head:column tail:(__ "," __ column)* {
    return "[Not implemented]";
  }

alias_ident
  = ident
  / s:literal_single_quoted_string { return loc(createIdentifier(s.text)); }
  / s:literal_double_quoted_string { return loc(createIdentifier(s.text)); }

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
  / str:literal_double_quoted_string { return loc(createIdentifier(str.text)); }

backticks_quoted_ident
  = q:"`" chars:([^`] / "``")+ "`" { return text(); }

bracket_quoted_ident
  = q:"[" chars:([^\]] / "]]")+ "]" { return text(); }

// Keywords can be used as column names when they are prefixed by table name, like tbl.update
qualified_column
  = name:ident_name {
    return loc(createIdentifier(name));
  }
  / quoted_ident

column
  = ident

ident_name
  = ident_start ident_part* { return text(); }
  / [0-9]+ ident_start ident_part* { return text(); }

ident_start = [A-Za-z_]

ident_part  = [A-Za-z0-9_]

window_clause
  = kw:WINDOW c:__ wins:named_window_list {
    return loc({
      type: "window_clause",
      windowKw: trailing(kw, c),
      namedWindows: wins,
    });
  }

named_window_list
  = head:named_window tail:(__ "," __ named_window)* {
    return readCommaSepList(head, tail);
  }

named_window
  = name:ident c1:__ kw:AS c2:__ def:window_definition_in_parens {
    return loc({
      type: "named_window",
      name: trailing(name, c1),
      asKw: trailing(kw, c2),
      window: def,
    });
  }

window_definition_in_parens
  = "(" c1:__ win:window_definition c2:__ ")" {
    return loc({
      type: "paren_expr",
      expr: surrounding(c1, win, c2),
    });
  }

window_definition
  = name:ident?
    partitionBy:(c:__ cls:partition_by_clause { return leading(cls, c); })?
    orderBy:(c:__ cls:order_by_clause { return leading(cls, c); })?
    frame:(c:__ cls:frame_clause { return leading(cls, c); })? {
      return loc({
        type: "window_definition",
        ...(name ? {baseWindowName: name} : {}),
        ...(partitionBy ? {partitionBy} : {}),
        ...(orderBy ? {orderBy} : {}),
        ...(frame ? {frame} : {}),
      });
    }

frame_clause
  = kw:frame_unit c1:__ extent:(frame_bound / frame_between)
    exclusion:(c:__ ex:frame_exclusion { return leading(ex, c); })? {
      return loc({
        type: "frame_clause",
        unitKw: kw,
        extent: leading(extent, c1),
        ...(exclusion ? {exclusion} : {}),
      });
    }

frame_unit
  = ROWS / RANGE

frame_unit$sqlite
  = ROWS / RANGE / GROUPS

frame_between
  = bKw:BETWEEN c1:__ begin:frame_bound c2:__ andKw:AND c3:__ end:frame_bound {
    return loc({
      type: "frame_between",
      betweenKw: bKw,
      begin: surrounding(c1, begin, c2),
      andKw,
      end: leading(end, c3),
    });
  }

frame_bound
  = kws:(CURRENT __ ROW) {
    return loc({ type: "frame_bound_current_row", currentRowKw: createKeywordList(kws) });
  }
  / expr:(frame_unbounded / literal) c:__ kw:PRECEDING {
    return loc({ type: "frame_bound_preceding", expr: trailing(expr, c), precedingKw: kw });
  }
  / expr:(frame_unbounded / literal) c:__ kw:FOLLOWING {
    return loc({ type: "frame_bound_following", expr: trailing(expr, c), followingKw: kw });
  }

frame_unbounded
  = kw:UNBOUNDED {
    return loc({ type: "frame_unbounded", unboundedKw: kw })
  }

frame_exclusion
  = kw:EXCLUDE c:__ kindKw:frame_exclusion_kind {
    return loc({
      type: "frame_exclusion",
      excludeKw: trailing(kw, c),
      kindKw
    });
  }

frame_exclusion_kind
  = kws:(CURRENT __ ROW) { return createKeywordList(kws); }
  / kws:(NO __ OTHERS) { return createKeywordList(kws); }
  / GROUP
  / TIES

func_call
  = name:func_name c1:__ args:func_args
    over:(c:__ o:over_arg { return leading(o, c); })? {
      return loc({
        type: "func_call",
        name: trailing(name, c1),
        args,
        ...(over ? {over} : {}),
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

func_args
  = "(" c1:__ args:func_args_list c2:__ ")" {
    return loc({
      type: "paren_expr",
      expr: surrounding(c1, args, c2),
    });
  }

func_args_list
  = head:func_1st_arg tail:(__ "," __ expr)* {
    return loc({
      type: "expr_list",
      items: readCommaSepList(head, tail)
    });
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
  / kw:DISTINCT c:__ e:expr {
    return loc({ type: "distinct_arg", distinctKw: kw, value: leading(e, c) });
  }
  / expr

over_arg
  = kw:OVER c:__ win:(window_definition_in_parens / ident) {
    return loc({
      type: "over_arg",
      overKw: trailing(kw, c),
      window: win,
    });
  }

cast_expr
  = kw:CAST c:__ args:cast_args_in_parens  {
    return loc({
      type: "cast_expr",
      castKw: kw,
      args: leading(args, c),
    });
  }

cast_args_in_parens
  = "(" c1:__ arg:cast_arg c2:__ ")" {
    return loc(createParenExpr(c1, arg, c2));
  }

cast_arg
  = e:expr c1:__ kw:AS c2:__ t:data_type {
    return loc({
      type: "cast_arg",
      expr: trailing(e, c1),
      asKw: kw,
      dataType: leading(t, c2),
    });
  }

case_expr
  = caseKw:CASE
    expr:(c:__ e:expr { return leading(e, c); })?
    clauses:(c:__ w:case_when { return leading(w, c); })+
    els:(c:__ e:case_else { return leading(e, c); })?
    endKw:(c:__ kw:END { return leading(kw, c); }) {
      return loc({
        type: "case_expr",
        caseKw,
        expr: nullToUndefined(expr),
        clauses: [...clauses, ...(els ? [els] : [])],
        endKw,
      });
    }

case_when
  = whenKw:WHEN c1:__ condition:expr c2:__ thenKw:THEN c3:__ result:expr {
    return loc({
      type: "case_when",
      whenKw,
      condition: surrounding(c1, condition, c2),
      thenKw,
      result: leading(result, c3),
    });
  }

case_else
  = kw:ELSE c:__ result:expr {
    return loc({
      type: "case_else",
      elseKw: kw,
      result: leading(result, c),
    });
  }

interval_expr
  = INTERVAL                    __
    e:expr                       __
    u: interval_unit {
      return "[Not implemented]";
    }

interval_unit
  = UNIT_YEAR
  / UNIT_MONTH
  / UNIT_DAY
  / UNIT_HOUR
  / UNIT_MINUTE
  / UNIT_SECOND

/**
 * Literals
 */
literal
  = b:'BINARY'i? __ s:literal_string ca:(__ collate_expr)? {
    return s; // TODO
  }
  / literal_numeric
  / literal_bool
  / literal_null
  / literal_datetime

literal_null
  = kw:NULL {
    return loc({ type: "null", text: kw.text });
  }

literal_bool
  = kw:TRUE {
    return loc({ type: "bool", text: kw.text });
  }
  / kw:FALSE {
    return loc({ type: "bool", text: kw.text});
  }

literal_string "string"
  = literal_hex_string
  / literal_bit_string
  / literal_hex_sequence
  / literal_single_quoted_string
  / literal_natural_charset_string

literal_string$mysql "string"
  = charset:charset_introducer c:__ string:literal_string_without_charset {
    return loc({
      type: "string_with_charset",
      charset,
      string: leading(string, c),
    });
  }
  / literal_string_without_charset
  / literal_natural_charset_string

literal_string_without_charset // for MySQL only
  = literal_hex_string
  / literal_bit_string
  / literal_hex_sequence
  / literal_single_quoted_string
  / literal_double_quoted_string

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
  = 'X'i "'" [0-9A-Fa-f]* "'" {
    return loc({
      type: 'string',
      text: text(),
    });
  }

literal_bit_string
  = 'b'i "'" [01]* "'" {
    return loc({
      type: 'string',
      text: text(),
    });
  }

literal_hex_sequence
  = '0x' [0-9A-Fa-f]* {
    return loc({
      type: 'string',
      text: text(),
    });
  }

literal_single_quoted_string
  = "'" single_quoted_char* "'" {
    return loc({
      type: 'string',
      text: text(),
    });
  }

literal_double_quoted_string
  = "\"" double_quoted_char* "\"" {
    return loc({
      type: 'string',
      text: text(),
    });
  }

literal_natural_charset_string
  = "N"i literal_single_quoted_string {
    return loc({
      type: 'string',
      text: text(),
    });
  }

literal_datetime
  = kw:(TIME / DATE / TIMESTAMP / DATETIME) c:__
    str:(literal_single_quoted_string / literal_double_quoted_string) {
      return loc({
        type: "datetime",
        kw,
        string: leading(str, c)
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

literal_numeric "number"
  = int frac? exp? !ident_start {
    return loc({
      type: 'number',
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

// All keywords (sorted alphabetically)
ACTION              = kw:"ACTION"i              !ident_part { return loc(createKeyword(kw)); }
ADD                 = kw:"ADD"i                 !ident_part { return loc(createKeyword(kw)); }
ADD_DATE            = kw:"ADDDATE"i             !ident_part { return loc(createKeyword(kw)); }
ALL                 = kw:"ALL"i                 !ident_part { return loc(createKeyword(kw)); }
ALTER               = kw:"ALTER"i               !ident_part { return loc(createKeyword(kw)); }
AND                 = kw:"AND"i                 !ident_part { return loc(createKeyword(kw)); }
AS                  = kw:"AS"i                  !ident_part { return loc(createKeyword(kw)); }
ASC                 = kw:"ASC"i                 !ident_part { return loc(createKeyword(kw)); }
AUTO_INCREMENT      = kw:"AUTO_INCREMENT"i      !ident_part { return loc(createKeyword(kw)); }
AVG                 = kw:"AVG"i                 !ident_part { return loc(createKeyword(kw)); }
AVG_ROW_LENGTH      = kw:"AVG_ROW_LENGTH"i      !ident_part { return loc(createKeyword(kw)); }
BETWEEN             = kw:"BETWEEN"i             !ident_part { return loc(createKeyword(kw)); }
BIGINT              = kw:"BIGINT"i              !ident_part { return loc(createKeyword(kw)); }
BINARY              = kw:"BINARY"i              !ident_part { return loc(createKeyword(kw)); }
BIT                 = kw:"BIT"i                 !ident_part { return loc(createKeyword(kw)); }
BLOB                = kw:"BLOB"i                !ident_part { return loc(createKeyword(kw)); }
BOOL                = kw:"BOOL"i                !ident_part { return loc(createKeyword(kw)); }
BOOLEAN             = kw:"BOOLEAN"i             !ident_part { return loc(createKeyword(kw)); }
BY                  = kw:"BY"i                  !ident_part { return loc(createKeyword(kw)); }
CALL                = kw:"CALL"i                !ident_part { return loc(createKeyword(kw)); }
CASCADE             = kw:"CASCADE"i             !ident_part { return loc(createKeyword(kw)); }
CASE                = kw:"CASE"i                !ident_part { return loc(createKeyword(kw)); }
CAST                = kw:"CAST"i                !ident_part { return loc(createKeyword(kw)); }
CHAR                = kw:"CHAR"i                !ident_part { return loc(createKeyword(kw)); }
CHARACTER           = kw:"CHARACTER"i           !ident_part { return loc(createKeyword(kw)); }
CHARSET             = kw:"CHARSET"i             !ident_part { return loc(createKeyword(kw)); }
CHECK               = kw:"CHECK"i               !ident_part { return loc(createKeyword(kw)); }
COLLATE             = kw:"COLLATE"i             !ident_part { return loc(createKeyword(kw)); }
COLUMN              = kw:"COLUMN"i              !ident_part { return loc(createKeyword(kw)); }
COLUMN_FORMAT       = kw:"COLUMN_FORMAT"i       !ident_part { return loc(createKeyword(kw)); }
COMMENT             = kw:"COMMENT"i             !ident_part { return loc(createKeyword(kw)); }
COMPACT             = kw:"COMPACT"i             !ident_part { return loc(createKeyword(kw)); }
COMPRESSED          = kw:"COMPRESSED"i          !ident_part { return loc(createKeyword(kw)); }
COMPRESSION         = kw:"COMPRESSION"i         !ident_part { return loc(createKeyword(kw)); }
CONNECTION          = kw:"CONNECTION"i          !ident_part { return loc(createKeyword(kw)); }
CONSTRAINT          = kw:"CONSTRAINT"i          !ident_part { return loc(createKeyword(kw)); }
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
DEC                 = kw:"DEC"i                 !ident_part { return loc(createKeyword(kw)); }
DECIMAL             = kw:"DECIMAL"i             !ident_part { return loc(createKeyword(kw)); }
DEFAULT             = kw:"DEFAULT"i             !ident_part { return loc(createKeyword(kw)); }
DELETE              = kw:"DELETE"i              !ident_part { return loc(createKeyword(kw)); }
DENSE_RANK          = kw:"DENSE_RANK"i          !ident_part { return loc(createKeyword(kw)); }
DESC                = kw:"DESC"i                !ident_part { return loc(createKeyword(kw)); }
DESCRIBE            = kw:"DESCRIBE"i            !ident_part { return loc(createKeyword(kw)); }
DISK                = kw:"DISK"i                !ident_part { return loc(createKeyword(kw)); }
DISTINCT            = kw:"DISTINCT"i            !ident_part { return loc(createKeyword(kw)); }
DISTINCTROW         = kw:"DISTINCTROW"i         !ident_part { return loc(createKeyword(kw)); }
DIV                 = kw:"DIV"i                 !ident_part { return loc(createKeyword(kw)); }
DOUBLE              = kw:"DOUBLE"i              !ident_part { return loc(createKeyword(kw)); }
DROP                = kw:"DROP"i                !ident_part { return loc(createKeyword(kw)); }
DUAL                = kw:"DUAL"i                !ident_part { return loc(createKeyword(kw)); }
DYNAMIC             = kw:"DYNAMIC"i             !ident_part { return loc(createKeyword(kw)); }
ELSE                = kw:"ELSE"i                !ident_part { return loc(createKeyword(kw)); }
END                 = kw:"END"i                 !ident_part { return loc(createKeyword(kw)); }
ENFORCED            = kw:"ENFORCED"i            !ident_part { return loc(createKeyword(kw)); }
ENGINE              = kw:"ENGINE"i              !ident_part { return loc(createKeyword(kw)); }
ENUM                = kw:"ENUM"i                !ident_part { return loc(createKeyword(kw)); }
EXCLUDE             = kw:"EXCLUDE"i             !ident_part { return loc(createKeyword(kw)); }
EXISTS              = kw:"EXISTS"i              !ident_part { return loc(createKeyword(kw)); }
EXPLAIN             = kw:"EXPLAIN"i             !ident_part { return loc(createKeyword(kw)); }
FALSE               = kw:"FALSE"i               !ident_part { return loc(createKeyword(kw)); }
FIRST_VALUE         = kw:"FIRST_VALUE"i         !ident_part { return loc(createKeyword(kw)); }
FIXED               = kw:"FIXED"i               !ident_part { return loc(createKeyword(kw)); }
FLOAT               = kw:"FLOAT"i               !ident_part { return loc(createKeyword(kw)); }
FOLLOWING           = kw:"FOLLOWING"i           !ident_part { return loc(createKeyword(kw)); }
FOR                 = kw:"FOR"i                 !ident_part { return loc(createKeyword(kw)); }
FOREIGN             = kw:"FOREIGN"i             !ident_part { return loc(createKeyword(kw)); }
FROM                = kw:"FROM"i                !ident_part { return loc(createKeyword(kw)); }
FULL                = kw:"FULL"i                !ident_part { return loc(createKeyword(kw)); }
FULLTEXT            = kw:"FULLTEXT"i            !ident_part { return loc(createKeyword(kw)); }
GLOBAL              = kw:"GLOBAL"i              !ident_part { return loc(createKeyword(kw)); }
GO                  = kw:"GO"i                  !ident_part { return loc(createKeyword(kw)); }
GROUP               = kw:"GROUP"i               !ident_part { return loc(createKeyword(kw)); }
GROUP_CONCAT        = kw:"GROUP_CONCAT"i        !ident_part { return loc(createKeyword(kw)); }
GROUPS              = kw:"GROUPS"i              !ident_part { return loc(createKeyword(kw)); }
HAVING              = kw:"HAVING"i              !ident_part { return loc(createKeyword(kw)); }
HIGH_PRIORITY       = kw:"HIGH_PRIORITY"i       !ident_part { return loc(createKeyword(kw)); }
IF                  = kw:"IF"i                  !ident_part { return loc(createKeyword(kw)); }
IGNORE              = kw:"IGNORE"i              !ident_part { return loc(createKeyword(kw)); }
IN                  = kw:"IN"i                  !ident_part { return loc(createKeyword(kw)); }
INDEX               = kw:"INDEX"i               !ident_part { return loc(createKeyword(kw)); }
INNER               = kw:"INNER"i               !ident_part { return loc(createKeyword(kw)); }
INSERT              = kw:"INSERT"i              !ident_part { return loc(createKeyword(kw)); }
INT                 = kw:"INT"i                 !ident_part { return loc(createKeyword(kw)); }
INTEGER             = kw:"INTEGER"i             !ident_part { return loc(createKeyword(kw)); }
INTERVAL            = kw:"INTERVAL"i            !ident_part { return loc(createKeyword(kw)); }
INTO                = kw:"INTO"i                !ident_part { return loc(createKeyword(kw)); }
IS                  = kw:"IS"i                  !ident_part { return loc(createKeyword(kw)); }
JOIN                = kw:"JOIN"i                !ident_part { return loc(createKeyword(kw)); }
JSON                = kw:"JSON"i                !ident_part { return loc(createKeyword(kw)); }
KEY                 = kw:"KEY"i                 !ident_part { return loc(createKeyword(kw)); }
KEY_BLOCK_SIZE      = kw:"KEY_BLOCK_SIZE"i      !ident_part { return loc(createKeyword(kw)); }
LAG                 = kw:"LAG"i                 !ident_part { return loc(createKeyword(kw)); }
LAST_VALUE          = kw:"LAST_VALUE"i          !ident_part { return loc(createKeyword(kw)); }
LEAD                = kw:"LEAD"i                !ident_part { return loc(createKeyword(kw)); }
LEFT                = kw:"LEFT"i                !ident_part { return loc(createKeyword(kw)); }
LIKE                = kw:"LIKE"i                !ident_part { return loc(createKeyword(kw)); }
LIMIT               = kw:"LIMIT"i               !ident_part { return loc(createKeyword(kw)); }
LOCAL               = kw:"LOCAL"i               !ident_part { return loc(createKeyword(kw)); }
LOCK                = kw:"LOCK"i                !ident_part { return loc(createKeyword(kw)); }
LONGBLOB            = kw:"LONGBLOB"i            !ident_part { return loc(createKeyword(kw)); }
LONGTEXT            = kw:"LONGTEXT"i            !ident_part { return loc(createKeyword(kw)); }
MATCH               = kw:"MATCH"i               !ident_part { return loc(createKeyword(kw)); }
MATERIALIZED        = kw:"MATERIALIZED"i        !ident_part { return loc(createKeyword(kw)); }
MAX                 = kw:"MAX"i                 !ident_part { return loc(createKeyword(kw)); }
MAX_ROWS            = kw:"MAX_ROWS"i            !ident_part { return loc(createKeyword(kw)); }
MEDIUMBLOB          = kw:"MEDIUMBLOB"i          !ident_part { return loc(createKeyword(kw)); }
MEDIUMTEXT          = kw:"MEDIUMTEXT"i          !ident_part { return loc(createKeyword(kw)); }
MEMORY              = kw:"MEMORY"i              !ident_part { return loc(createKeyword(kw)); }
MIN                 = kw:"MIN"i                 !ident_part { return loc(createKeyword(kw)); }
MIN_ROWS            = kw:"MIN_ROWS"i            !ident_part { return loc(createKeyword(kw)); }
MOD                 = kw:"MOD"i                 !ident_part { return loc(createKeyword(kw)); }
NATURAL             = kw:"NATURAL"i             !ident_part { return loc(createKeyword(kw)); }
NO                  = kw:"NO"i                  !ident_part { return loc(createKeyword(kw)); }
NOT                 = kw:"NOT"i                 !ident_part { return loc(createKeyword(kw)); }
NTH_VALUE           = kw:"NTH_VALUE"i           !ident_part { return loc(createKeyword(kw)); }
NTILE               = kw:"NTILE"i               !ident_part { return loc(createKeyword(kw)); }
NULL                = kw:"NULL"i                !ident_part { return loc(createKeyword(kw)); }
NUMERIC             = kw:"NUMERIC"i             !ident_part { return loc(createKeyword(kw)); }
OFFSET              = kw:"OFFSET"i              !ident_part { return loc(createKeyword(kw)); }
ON                  = kw:"ON"i                  !ident_part { return loc(createKeyword(kw)); }
OR                  = kw:"OR"i                  !ident_part { return loc(createKeyword(kw)); }
ORDER               = kw:"ORDER"i               !ident_part { return loc(createKeyword(kw)); }
OTHERS              = kw:"OTHERS"i              !ident_part { return loc(createKeyword(kw)); }
OUTER               = kw:"OUTER"i               !ident_part { return loc(createKeyword(kw)); }
OVER                = kw:"OVER"i                !ident_part { return loc(createKeyword(kw)); }
PARTIAL             = kw:"PARTIAL"i             !ident_part { return loc(createKeyword(kw)); }
PARTITION           = kw:"PARTITION"i           !ident_part { return loc(createKeyword(kw)); }
PERCENT_RANK        = kw:"PERCENT_RANK"i        !ident_part { return loc(createKeyword(kw)); }
PERSIST             = kw:"PERSIST"i             !ident_part { return loc(createKeyword(kw)); }
PERSIST_ONLY        = kw:"PERSIST_ONLY"i        !ident_part { return loc(createKeyword(kw)); }
PRECEDING           = kw:"PRECEDING"i           !ident_part { return loc(createKeyword(kw)); }
PRECISION           = kw:"PRECISION"i           !ident_part { return loc(createKeyword(kw)); }
PRIMARY             = kw:"PRIMARY"i             !ident_part { return loc(createKeyword(kw)); }
RANGE               = kw:"RANGE"i               !ident_part { return loc(createKeyword(kw)); }
RANK                = kw:"RANK"i                !ident_part { return loc(createKeyword(kw)); }
REAL                = kw:"REAL"i                !ident_part { return loc(createKeyword(kw)); }
RECURSIVE           = kw:"RECURSIVE"            !ident_part { return loc(createKeyword(kw)); }
REDUNDANT           = kw:"REDUNDANT"i           !ident_part { return loc(createKeyword(kw)); }
REFERENCES          = kw:"REFERENCES"i          !ident_part { return loc(createKeyword(kw)); }
REGEXP              = kw:"REGEXP"i              !ident_part { return loc(createKeyword(kw)); }
RENAME              = kw:"RENAME"i              !ident_part { return loc(createKeyword(kw)); }
REPLACE             = kw:"REPLACE"i             !ident_part { return loc(createKeyword(kw)); }
REPLICATION         = kw:"REPLICATION"i         !ident_part { return loc(createKeyword(kw)); }
RESTRICT            = kw:"RESTRICT"i            !ident_part { return loc(createKeyword(kw)); }
RETURN              = kw:'RETURN'i              !ident_part { return loc(createKeyword(kw)); }
RIGHT               = kw:"RIGHT"i               !ident_part { return loc(createKeyword(kw)); }
RLIKE               = kw:"RLIKE"i               !ident_part { return loc(createKeyword(kw)); }
ROW                 = kw:"ROW"i                 !ident_part { return loc(createKeyword(kw)); }
ROW_FORMAT          = kw:"ROW_FORMAT"i          !ident_part { return loc(createKeyword(kw)); }
ROW_NUMBER          = kw:"ROW_NUMBER"i          !ident_part { return loc(createKeyword(kw)); }
ROWS                = kw:"ROWS"i                !ident_part { return loc(createKeyword(kw)); }
SCHEME              = kw:"SCHEME"i              !ident_part { return loc(createKeyword(kw)); }
SELECT              = kw:"SELECT"i              !ident_part { return loc(createKeyword(kw)); }
SESSION             = kw:"SESSION"i             !ident_part { return loc(createKeyword(kw)); }
SESSION_USER        = kw:"SESSION_USER"i        !ident_part { return loc(createKeyword(kw)); }
SET                 = kw:"SET"i                 !ident_part { return loc(createKeyword(kw)); }
SHOW                = kw:"SHOW"i                !ident_part { return loc(createKeyword(kw)); }
SIGNED              = kw:"SIGNED"i              !ident_part { return loc(createKeyword(kw)); }
SIMPLE              = kw:"SIMPLE"i              !ident_part { return loc(createKeyword(kw)); }
SMALLINT            = kw:"SMALLINT"i            !ident_part { return loc(createKeyword(kw)); }
SPATIAL             = kw:"SPATIAL"i             !ident_part { return loc(createKeyword(kw)); }
SQL_BIG_RESULT      = kw:"SQL_BIG_RESULT"i      !ident_part { return loc(createKeyword(kw)); }
SQL_BUFFER_RESULT   = kw:"SQL_BUFFER_RESULT"i   !ident_part { return loc(createKeyword(kw)); }
SQL_CACHE           = kw:"SQL_CACHE"i           !ident_part { return loc(createKeyword(kw)); }
SQL_CALC_FOUND_ROWS = kw:"SQL_CALC_FOUND_ROWS"i !ident_part { return loc(createKeyword(kw)); }
SQL_NO_CACHE        = kw:"SQL_NO_CACHE"i        !ident_part { return loc(createKeyword(kw)); }
SQL_SMALL_RESULT    = kw:"SQL_SMALL_RESULT"i    !ident_part { return loc(createKeyword(kw)); }
STATS_SAMPLE_PAGES  = kw:"STATS_SAMPLE_PAGES"i  !ident_part { return loc(createKeyword(kw)); }
STORAGE             = kw:"STORAGE"i             !ident_part { return loc(createKeyword(kw)); }
STRAIGHT_JOIN       = kw:"STRAIGHT_JOIN"i       !ident_part { return loc(createKeyword(kw)); }
SUM                 = kw:"SUM"i                 !ident_part { return loc(createKeyword(kw)); }
SYSTEM_USER         = kw:"SYSTEM_USER"i         !ident_part { return loc(createKeyword(kw)); }
TABLE               = kw:"TABLE"i               !ident_part { return loc(createKeyword(kw)); }
TABLES              = kw:"TABLES"i              !ident_part { return loc(createKeyword(kw)); }
TEMP                = kw:"TEMP"i                !ident_part { return loc(createKeyword(kw)); }
TEMPORARY           = kw:"TEMPORARY"i           !ident_part { return loc(createKeyword(kw)); }
TEXT                = kw:"TEXT"i                !ident_part { return loc(createKeyword(kw)); }
THEN                = kw:"THEN"i                !ident_part { return loc(createKeyword(kw)); }
TIES                = kw:"TIES"i                !ident_part { return loc(createKeyword(kw)); }
TIME                = kw:"TIME"i                !ident_part { return loc(createKeyword(kw)); }
TIMESTAMP           = kw:"TIMESTAMP"i           !ident_part { return loc(createKeyword(kw)); }
TINYBLOB            = kw:"TINYBLOB"i            !ident_part { return loc(createKeyword(kw)); }
TINYINT             = kw:"TINYINT"i             !ident_part { return loc(createKeyword(kw)); }
TINYTEXT            = kw:"TINYTEXT"i            !ident_part { return loc(createKeyword(kw)); }
TO                  = kw:"TO"i                  !ident_part { return loc(createKeyword(kw)); }
TRUE                = kw:"TRUE"i                !ident_part { return loc(createKeyword(kw)); }
TRUNCATE            = kw:"TRUNCATE"i            !ident_part { return loc(createKeyword(kw)); }
UNBOUNDED           = kw:"UNBOUNDED"i           !ident_part { return loc(createKeyword(kw)); }
UNION               = kw:"UNION"i               !ident_part { return loc(createKeyword(kw)); }
UNIQUE              = kw:"UNIQUE"i              !ident_part { return loc(createKeyword(kw)); }
UNIT_DAY            = kw:"DAY"i                 !ident_part { return loc(createKeyword(kw)); }
UNIT_HOUR           = kw:"HOUR"i                !ident_part { return loc(createKeyword(kw)); }
UNIT_MINUTE         = kw:"MINUTE"i              !ident_part { return loc(createKeyword(kw)); }
UNIT_MONTH          = kw:"MONTH"i               !ident_part { return loc(createKeyword(kw)); }
UNIT_SECOND         = kw:"SECOND"i              !ident_part { return loc(createKeyword(kw)); }
UNIT_YEAR           = kw:"YEAR"i                !ident_part { return loc(createKeyword(kw)); }
UNLOCK              = kw:"UNLOCK"i              !ident_part { return loc(createKeyword(kw)); }
UNSIGNED            = kw:"UNSIGNED"i            !ident_part { return loc(createKeyword(kw)); }
UPDATE              = kw:"UPDATE"i              !ident_part { return loc(createKeyword(kw)); }
USE                 = kw:"USE"i                 !ident_part { return loc(createKeyword(kw)); }
USER                = kw:"USER"i                !ident_part { return loc(createKeyword(kw)); }
USING               = kw:"USING"i               !ident_part { return loc(createKeyword(kw)); }
VALUES              = kw:"VALUES"i              !ident_part { return loc(createKeyword(kw)); }
VARBINARY           = kw:"VARBINARY"i           !ident_part { return loc(createKeyword(kw)); }
VARCHAR             = kw:"VARCHAR"i             !ident_part { return loc(createKeyword(kw)); }
VIEW                = kw:"VIEW"i                !ident_part { return loc(createKeyword(kw)); }
WHEN                = kw:"WHEN"i                !ident_part { return loc(createKeyword(kw)); }
WHERE               = kw:"WHERE"i               !ident_part { return loc(createKeyword(kw)); }
WINDOW              = kw:"WINDOW"i              !ident_part { return loc(createKeyword(kw)); }
WITH                = kw:"WITH"i                !ident_part { return loc(createKeyword(kw)); }
XOR                 = kw:"XOR"i                 !ident_part { return loc(createKeyword(kw)); }
YEAR                = kw:"YEAR"i                !ident_part { return loc(createKeyword(kw)); }
ZEROFILL            = kw:"ZEROFILL"i            !ident_part { return loc(createKeyword(kw)); }
