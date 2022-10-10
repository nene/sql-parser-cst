{
  const reservedMap = {
    'ALTER': true,
    'ALL': true,
    'ADD': true,
    'AND': true,
    'AS': true,
    'ASC': true,
    'ANALYZE': true,
    'ACCESSIBLE': true,

    'BEFORE': true,
    'BETWEEN': true,
    'BIGINT': true,
    'BLOB': true,
    'BOTH': true,
    'BY': true,
    'BOOLEAN': true,

    'CALL': true,
    'CASCADE': true,
    'CASE': true,
    'CHAR': true,
    'CHECK': true,
    'COLLATE': true,
    // 'COLUMN': true,
    'CONDITION': true,
    'CONSTRAINT': true,
    'CONTINUE': true,
    'CONVERT': true,
    'CREATE': true,
    'CROSS': true,
    'CURRENT_DATE': true,
    'CURRENT_TIME': true,
    'CURRENT_TIMESTAMP': true,
    'CURRENT_USER': true,
    'CURSOR': true,

    'DATABASE': true,
    'DATABASES': true,
    'DAY_HOUR': true,
    'DAY_MICROSECOND': true,
    'DAY_MINUTE': true,
    'DAY_SECOND': true,
    'DEC': true,
    'DECIMAL': true,
    'DECLARE': true,
    'DEFAULT': true,
    'DELAYED': true,
    'DELETE': true,
    'DESC': true,
    'DESCRIBE': true,
    'DETERMINISTIC': true,
    'DISTINCT': true,
    'DISTINCTROW': true,
    'DIV': true,
    'DROP': true,
    'DOUBLE': true,
    'DUAL': true,

    'ELSE': true,
    'EACH': true,
    'ELSEIF': true,
    'ENCLOSED': true,
    'ESCAPED': true,
    'EXCEPT': true,
    'EXISTS': true,
    'EXIT': true,
    'EXPLAIN': true,

    'FALSE': true,
    'FULL': true,
    'FROM': true,
    'FETCH': true,
    'FLOAT': true,
    'FLOAT4': true,
    'FLOAT8': true,
    'FOR': true,
    'FORCE': true,
    'FOREIGN': true,
    'FULLTEXT': true,
    'FUNCTION': true,

    'GENERATED': true,
    'GET': true,
    'GO': true,
    'GRANT': true,
    'GROUP': true,
    'GROUPING': true,
    'GROUPS': true,

    'HAVING': true,
    'HIGH_PRIORITY': true,
    'HOUR_MICROSECOND': true,
    'HOUR_MINUTE': true,
    'HOUR_SECOND': true,

    // 'IF': true,
    'IGNORE': true,
    'IN': true,
    'INNER': true,
    'INFILE': true,
    'INOUT': true,
    'INSENSITIVE': true,
    'INSERT': true,
    'INT': true,
    'INT1': true,
    'INT2': true,
    'INT3': true,
    'INT4': true,
    'INT8': true,
    'INTEGER': true,
    'INTERVAL': true,
    'INTO': true,
    'IO_AFTER_GTIDS': true,
    'IO_BEFORE_GTIDS': true,
    'IS': true,
    'ITERATE': true,

    'JOIN': true,
    'JSON_TABLE': true,

    'KEY': true,
    'KEYS': true,
    'KILL': true,

    'LAG': true, // added in 8.0.2 (reserved)
    'LAST_VALUE': true,
    'LATERAL': true,
    'LEAD': true,
    'LEADING': true,
    'LEAVE': true,
    'LEFT': true,
    'LIKE': true,
    'LIMIT': true,
    'LINEAR': true,
    'LINES': true,
    'LOAD': true,
    'LOCALTIME': true,
    'LOCALTIMESTAMP': true,
    'LOCK': true,
    'LONG': true,
    'LONGBLOB': true,
    'LONGTEXT': true,
    'LOOP': true,
    'LOW_PRIORITY': true, // for lock table

    'MASTER_BIND': true,
    'MATCH': true,
    'MAXVALUE': true,
    'MEDIUMBLOB': true,
    'MEDIUMINT': true,
    'MEDIUMTEXT': true,
    'MIDDLEINT': true,
    'MINUTE_MICROSECOND': true,
    'MINUTE_SECOND': true,
    'MOD': true,
    'MODIFIES': true,


    'NATURAL': true,
    'NOT': true,
    'NO_WRITE_TO_BINLOG': true,
    'NTH_VALUE': true, // added in 8.0.2 (reserved)
    'NTILE': true, // added in 8.0.2 (reserved)
    'NULL': true,
    'NUMERIC': true,

    'OF': true, // added in 8.0.1 (reserved)
    'ON': true,
    'OPTIMIZE': true,
    'OPTIMIZER_COSTS': true,
    'OPTION': true,
    'OPTIONALLY': true,
    'OR': true,
    'ORDER': true,
    'OUT': true,
    'OUTER': true,
    'OUTFILE': true,
    'OVER': true, // added in 8.0.2 (reserved)

    'PARTITION': true,
    'PERCENT_RANK': true, // added in 8.0.2 (reserved)
    'PRECISION': true,
    'PRIMARY': true,
    'PROCEDURE': true,
    'PURGE': true,

    'RANGE': true,
    'RANK': true, // added in 8.0.2 (reserved)
    'READ': true, // for lock table
    'READS': true, // for lock table
    'READ_WRITE': true, // for lock table
    'REAL': true, // for lock table
    'RECURSIVE': true,
    'REFERENCES': true,
    'REGEXP': true,
    'RELEASE': true,
    'RENAME': true,
    'REPEAT': true,
    'REPLACE': true,
    'REQUIRE': true,
    'RESIGNAL': true,
    'RESTRICT': true,
    'RETURN': true,
    'REVOKE': true,
    'RIGHT': true,
    'RLIKE': true,
    'ROW': true, // // added in 8.0.2 (reserved)
    'ROWS': true, // // added in 8.0.2 (reserved)
    'ROW_NUMBER': true, // // added in 8.0.2 (reserved)

    'SCHEMA': true,
    'SCHEMAS': true,
    'SELECT': true,
    'SENSITIVE': true,
    'SEPARATOR': true,
    'SET': true,
    'SHOW': true,
    'SIGNAL': true,
    'SMALLINT': true,
    'SPATIAL': true,
    'SPECIFIC': true,
    'SQL': true,
    'SQLEXCEPTION': true,
    'SQLSTATE': true,
    'SQLWARNING': true,
    'SQL_BIG_RESULT': true,
    // 'SQL_CALC_FOUND_ROWS': true,
    // 'SQL_SMALL_RESULT': true,
    'SSL': true,
    'STARTING': true,
    'STORED': true,
    'STRAIGHT_JOIN': true,
    'SYSTEM': true,

    'TABLE': true,
    'TERMINATED': true,
    'THEN': true,
    'TINYBLOB': true,
    'TINYINT': true,
    'TINYTEXT': true,
    'TO': true,
    'TRAILING': true,
    'TRIGGER': true,
    'TRUE': true,

    'UNION': true,
    'UNIQUE': true,
    'UNLOCK': true,
    'UNSIGNED': true,
    'UPDATE': true,
    'USAGE': true,
    'USE': true,
    'USING': true,
    'UTC_DATE': true,
    'UTC_TIME': true,
    'UTC_TIMESTAMP': true,

    'VALUES': true,
    'VARBINARY': true,
    'VARCHAR': true,
    'VARCHARACTER': true,
    'VARYING': true,
    'VIRTUAL': true,

    'WHEN': true,
    'WHERE': true,
    'WHILE': true,
    'WINDOW': true, // added in 8.0.2 (reserved)
    'WITH': true,
    'WRITE': true, // for lock table

    'XOR': true,

    'YEAR_MONTH': true,

    'ZEROFILL': true,
  };

  /** Extracts second item from array */
  const second = ([_, x]) => x;

  /** True when value is object */
  const isObject = (value) => typeof value === "object";

  /** Attaches optional comments to AST node */
  const withComments = (node, { leading, trailing }) => {
    if (leading && leading.length) {
      node = {...node, leadingComments: leading};
    }
    if (trailing && trailing.length) {
      node = {...node, trailingComments: trailing};
    }
    return node;
  };
}

start
  = head:start_item __ tail:(__ KW_GO __ start_item)* {
    return head; // TODO
  }

start_item
  = __ n:(multiple_stmt / cmd_stmt / crud_stmt) {
    return n; // TODO
  }

cmd_stmt
  = drop_stmt
  / create_stmt
  / truncate_stmt
  / rename_stmt
  / call_stmt
  / use_stmt
  / alter_stmt
  / set_stmt
  / lock_stmt
  / unlock_stmt
  / show_stmt
  / desc_stmt

create_stmt
  = create_table_stmt
  / create_index_stmt
  / create_db_stmt
  / create_view_stmt

alter_stmt
  = alter_table_stmt

crud_stmt
  = union_stmt
  / update_stmt
  / replace_insert_stmt
  / insert_no_columns_stmt
  / insert_into_set
  / delete_stmt
  / cmd_stmt
  / proc_stmts

multiple_stmt
  = head:crud_stmt tail:(__ SEMICOLON __ crud_stmt)+ {
    return "[Not implemented]";
  }

union_stmt
  = head:select_stmt tail:(__ KW_UNION __ KW_ALL? __ select_stmt)* __ ob: order_by_clause? __ l:limit_clause? {
    return head; // TODO
  }

column_order_list
  = head:column_order_item tail:(__ COMMA __ column_order_item)* {
    return "[Not implemented]";
  }

column_order_item
  = c:expr o:(KW_ASC / KW_DESC)? {
    return "[Not implemented]";
  }
  / column_order

column_order
  = c:column_ref __ o:(KW_ASC / KW_DESC)? {
    return "[Not implemented]";
  }
create_db_definition
  = head:create_option_character_set tail:(__ create_option_character_set)* {
    return "[Not implemented]";
  }

create_db_stmt
  = a:KW_CREATE __
    k:(KW_DATABASE / KW_SCHEME) __
    ife:KW_IF_NOT_EXISTS? __
    t:ident_name __
    c:create_db_definition? {
      return "[Not implemented]";
    }

view_with
  = KW_WITH __ c:("CASCADED"i / "LOCAL"i) __ "CHECK"i __ "OPTION" {
    return "[Not implemented]";
  }
  / KW_WITH __ "CHECK"i __ "OPTION" {
    return "[Not implemented]";
  }

create_view_stmt
  = a:KW_CREATE __
  or:(KW_OR __ KW_REPLACE)? __
  al:("ALGORITHM"i __ KW_ASSIGIN_EQUAL __ ("UNDEFINED"i / "MERGE"i / "TEMPTABLE"i))? __
  df:("DEFINER"i __ KW_ASSIGIN_EQUAL __ ident)? __
  ss:("SQL"i __ "SECURITY"i __ ("DEFINER"i / "INVOKER"i))? __
  KW_VIEW __ v:table_name __ c:(LPAREN __ column_list __ RPAREN)? __
  KW_AS __ s:select_stmt_nake __
  w:view_with? {
    return "[Not implemented]";
  }

create_index_stmt
  = a:KW_CREATE __
  kw:(KW_UNIQUE / KW_FULLTEXT / KW_SPATIAL)? __
  t:KW_INDEX __
  n:ident __
  um:index_type? __
  on:KW_ON __
  ta:table_name __
  LPAREN __ cols:column_order_list __ RPAREN __
  io:index_options? __
  al:ALTER_ALGORITHM? __
  lo:ALTER_LOCK? __ {
    return "[Not implemented]";
  }

create_table_stmt
  = a:KW_CREATE __
    tp:KW_TEMPORARY? __
    KW_TABLE __
    ife:KW_IF_NOT_EXISTS? __
    t:table_name __
    lt:create_like_table {
      return "[Not implemented]";
    }
  / a:KW_CREATE __
    tp:KW_TEMPORARY? __
    KW_TABLE __
    ife:KW_IF_NOT_EXISTS? __
    t:table_name __
    c:create_table_definition? __
    to:table_options? __
    ir:(KW_IGNORE / KW_REPLACE)? __
    as:KW_AS? __
    qe:union_stmt? {
      return "[Not implemented]";
    }


create_like_table_simple
  = KW_LIKE __ t: table_ref_list {
    return "[Not implemented]";
  }

create_like_table
  = create_like_table_simple
  / LPAREN __ e:create_like_table  __ RPAREN {
    return "[Not implemented]";
  }

create_table_definition
  = LPAREN __ head:create_definition tail:(__ COMMA __ create_definition)* __ RPAREN {
    return "[Not implemented]";
  }

create_definition
  = create_constraint_definition
  / create_column_definition
  / create_index_definition
  / create_fulltext_spatial_index_definition

column_definition_opt
  = n:(literal_not_null / literal_null) {
    return "[Not implemented]";
  }
  / d:default_expr {
    return "[Not implemented]";
  }
  / a:('AUTO_INCREMENT'i) {
    return "[Not implemented]";
  }
  / u:(('UNIQUE'i __ ('KEY'i)?) / (('PRIMARY'i)? __ 'KEY'i)) {
    return "[Not implemented]";
  }
  / co:keyword_comment {
    return "[Not implemented]";
  }
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
  / t:create_option_character_set_kw __ s:KW_ASSIGIN_EQUAL? __ v:ident_name {
    return "[Not implemented]";
  }

column_definition_opt_list
  = head:column_definition_opt __ tail:(__ column_definition_opt)* {
    return "[Not implemented]";
  }

create_column_definition
  = c:column_ref __
    d:data_type __
    cdo:column_definition_opt_list? {
      return "[Not implemented]";
    }

collate_expr
  = KW_COLLATE __ s:KW_ASSIGIN_EQUAL? __ ca:ident_name {
    return "[Not implemented]";
  }
column_format
  = k:'COLUMN_FORMAT'i __ f:('FIXED'i / 'DYNAMIC'i / 'DEFAULT'i) {
    return "[Not implemented]";
  }
storage
  = k:'STORAGE'i __ s:('DISK'i / 'MEMORY'i) {
    return "[Not implemented]";
  }
default_expr
  = KW_DEFAULT __ ce: (literal / expr) {
    return "[Not implemented]";
  }
drop_index_opt
  = head:(ALTER_ALGORITHM / ALTER_LOCK) tail:(__ (ALTER_ALGORITHM / ALTER_LOCK))* {
    return "[Not implemented]";
  }
if_exists
  = 'if'i __ 'exists'i {
    return "[Not implemented]";
  }

drop_stmt
  = a:KW_DROP __
    r:KW_TABLE __
    ife: if_exists? __
    t:table_ref_list {
      return "[Not implemented]";
    }
  / a:KW_DROP __
    r:KW_INDEX __
    i:column_ref __
    KW_ON __
    t:table_name __
    op:drop_index_opt? __ {
      return "[Not implemented]";
    }

truncate_stmt
  = a:KW_TRUNCATE  __
    kw:KW_TABLE? __
    t:table_ref_list {
      return "[Not implemented]";
    }

use_stmt
  = KW_USE  __
    d:ident {
      return "[Not implemented]";
    }

alter_table_stmt
  = KW_ALTER  __
    KW_TABLE __
    t:table_name __
    e:alter_action_list {
      return "[Not implemented]";
    }

alter_action_list
  = head:alter_action tail:(__ COMMA __ alter_action)* {
      return "[Not implemented]";
    }

alter_action
  = ALTER_ADD_CONSTRAINT
  / ALTER_DROP_CONSTRAINT
  / ALTER_DROP_KEY
  / ALTER_ENABLE_CONSTRAINT
  / ALTER_DISABLE_CONSTRAINT
  / ALTER_ADD_COLUMN
  / ALTER_DROP_COLUMN
  / ALTER_ADD_INDEX_OR_KEY
  / ALTER_ADD_FULLETXT_SPARITAL_INDEX
  / ALTER_RENAME_COLUMN
  / ALTER_RENAME_TABLE
  / ALTER_ALGORITHM
  / ALTER_LOCK
  / ALTER_CHANGE_COLUMN
  / t:table_option {
    return "[Not implemented]";
  }

ALTER_ADD_COLUMN
  = KW_ADD __
    kc:KW_COLUMN? __
    cd:create_column_definition {
      return "[Not implemented]";
    }

ALTER_DROP_COLUMN
  = KW_DROP __
    kc:KW_COLUMN? __
    c:column_ref {
      return "[Not implemented]";
    }

ALTER_ADD_INDEX_OR_KEY
  = KW_ADD __
    id:create_index_definition {
      return "[Not implemented]";
    }

ALTER_RENAME_TABLE
  = KW_RENAME __
  kw:(KW_TO / KW_AS)? __
  tn:ident {
    return "[Not implemented]";
  }

ALTER_RENAME_COLUMN
  = KW_RENAME __ KW_COLUMN __ c:column_ref __
  kw:(KW_TO / KW_AS)? __
  tn:column_ref {
    return "[Not implemented]";
  }

ALTER_ALGORITHM
  = "ALGORITHM"i __ s:KW_ASSIGIN_EQUAL? __ val:("DEFAULT"i / "INSTANT"i / "INPLACE"i / "COPY"i) {
    return "[Not implemented]";
  }

ALTER_LOCK
  = "LOCK"i __ s:KW_ASSIGIN_EQUAL? __ val:("DEFAULT"i / "NONE"i / "SHARED"i / "EXCLUSIVE"i) {
    return "[Not implemented]";
  }

ALTER_CHANGE_COLUMN
  = 'CHANGE'i __ kc:KW_COLUMN? __ od:column_ref __ cd:create_column_definition __ fa:(('FIRST'i / 'AFTER'i) __ column_ref)? {
    return "[Not implemented]";
  }

ALTER_ADD_CONSTRAINT
  = KW_ADD __ c:create_constraint_definition {
    return "[Not implemented]";
  }

ALTER_DROP_KEY
  = KW_DROP __ 'PRIMARY'i __ KW_KEY {
    return "[Not implemented]";
  }
  / KW_DROP __ 'FOREIGN'i __ KW_KEY __ c:ident_name {
    return "[Not implemented]";
  }

ALTER_DROP_CONSTRAINT
  = KW_DROP __ kc:'CHECK'i __ c:ident_name {
    return "[Not implemented]";
  }

ALTER_ENABLE_CONSTRAINT
  = KW_WITH __ 'CHECK'i __ 'CHECK'i __ KW_CONSTRAINT __ c:ident_name {
    return "[Not implemented]";
  }

ALTER_DISABLE_CONSTRAINT
  = 'NOCHECK'i __ KW_CONSTRAINT __ c:ident_name {
    return "[Not implemented]";
  }


create_index_definition
  = kc:(KW_INDEX / KW_KEY) __
    c:column? __
    t:index_type? __
    de:cte_column_definition __
    id:index_options? __ {
      return "[Not implemented]";
    }

create_fulltext_spatial_index_definition
  = p: (KW_FULLTEXT / KW_SPATIAL) __
    kc:(KW_INDEX / KW_KEY)? __
    c:column? __
    de: cte_column_definition __
    id: index_options? {
      return "[Not implemented]";
    }

create_constraint_definition
  = create_constraint_primary
  / create_constraint_unique
  / create_constraint_foreign
  / create_constraint_check

constraint_name
  = kc:KW_CONSTRAINT __
  c:ident? {
    return "[Not implemented]";
  }

create_constraint_primary
  = kc:constraint_name? __
  p:('PRIMARY'i __ 'KEY'i) __
  t:index_type? __
  de:cte_column_definition __
  id:index_options? {
    return "[Not implemented]";
  }

create_constraint_unique
  = kc:constraint_name? __
  u:KW_UNIQUE __
  p:(KW_INDEX / KW_KEY)? __
  i:column? __
  t:index_type? __
  de:cte_column_definition __
  id:index_options? {
    return "[Not implemented]";
  }

create_constraint_check
  = kc:constraint_name? __ u:'CHECK'i __ nfr:('NOT'i __ 'FOR'i __ 'REPLICATION'i __)? LPAREN __ c:expr __ RPAREN {
    return "[Not implemented]";
  }

create_constraint_foreign
  = kc:constraint_name? __
  p:('FOREIGN KEY'i) __
  i:column? __
  de:cte_column_definition __
  id:reference_definition? {
    return "[Not implemented]";
  }

check_constraint_definition
  = kc:constraint_name? __ u:'CHECK'i __ LPAREN __ c:expr __ RPAREN __ ne:(KW_NOT? __ 'ENFORCED'i)?  {
    return "[Not implemented]";
  }

reference_definition
  = kc:KW_REFERENCES __
  t:table_ref_list __
  de:cte_column_definition __
  m:('MATCH FULL'i / 'MATCH PARTIAL'i / 'MATCH SIMPLE'i)? __
  od:on_reference? __
  ou:on_reference? {
    return "[Not implemented]";
  }
  / oa:on_reference {
    return "[Not implemented]";
  }

on_reference
  = on_kw:'ON'i __ kw: ('DELETE'i / 'UPDATE'i) __ ro:reference_option {
    return "[Not implemented]";
  }
reference_option
  = kc:('RESTRICT'i / 'CASCADE'i / 'SET NULL'i / 'NO ACTION'i / 'SET DEFAULT'i / KW_CURRENT_TIMESTAMP) {
    return "[Not implemented]";
  }

table_options
  = head:table_option tail:(__ COMMA? __ table_option)* {
    return "[Not implemented]";
  }

create_option_character_set_kw
  = 'CHARACTER'i __ 'SET'i {
    return "[Not implemented]";
  }
create_option_character_set
  = kw:KW_DEFAULT? __ t:(create_option_character_set_kw / 'CHARSET'i / 'COLLATE'i) __ s:(KW_ASSIGIN_EQUAL)? __ v:ident_name {
    return "[Not implemented]";
  }

table_option
  = kw:('AUTO_INCREMENT'i / 'AVG_ROW_LENGTH'i / 'KEY_BLOCK_SIZE'i / 'MAX_ROWS'i / 'MIN_ROWS'i / 'STATS_SAMPLE_PAGES'i) __ s:(KW_ASSIGIN_EQUAL)? __ v:literal_numeric {
    return "[Not implemented]";
  }
  / create_option_character_set
  / kw:(KW_COMMENT / 'CONNECTION'i) __ s:(KW_ASSIGIN_EQUAL)? __ c:literal_string {
    return "[Not implemented]";
  }
  / kw:'COMPRESSION'i __ s:(KW_ASSIGIN_EQUAL)? __ v:("'"('ZLIB'i / 'LZ4'i / 'NONE'i)"'") {
    return "[Not implemented]";
  }
  / kw:'ENGINE'i __ s:(KW_ASSIGIN_EQUAL)? __ c:ident_name {
    return "[Not implemented]";
  }
  / kw:'ROW_FORMAT'i __ s:(KW_ASSIGIN_EQUAL)? __ c:(KW_DEFAULT / 'DYNAMIC'i / 'FIXED'i / 'COMPRESSED'i / 'REDUNDANT'i / 'COMPACT'i) {
    return "[Not implemented]";
  }


ALTER_ADD_FULLETXT_SPARITAL_INDEX
  = KW_ADD __
    fsid:create_fulltext_spatial_index_definition {
      return "[Not implemented]";
    }

rename_stmt
  = KW_RENAME  __
    KW_TABLE __
    t:table_to_list {
      return "[Not implemented]";
    }

set_stmt
  = KW_SET __
  kw: (KW_GLOBAL / KW_SESSION / KW_LOCAL / KW_PERSIST / KW_PERSIST_ONLY)? __
  a: assign_stmt {
    return "[Not implemented]";
  }

unlock_stmt
  = KW_UNLOCK __ KW_TABLES {
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
  = head:lock_table tail:(__ COMMA __ lock_table)* {
    return "[Not implemented]";
  }

lock_stmt
  = KW_LOCK __ KW_TABLES __ ltl:lock_table_list {
    return "[Not implemented]";
  }

call_stmt
  = KW_CALL __
  e: proc_func_call {
    return "[Not implemented]";
  }

show_stmt
  = KW_SHOW __ t:('BINARY'i / 'MASTER'i) __ 'LOGS'i {
    return "[Not implemented]";
  }
  / KW_SHOW __ 'BINLOG'i __ 'EVENTS'i __ ins:in_op_right? __ from: from_clause? __ limit: limit_clause? {
    return "[Not implemented]";
  }
  / KW_SHOW __ k:(('CHARACTER'i __ 'SET'i) / 'COLLATION'i) __ e:(like_op_right / where_clause)? {
    return "[Not implemented]";
  }
  / KW_SHOW __ KW_CREATE __ KW_VIEW __ t:table_name {
    return "[Not implemented]";
  }
  / show_grant_stmt

show_grant_stmt
  = KW_SHOW __ 'GRANTS'i __ f:show_grant_for? {
    return "[Not implemented]";
  }

show_grant_for
  = 'FOR'i __ n:ident __ h:(KW_VAR__PRE_AT __ ident)? __ u:show_grant_for_using? {
    return "[Not implemented]";
  }

show_grant_for_using
  = KW_USING __ l:show_grant_for_using_list {
    return "[Not implemented]";
  }

show_grant_for_using_list
  = head:ident tail:(__ COMMA __ ident)* {
    return "[Not implemented]";
  }

desc_stmt
  = (KW_DESC / KW_DESCRIBE) __ t:ident {
    return "[Not implemented]";
  }

select_stmt
  = select_stmt_nake
  / s:('(' __ select_stmt __ ')') {
      return "[Not implemented]";
    }

with_clause
  = KW_WITH __ head:cte_definition tail:(__ COMMA __ cte_definition)* {
      return "[Not implemented]";
    }
  / __ KW_WITH __ KW_RECURSIVE __ cte:cte_definition {
      return "[Not implemented]";
    }

cte_definition
  = name:(literal_string / ident_name) __ columns:cte_column_definition? __ KW_AS __ LPAREN __ stmt:union_stmt __ RPAREN {
    return "[Not implemented]";
  }

cte_column_definition
  = LPAREN __ l:column_ref_index __ RPAREN {
      return "[Not implemented]";
    }

for_update
  = fu:('FOR'i __ KW_UPDATE) {
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
  = __ cte:with_clause? __ KW_SELECT ___
    opts:option_clause? __
    d:KW_DISTINCT?      __
    c:column_clause     __
    ci:into_clause?      __
    f:from_clause?      __
    fi:into_clause?      __
    w:where_clause?     __
    g:group_by_clause?  __
    h:having_clause?    __
    o:order_by_clause?  __
    l:limit_clause? __
    lr: locking_read? __
    win:window_clause? __
    li:into_clause? {
      // TODO
      return {
        type: "select",
        columns: c,
      };
  }

// MySQL extensions to standard SQL
option_clause
  = head:query_option tail:(__ query_option)* {
    return "[Not implemented]";
  }

query_option
  = option:(
        OPT_SQL_CALC_FOUND_ROWS
        / (OPT_SQL_CACHE / OPT_SQL_NO_CACHE)
        / OPT_SQL_BIG_RESULT
        / OPT_SQL_SMALL_RESULT
        / OPT_SQL_BUFFER_RESULT
    ) {
      return "[Not implemented]";
    }

column_clause
  = head: (KW_ALL / (STAR !ident_start) / STAR) tail:(__ COMMA __ column_list_item)* {
      return "[Not implemented]";
    }
  / head:column_list_item tail:(__ COMMA __ column_list_item)* {
      return [head]; // TODO
    }

fulltext_search_mode
  = KW_IN __ 'NATURAL'i __ 'LANGUAGE'i __ 'MODE'i __ 'WITH'i __ 'QUERY'i __ 'EXPANSION'i  {
    return "[Not implemented]";
  }
  / KW_IN __ 'NATURAL'i __ 'LANGUAGE'i __ 'MODE'i {
    return "[Not implemented]";
  }
  / KW_IN __ 'BOOLEAN'i __ 'MODE'i {
    return "[Not implemented]";
  }
  / KW_WITH __ 'QUERY'i __ 'EXPANSION'i {
    return "[Not implemented]";
  }

fulltext_search
  = 'MATCH'i __ LPAREN __ c:column_ref_list __ RPAREN __ 'AGAINST' __ LPAREN __ e:expr __ mo:fulltext_search_mode? __ RPAREN __ as:alias_clause? {
    return "[Not implemented]";
  }

column_list_item
  = fs:fulltext_search {
    return "[Not implemented]";
  }
  / tbl:(ident __ DOT)? __ STAR {
    return "[Not implemented]";
  }
  / a:assign_stmt {
    return "[Not implemented]";
  }
  / e:expr __ alias:alias_clause? {
    return e; // TODO
  }

alias_clause
  = KW_AS __ i:alias_ident { return "[Not implemented]"; }
  / KW_AS? __ i:ident { return "[Not implemented]"; }

into_clause
  = KW_INTO __ v:var_decl_list {
    return "[Not implemented]";
  }
  / KW_INTO __ k:('OUTFILE'i / 'DUMPFILE'i)? __ f:(literal_string / ident) {
    return "[Not implemented]";
  }

from_clause
  = KW_FROM __ l:table_ref_list { return "[Not implemented]"; }

table_to_list
  = head:table_to_item tail:(__ COMMA __ table_to_item)* {
    return "[Not implemented]";
  }

table_to_item
  = head:table_name __ KW_TO __ tail: (table_name) {
    return "[Not implemented]";
  }

index_type
  = KW_USING __
  t:("BTREE"i / "HASH"i) {
    return "[Not implemented]";
  }

index_options
  = head:index_option tail:(__ index_option)* {
    return "[Not implemented]";
  }

index_option
  = k:KW_KEY_BLOCK_SIZE __ e:(KW_ASSIGIN_EQUAL)? __ kbs:literal_numeric {
    return "[Not implemented]";
  }
  / index_type
  / "WITH"i __ "PARSER"i __ pn:ident_name {
    return "[Not implemented]";
  }
  / k:("VISIBLE"i / "INVISIBLE"i) {
    return "[Not implemented]";
  }
  / keyword_comment

table_ref_list
  = head:table_base
    tail:table_ref* {
      return "[Not implemented]";
    }

table_ref
  = __ COMMA __ t:table_base { return "[Not implemented]"; }
  / __ t:table_join { return "[Not implemented]"; }


table_join
  = op:join_op __ t:table_base __ KW_USING __ LPAREN __ head:ident_name tail:(__ COMMA __ ident_name)* __ RPAREN {
    return "[Not implemented]";
    }
  / op:join_op __ t:table_base __ expr:on_clause? {
    return "[Not implemented]";
    }

//NOTE that, the table assigned to `var` shouldn't write in `table_join`
table_base
  = KW_DUAL {
    return "[Not implemented]";
  }
  / t:table_name __ alias:alias_clause? {
    return "[Not implemented]";
  }
  / LPAREN __ t:table_name __ r:RPAREN __ alias:alias_clause? {
    return "[Not implemented]";
  }
  / stmt:value_clause __ alias:alias_clause? {
    return "[Not implemented]";
  }
  / LPAREN __ stmt:value_clause __ RPAREN __ alias:alias_clause? {
    return "[Not implemented]";
  }
  / LPAREN __ stmt:union_stmt __ RPAREN __ alias:alias_clause? {
    return "[Not implemented]";
  }

join_op
  = KW_LEFT __ KW_OUTER? __ KW_JOIN { return 'LEFT JOIN'; }
  / KW_RIGHT __ KW_OUTER? __ KW_JOIN { return 'RIGHT JOIN'; }
  / KW_FULL __ KW_OUTER? __ KW_JOIN { return 'FULL JOIN'; }
  / (KW_INNER __)? KW_JOIN { return 'INNER JOIN'; }

table_name
  = dt:ident tail:(__ DOT __ ident)? {
    return "[Not implemented]";
  }
  / v:var_decl {
    return "[Not implemented]";
  }

on_clause
  = KW_ON __ e:or_and_where_expr { return "[Not implemented]"; }

where_clause
  = KW_WHERE __ e:or_and_where_expr { return "[Not implemented]"; }

group_by_clause
  = KW_GROUP __ KW_BY __ e:expr_list { return "[Not implemented]"; }

column_ref_index
  = column_ref_list / literal_list

column_ref_list
  = head:column_ref tail:(__ COMMA __ column_ref)* {
      return "[Not implemented]";
    }

having_clause
  = KW_HAVING __ e:expr { return "[Not implemented]"; }

partition_by_clause
  = KW_PARTITION __ KW_BY __ bc:column_clause { return "[Not implemented]"; }

order_by_clause
  = KW_ORDER __ KW_BY __ l:order_by_list { return "[Not implemented]"; }

order_by_list
  = head:order_by_element tail:(__ COMMA __ order_by_element)* {
      return "[Not implemented]";
    }

order_by_element
  = e:expr __ d:(KW_DESC / KW_ASC)? {
    return "[Not implemented]";
  }

number_or_param
  = literal_numeric
  / param
  / '?' {
    return "[Not implemented]";
  }

limit_clause
  = KW_LIMIT __ i1:(number_or_param) __ tail:((COMMA / KW_OFFSET) __ number_or_param)? {
    return "[Not implemented]";
  }

update_stmt
  = KW_UPDATE    __
    t:table_ref_list __
    KW_SET       __
    l:set_list   __
    w:where_clause? __
    or:order_by_clause? __
    lc:limit_clause? {
      return "[Not implemented]";
    }

delete_stmt
  = KW_DELETE    __
    t: table_ref_list? __
    f:from_clause __
    w:where_clause? __
    or:order_by_clause? __
    l:limit_clause? {
      return "[Not implemented]";
    }

set_list
  = head:set_item tail:(__ COMMA __ set_item)* {
      return "[Not implemented]";
    }

/**
 * here only use `additive_expr` to support 'col1 = col1+2'
 * if you want to use lower operator, please use '()' like below
 * 'col1 = (col2 > 3)'
 */
set_item
  = tbl:(ident __ DOT)? __ c:column __ '=' __ v:additive_expr {
    return "[Not implemented]";
  }

insert_value_clause
  = value_clause
  / select_stmt_nake

insert_partition
  = KW_PARTITION __ LPAREN __ head:ident_name tail:(__ COMMA __ ident_name)* __ RPAREN {
    return "[Not implemented]";
  }
  / KW_PARTITION __ v: value_item {
    return "[Not implemented]";
  }

replace_insert_stmt
  = ri:replace_insert       __
    ig:KW_IGNORE?  __
    it:KW_INTO? __
    t:table_name  __
    p:insert_partition? __ LPAREN __ c:column_list  __ RPAREN __
    v:insert_value_clause __
    odp:on_duplicate_update_stmt? {
      return "[Not implemented]";
    }

insert_no_columns_stmt
  = ri:replace_insert __
    ig:KW_IGNORE?  __
    it:KW_INTO?   __
    t:table_name  __
    p:insert_partition? __
    v:insert_value_clause __
    odp: on_duplicate_update_stmt? {
      return "[Not implemented]";
    }

insert_into_set
  = ri:replace_insert __
    KW_INTO __
    t:table_name  __
    p:insert_partition? __
    KW_SET       __
    l:set_list   __
    odp:on_duplicate_update_stmt? {
      return "[Not implemented]";
    }

on_duplicate_update_stmt
  = KW_ON __ 'DUPLICATE'i __ KW_KEY __ KW_UPDATE __ s:set_list {
    return "[Not implemented]";
  }

replace_insert
  = KW_INSERT   { return "[Not implemented]"; }
  / KW_REPLACE  { return "[Not implemented]"; }

value_clause
  = KW_VALUES __ l:value_list  { return "[Not implemented]"; }

value_list
  = head:value_item tail:(__ COMMA __ value_item)* {
    return "[Not implemented]";
  }

value_item
  = 'ROW'i? __ LPAREN __ l:expr_list  __ RPAREN {
    return "[Not implemented]";
  }

expr_list
  = head:expr tail:(__ COMMA __ expr)* {
    return "[Not implemented]";
  }

interval_expr
  = KW_INTERVAL                    __
    e:expr                       __
    u: interval_unit {
      return "[Not implemented]";
    }

case_expr
  = KW_CASE                         __
    condition_list:case_when_then+  __
    otherwise:case_else?            __
    KW_END __ KW_CASE? {
      return "[Not implemented]";
    }
  / KW_CASE                         __
    expr:expr                      __
    condition_list:case_when_then+  __
    otherwise:case_else?            __
    KW_END __ KW_CASE? {
      return "[Not implemented]";
    }

case_when_then
  = KW_WHEN __ condition:or_and_where_expr __ KW_THEN __ result:expr {
    return "[Not implemented]";
  }

case_else = KW_ELSE __ result:expr {
    return "[Not implemented]";
  }

/**
 * Borrowed from PL/SQL ,the priority of below list IS ORDER BY DESC
 * ---------------------------------------------------------------------------------------------------
 * | +, -                                                     | identity, negation                   |
 * | *, /                                                     | multiplication, division             |
 * | +, -                                                     | addition, subtraction, concatenation |
 * | =, <, >, <=, >=, <>, !=, IS, LIKE, BETWEEN, IN           | comparion                            |
 * | !, NOT                                                   | logical negation                     |
 * | AND                                                      | conjunction                          |
 * | OR                                                       | inclusion                            |
 * ---------------------------------------------------------------------------------------------------
 */

expr
  = logic_operator_expr // support concatenation operator || and &&
  / or_expr
  / unary_expr
  / union_stmt

logic_operator_expr
  = head:primary tail:(__ LOGIC_OPERATOR __ primary)+ {
    return "[Not implemented]";
  }

unary_expr
  = op: additive_operator tail: (__ primary)+ {
    return "[Not implemented]";
  }

or_and_where_expr
	= head:expr tail:(__ (KW_AND / KW_OR / COMMA) __ expr)* {
    return "[Not implemented]";
  }

or_expr
  = head:and_expr tail:(___ KW_OR __ and_expr)* {
    return head; // TODO
  }

and_expr
  = head:not_expr tail:(___ KW_AND __ not_expr)* {
    return head; // TODO
  }
//here we should use `NOT` instead of `comparision_expr` to support chain-expr
not_expr
  = comparison_expr
  / exists_expr
  / (KW_NOT / "!" !"=") __ expr:not_expr {
    return "[Not implemented]";
  }

comparison_expr
  = left:additive_expr __ rh:comparison_op_right? {
    return left; // TODO
  }
  / literal_string
  / column_ref

exists_expr
  = op:exists_op __ LPAREN __ stmt:union_stmt __ RPAREN {
    return "[Not implemented]";
  }

exists_op
  = nk:(KW_NOT __ KW_EXISTS) { return "[Not implemented]"; }
  / KW_EXISTS

comparison_op_right
  = arithmetic_op_right
  / in_op_right
  / between_op_right
  / is_op_right
  / like_op_right
  / regexp_op_right

arithmetic_op_right
  = l:(__ arithmetic_comparison_operator __ additive_expr)+ {
    return "[Not implemented]";
  }

arithmetic_comparison_operator
  = ">=" / ">" / "<=" / "<>" / "<" / "=" / "!="

is_op_right
  = KW_IS __ right:additive_expr {
    return "[Not implemented]";
  }
  / (KW_IS __ KW_NOT) __ right:additive_expr {
    return "[Not implemented]";
  }

between_op_right
  = op:between_or_not_between_op __  begin:additive_expr __ KW_AND __ end:additive_expr {
    return "[Not implemented]";
  }

between_or_not_between_op
  = nk:(KW_NOT __ KW_BETWEEN) { return "[Not implemented]"; }
  / KW_BETWEEN

like_op
  = nk:(KW_NOT __ KW_LIKE) { return "[Not implemented]"; }
  / KW_LIKE

regexp_op
  = n: KW_NOT? __ k:(KW_REGEXP / KW_RLIKE) {
    return n ? `${n} ${k}` : k
  }
in_op
  = nk:(KW_NOT __ KW_IN) { return "[Not implemented]"; }
  / KW_IN

regexp_op_right
  = op:regexp_op __ b:'BINARY'i? __ e:(literal_string / column_ref) {
    return "[Not implemented]";
  }

like_op_right
  = op:like_op __ right:(literal / comparison_expr) {
    return "[Not implemented]";
  }

in_op_right
  = op:in_op __ LPAREN  __ l:expr_list __ RPAREN {
    return "[Not implemented]";
  }
  / op:in_op __ e:(var_decl / column_ref / literal_string) {
    return "[Not implemented]";
  }

additive_expr
  = head: multiplicative_expr
    tail:(__ additive_operator  __ multiplicative_expr)* {
      return head; // TODO
    }

additive_operator
  = "+" / "-" / "~"

multiplicative_expr
  = head:primary
    tail:(__ multiplicative_operator  __ primary)* {
      return head; // TODO
    }

multiplicative_operator
  = "*" / "/" / "%"
  / "div"i {
    return "[Not implemented]";
  }
  / '&' / '>>' / '<<' / '^' / '|' / '~'

primary
  = cast_expr
  / literal
  / fulltext_search
  / aggr_func
  / func_call
  / case_expr
  / interval_expr
  / column_ref
  / param
  / LPAREN __ list:or_and_where_expr __ RPAREN {
    return "[Not implemented]";
  }
  / var_decl
  / __ prepared_symbol:'?' {
    return "[Not implemented]";
  }

column_ref
  = tbl:(ident __ DOT __)? col:column __ a:((DOUBLE_ARROW / SINGLE_ARROW) __ (literal_string / literal_numeric))+ __ ca:collate_expr? {
    return "[Not implemented]";
  }
  / tbl:(ident_name / backticks_quoted_ident) __ DOT __ col:column_without_kw {
    return "[Not implemented]";
  }
  / col:column {
    return "[Not implemented]";
  }

column_list
  = head:column tail:(__ COMMA __ column)* {
    return "[Not implemented]";
  }

ident
  = name:ident_name !{ return reservedMap[name.toUpperCase()] === true; } {
    return "[Not implemented]";
  }
  / quoted_ident

alias_ident
  = name:ident_name !{
      if (reservedMap[name.toUpperCase()] === true) throw new Error("Error: "+ JSON.stringify(name)+" is a reserved word, can not as alias clause");
      return false
    } {
      return "[Not implemented]";
    }
  / name:quoted_ident {
      return "[Not implemented]";
    }

quoted_ident
  = double_quoted_ident
  / single_quoted_ident
  / backticks_quoted_ident

double_quoted_ident
  = q:'"' chars:[^"]+ '"' { return q + chars.join('') + q; }

single_quoted_ident
  = q:"'" chars:[^']+ "'" { return q + chars.join('') + q; }

backticks_quoted_ident
  = q:"`" chars:[^`]+ "`" { return q + chars.join('') + q; }

column_without_kw
  = name:column_name {
    return name;
  }
  / quoted_ident

column
  = name:column_name !{ return reservedMap[name.toUpperCase()] === true; } { return name; }
  / backticks_quoted_ident

column_name
  =  start:ident_start parts:column_part* { return start + parts.join(''); }

ident_name
  =  start:ident_start parts:ident_part* { return start + parts.join(''); }

ident_start = [A-Za-z_]

ident_part  = [A-Za-z0-9_]

// to support column name like `cf1:name` in hbase
column_part  = [A-Za-z0-9_:]

param
  = l:(':' ident_name) {
      return "[Not implemented]";
    }

aggr_func
  = aggr_fun_count
  / aggr_fun_smma

aggr_fun_smma
  = name:KW_SUM_MAX_MIN_AVG  __ LPAREN __ e:additive_expr __ RPAREN __ bc:over_partition? {
      return "[Not implemented]";
    }

KW_SUM_MAX_MIN_AVG
  = KW_SUM / KW_MAX / KW_MIN / KW_AVG

on_update_current_timestamp
  = KW_ON __ KW_UPDATE __ kw:KW_CURRENT_TIMESTAMP __ LPAREN __ l:expr_list? __ RPAREN{
    return "[Not implemented]";
  }
  / KW_ON __ KW_UPDATE __ kw:KW_CURRENT_TIMESTAMP {
    return "[Not implemented]";
  }

over_partition
  = 'OVER'i __ aws:as_window_specification {
    return "[Not implemented]";
  }
  / on_update_current_timestamp

window_clause
  = 'WINDOW'i __ l:named_window_expr_list {
    return "[Not implemented]";
  }

named_window_expr_list
  = head:named_window_expr tail:(__ COMMA __ named_window_expr)* {
    return "[Not implemented]";
  }

named_window_expr
  = nw:ident_name __ KW_AS __ anw:as_window_specification {
    return "[Not implemented]";
  }

as_window_specification
  = ident_name
  / LPAREN __ ws:window_specification? __ RPAREN {
    return "[Not implemented]";
  }

window_specification
  = bc:partition_by_clause? __ l:order_by_clause? __ w:window_frame_clause? {
    return "[Not implemented]";
  }

window_specification_frameless
  = bc:partition_by_clause? __
  l:order_by_clause? {
    return "[Not implemented]";
  }

window_frame_clause
  = kw:KW_ROWS __ s:(window_frame_following / window_frame_preceding) {
    return "[Not implemented]";
  }
  / KW_ROWS __ KW_BETWEEN __ p:window_frame_preceding __ KW_AND __ f:window_frame_following {
    return "[Not implemented]";
  }

window_frame_following
  = s:window_frame_value __ 'FOLLOWING'i  {
    return "[Not implemented]";
  }
  / window_frame_current_row

window_frame_preceding
  = s:window_frame_value __ 'PRECEDING'i  {
    return "[Not implemented]";
  }
  / window_frame_current_row

window_frame_current_row
  = 'CURRENT'i __ 'ROW'i {
    return "[Not implemented]";
  }

window_frame_value
  = s:'UNBOUNDED'i {
    return "[Not implemented]";
  }
  / literal_numeric

aggr_fun_count
  = name:(KW_COUNT / KW_GROUP_CONCAT) __ LPAREN __ arg:count_arg __ RPAREN __ bc:over_partition? {
    return "[Not implemented]";
  }

count_arg
  = e:star_expr {
    return "[Not implemented]";
  }
  / d:KW_DISTINCT? __ LPAREN __ c:expr __ RPAREN __ or:order_by_clause? {
    return "[Not implemented]";
  }
  / d:KW_DISTINCT? __ c:primary __ or:order_by_clause? {
    return "[Not implemented]";
  }

star_expr
  = "*" { return "[Not implemented]"; }

convert_args
  = c:(column_ref / literal_string) __ COMMA __ ch:character_string_type  __ cs:create_option_character_set_kw __ v:ident_name {
    return "[Not implemented]";
  }
  / c:(column_ref / literal_string) __ COMMA __ d:data_type {
    return "[Not implemented]";
  }
  / c:(column_ref / literal_string) __ KW_USING __ d:ident_name {
    return "[Not implemented]";
  }

trim_position
  = 'BOTH'i / 'LEADING'i / 'TRAILING'i

trim_rem
  = p:trim_position? __ rm:literal_string? __ k:KW_FROM {
    return "[Not implemented]";
  }

trim_func_clause
  = 'trim'i __ LPAREN __ tr:trim_rem? __ s:expr __ RPAREN {
    return "[Not implemented]";
  }
func_call
  = trim_func_clause
  / 'convert'i __ LPAREN __ l:convert_args __ RPAREN __ ca:collate_expr? {
    return "[Not implemented]";
  }
  / name:proc_func_name __ LPAREN __ l:or_and_where_expr? __ RPAREN __ bc:over_partition? {
    return "[Not implemented]";
  }
  / name:scalar_func __ LPAREN __ l:expr_list? __ RPAREN __ bc:over_partition? {
    return "[Not implemented]";
  }
  / f:KW_CURRENT_TIMESTAMP __ up:on_update_current_timestamp? {
    return "[Not implemented]";
  }

scalar_func
  = KW_CURRENT_DATE
  / KW_CURRENT_TIME
  / KW_CURRENT_TIMESTAMP
  / KW_CURRENT_USER
  / KW_USER
  / KW_SESSION_USER
  / KW_SYSTEM_USER

cast_expr
  = KW_CAST __ LPAREN __ e:expr __ KW_AS __ ch:character_string_type  __ cs:create_option_character_set_kw __ v:ident_name __ RPAREN __ ca:collate_expr? {
    return "[Not implemented]";
  }
  / KW_CAST __ LPAREN __ e:expr __ KW_AS __ t:data_type __ RPAREN {
    return "[Not implemented]";
  }
  / KW_CAST __ LPAREN __ e:expr __ KW_AS __ KW_DECIMAL __ LPAREN __ precision:int __ RPAREN __ RPAREN {
    return "[Not implemented]";
  }
  / KW_CAST __ LPAREN __ e:expr __ KW_AS __ KW_DECIMAL __ LPAREN __ precision:int __ COMMA __ scale:int __ RPAREN __ RPAREN {
    return "[Not implemented]";
  }
  / KW_CAST __ LPAREN __ e:expr __ KW_AS __ s:signedness __ t:KW_INTEGER? __ RPAREN { /* MySQL cast to un-/signed integer */
    return "[Not implemented]";
  }

signedness
  = KW_SIGNED
  / KW_UNSIGNED

literal
  = b:'BINARY'i? __ s:literal_string ca:(__ collate_expr)? {
    return s; // TODO
  }
  / literal_numeric
  / literal_bool
  / literal_null
  / literal_datetime

literal_list
  = head:literal tail:(__ COMMA __ literal)* {
    return "[Not implemented]";
  }

literal_null
  = text:KW_NULL {
    return { type: "null", text };
  }

literal_not_null
  = KW_NOT_NULL {
    return "[Not implemented]";
  }

literal_bool
  = text:KW_TRUE {
    return { type: "bool", text };
  }
  / text:KW_FALSE {
    return { type: "bool", text };
  }

literal_string
  = charset:charset_introducer c:__ string:literal_string_without_charset {
    return {
      type: "string_with_charset",
      charset,
      string: withComments(string, { leading: c }),
    };
  }
  / literal_string_without_charset

charset_introducer
  = "_" cs:charset_name !ident_start { return cs; }

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

literal_string_without_charset
  = literal_hex_string
  / literal_bit_string
  / literal_hex_sequence
  / literal_single_quoted_string
  / literal_double_quoted_string

literal_hex_string
  = r:'X'i ca:("'" [0-9A-Fa-f]* "'") {
    return {
      type: 'string',
      text: `${r}'${ca[1].join('')}'`
    };
  }

literal_bit_string
  = r:'b'i ca:("'" [01]* "'") {
    return {
      type: 'string',
      text: `${r}'${ca[1].join('')}'`
    };
  }

literal_hex_sequence
  = r:'0x' ca:([0-9A-Fa-f]*) {
    return {
      type: 'string',
      text: `${r}${ca.join('')}`
    };
  }

literal_single_quoted_string
  = ca:("'" single_quoted_char* "'") {
    return {
      type: 'string',
      text: `'${ca[1].join('')}'`
    };
  }

literal_double_quoted_string
  = ca:("\"" double_quoted_char* "\"") {
    return {
      type: 'string',
      text: `"${ca[1].join('')}"`
    };
  }

literal_datetime
  = kw:(KW_TIME / KW_DATE / KW_TIMESTAMP / KW_DATETIME) c:__
    str:(literal_single_quoted_string / literal_double_quoted_string) {
      return {
        type: "datetime",
        kw: { type: "keyword", text: kw },
        string: withComments(str, { leading: c })
      };
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

line_terminator
  = [\n\r]

literal_numeric
  = nr:(int frac? exp?) {
    return {
      type: 'number',
      text: nr.join('')
    };
  }

int
  = digits
  / digit:digit
  / op:("-" / "+" ) digits:digits { return "-" + digits; }
  / op:("-" / "+" ) digit:digit { return "-" + digit; }

frac
  = "." digits:digits { return "." + digits; }

exp
  = e:e digits:digits { return e + digits; }

digits
  = digits:digit+ { return digits.join(""); }

digit = [0-9]

hexDigit
  = [0-9a-fA-F]

e
  = e:[eE] sign:[+-]? { return e + (sign !== null ? sign: ''); }


KW_NULL     = kw:"NULL"i       !ident_start { return kw; }
KW_DEFAULT  = kw:"DEFAULT"i    !ident_start { return kw; }
KW_NOT_NULL = kw:"NOT NULL"i   !ident_start { return kw; }
KW_TRUE     = kw:"TRUE"i       !ident_start { return kw; }
KW_TO       = kw:"TO"i         !ident_start { return kw; }
KW_FALSE    = kw:"FALSE"i      !ident_start { return kw; }

KW_SHOW     = kw:"SHOW"i       !ident_start { return kw; }
KW_DROP     = kw:"DROP"i       !ident_start { return kw; }
KW_USE      = kw:"USE"i        !ident_start { return kw; }
KW_ALTER    = kw:"ALTER"i      !ident_start { return kw; }
KW_SELECT   = kw:"SELECT"i     !ident_start { return kw; }
KW_UPDATE   = kw:"UPDATE"i     !ident_start { return kw; }
KW_CREATE   = kw:"CREATE"i     !ident_start { return kw; }
KW_TEMPORARY = kw:"TEMPORARY"i !ident_start { return kw; }
KW_IF_NOT_EXISTS = kw:"IF NOT EXISTS"i !ident_start { return kw; }
KW_DELETE   = kw:"DELETE"i     !ident_start { return kw; }
KW_INSERT   = kw:"INSERT"i     !ident_start { return kw; }
KW_RECURSIVE= kw:"RECURSIVE"   !ident_start { return kw; }
KW_REPLACE  = kw:"REPLACE"i    !ident_start { return kw; }
KW_RENAME   = kw:"RENAME"i     !ident_start { return kw; }
KW_IGNORE   = kw:"IGNORE"i     !ident_start { return kw; }
KW_EXPLAIN  = kw:"EXPLAIN"i    !ident_start { return kw; }
KW_PARTITION = kw:"PARTITION"i !ident_start { return kw; }

KW_INTO     = kw:"INTO"i       !ident_start { return kw; }
KW_FROM     = kw:"FROM"i       !ident_start { return kw; }
KW_SET      = kw:"SET"i        !ident_start { return kw; }
KW_UNLOCK   = kw:"UNLOCK"i     !ident_start { return kw; }
KW_LOCK     = kw:"LOCK"i       !ident_start { return kw; }

KW_AS       = kw:"AS"i         !ident_start { return kw; }
KW_TABLE    = kw:"TABLE"i      !ident_start { return kw; }
KW_TABLES    = kw:"TABLES"i      !ident_start { return kw; }
KW_DATABASE = kw:"DATABASE"i      !ident_start { return kw; }
KW_SCHEME   = kw:"SCHEME"i      !ident_start { return kw; }
KW_COLLATE  = kw:"COLLATE"i    !ident_start { return kw; }

KW_ON       = kw:"ON"i       !ident_start { return kw; }
KW_LEFT     = kw:"LEFT"i     !ident_start { return kw; }
KW_RIGHT    = kw:"RIGHT"i    !ident_start { return kw; }
KW_FULL     = kw:"FULL"i     !ident_start { return kw; }
KW_INNER    = kw:"INNER"i    !ident_start { return kw; }
KW_JOIN     = kw:"JOIN"i     !ident_start { return kw; }
KW_OUTER    = kw:"OUTER"i    !ident_start { return kw; }
KW_OVER     = kw:"OVER"i     !ident_start { return kw; }
KW_UNION    = kw:"UNION"i    !ident_start { return kw; }
KW_VALUES   = kw:"VALUES"i   !ident_start { return kw; }
KW_USING    = kw:"USING"i    !ident_start { return kw; }

KW_WHERE    = kw:"WHERE"i      !ident_start { return kw; }
KW_WITH     = kw:"WITH"i       !ident_start { return kw; }

KW_GO       = kw:"GO"i         !ident_start { return kw; }
KW_GROUP    = kw:"GROUP"i      !ident_start { return kw; }
KW_BY       = kw:"BY"i         !ident_start { return kw; }
KW_ORDER    = kw:"ORDER"i      !ident_start { return kw; }
KW_HAVING   = kw:"HAVING"i     !ident_start { return kw; }

KW_LIMIT    = kw:"LIMIT"i      !ident_start { return kw; }
KW_OFFSET   = kw:"OFFSET"i     !ident_start { return kw; }

KW_ASC      = kw:"ASC"i        !ident_start { return kw; }
KW_DESC     = kw:"DESC"i       !ident_start { return kw; }
KW_DESCRIBE = kw:"DESCRIBE"i       !ident_start { return kw; }

KW_ALL      = kw:"ALL"i        !ident_start { return kw; }
KW_DISTINCT = kw:"DISTINCT"i   !ident_start { return kw; }

KW_BETWEEN  = kw:"BETWEEN"i    !ident_start { return kw; }
KW_IN       = kw:"IN"i         !ident_start { return kw; }
KW_IS       = kw:"IS"i         !ident_start { return kw; }
KW_LIKE     = kw:"LIKE"i       !ident_start { return kw; }
KW_RLIKE    = kw:"RLIKE"i      !ident_start { return kw; }
KW_REGEXP   = kw:"REGEXP"i     !ident_start { return kw; }
KW_EXISTS   = kw:"EXISTS"i     !ident_start { return kw; }

KW_NOT      = kw:"NOT"i        !ident_start { return kw; }
KW_AND      = kw:"AND"i        !ident_start { return kw; }
KW_OR       = kw:"OR"i         !ident_start { return kw; }

KW_COUNT    = kw:"COUNT"i      !ident_start { return kw; }
KW_GROUP_CONCAT = kw:"GROUP_CONCAT"i  !ident_start { return kw; }
KW_MAX      = kw:"MAX"i        !ident_start { return kw; }
KW_MIN      = kw:"MIN"i        !ident_start { return kw; }
KW_SUM      = kw:"SUM"i        !ident_start { return kw; }
KW_AVG      = kw:"AVG"i        !ident_start { return kw; }

KW_CALL     = kw:"CALL"i       !ident_start { return kw; }

KW_CASE     = kw:"CASE"i       !ident_start { return kw; }
KW_WHEN     = kw:"WHEN"i       !ident_start { return kw; }
KW_THEN     = kw:"THEN"i       !ident_start { return kw; }
KW_ELSE     = kw:"ELSE"i       !ident_start { return kw; }
KW_END      = kw:"END"i        !ident_start { return kw; }

KW_CAST     = kw:"CAST"i       !ident_start { return kw; }

KW_BIT      = kw:"BIT"i      !ident_start { return kw; }
KW_CHAR     = kw:"CHAR"i     !ident_start { return kw; }
KW_VARCHAR  = kw:"VARCHAR"i  !ident_start { return kw; }
KW_NUMERIC  = kw:"NUMERIC"i  !ident_start { return kw; }
KW_DECIMAL  = kw:"DECIMAL"i  !ident_start { return kw; }
KW_SIGNED   = kw:"SIGNED"i   !ident_start { return kw; }
KW_UNSIGNED = kw:"UNSIGNED"i !ident_start { return kw; }
KW_INT      = kw:"INT"i      !ident_start { return kw; }
KW_ZEROFILL = kw:"ZEROFILL"i !ident_start { return kw; }
KW_INTEGER  = kw:"INTEGER"i  !ident_start { return kw; }
KW_JSON     = kw:"JSON"i     !ident_start { return kw; }
KW_SMALLINT = kw:"SMALLINT"i !ident_start { return kw; }
KW_TINYINT  = kw:"TINYINT"i  !ident_start { return kw; }
KW_TINYTEXT = kw:"TINYTEXT"i !ident_start { return kw; }
KW_TEXT     = kw:"TEXT"i     !ident_start { return kw; }
KW_MEDIUMTEXT = kw:"MEDIUMTEXT"i  !ident_start { return kw; }
KW_LONGTEXT  = kw:"LONGTEXT"i  !ident_start { return kw; }
KW_BIGINT   = kw:"BIGINT"i   !ident_start { return kw; }
KW_ENUM     = kw:"ENUM"i   !ident_start { return kw; }
KW_FLOAT   = kw:"FLOAT"i   !ident_start { return kw; }
KW_DOUBLE   = kw:"DOUBLE"i   !ident_start { return kw; }
KW_DATE     = kw:"DATE"i     !ident_start { return kw; }
KW_DATETIME     = kw:"DATETIME"i     !ident_start { return kw; }
KW_ROWS     = kw:"ROWS"i     !ident_start { return kw; }
KW_TIME     = kw:"TIME"i     !ident_start { return kw; }
KW_TIMESTAMP= kw:"TIMESTAMP"i!ident_start { return kw; }
KW_TRUNCATE = kw:"TRUNCATE"i !ident_start { return kw; }
KW_USER     = kw:"USER"i     !ident_start { return kw; }

KW_CURRENT_DATE     = kw:"CURRENT_DATE"i !ident_start { return kw; }
KW_ADD_DATE         = kw:"ADDDATE"i !ident_start { return kw; }
KW_INTERVAL         = kw:"INTERVAL"i !ident_start { return kw; }
KW_UNIT_YEAR        = kw:"YEAR"i !ident_start { return kw; }
KW_UNIT_MONTH       = kw:"MONTH"i !ident_start { return kw; }
KW_UNIT_DAY         = kw:"DAY"i !ident_start { return kw; }
KW_UNIT_HOUR        = kw:"HOUR"i !ident_start { return kw; }
KW_UNIT_MINUTE      = kw:"MINUTE"i !ident_start { return kw; }
KW_UNIT_SECOND      = kw:"SECOND"i !ident_start { return kw; }
KW_CURRENT_TIME     = kw:"CURRENT_TIME"i !ident_start { return kw; }
KW_CURRENT_TIMESTAMP= kw:"CURRENT_TIMESTAMP"i !ident_start { return kw; }
KW_CURRENT_USER     = kw:"CURRENT_USER"i !ident_start { return kw; }
KW_SESSION_USER     = kw:"SESSION_USER"i !ident_start { return kw; }
KW_SYSTEM_USER      = kw:"SYSTEM_USER"i !ident_start { return kw; }

KW_GLOBAL         = kw:"GLOBAL"i    !ident_start { return kw; }
KW_SESSION        = kw:"SESSION"i   !ident_start { return kw; }
KW_LOCAL          = kw:"LOCAL"i     !ident_start { return kw; }
KW_PERSIST        = kw:"PERSIST"i   !ident_start { return kw; }
KW_PERSIST_ONLY   = kw:"PERSIST_ONLY"i   !ident_start { return kw; }
KW_VIEW           = kw:"VIEW"i    !ident_start { return kw; }

KW_VAR__PRE_AT = '@'
KW_VAR__PRE_AT_AT = '@@'
KW_VAR_PRE_DOLLAR = '$'
KW_VAR_PRE
  = KW_VAR__PRE_AT_AT / KW_VAR__PRE_AT / KW_VAR_PRE_DOLLAR
KW_RETURN = 'return'i
KW_ASSIGN = ':='
KW_ASSIGIN_EQUAL = '='

KW_DUAL = "DUAL"i

// MySQL Alter
KW_ADD     = "ADD"i     !ident_start { return 'ADD'; }
KW_COLUMN  = "COLUMN"i  !ident_start { return 'COLUMN'; }
KW_INDEX   = "INDEX"i  !ident_start { return 'INDEX'; }
KW_KEY     = "KEY"i  !ident_start { return 'KEY'; }
KW_FULLTEXT = "FULLTEXT"i  !ident_start { return 'FULLTEXT'; }
KW_SPATIAL  = "SPATIAL"i  !ident_start { return 'SPATIAL'; }
KW_UNIQUE     = "UNIQUE"i  !ident_start { return 'UNIQUE'; }
KW_KEY_BLOCK_SIZE = "KEY_BLOCK_SIZE"i !ident_start { return 'KEY_BLOCK_SIZE'; }
KW_COMMENT     = "COMMENT"i  !ident_start { return 'COMMENT'; }
KW_CONSTRAINT  = "CONSTRAINT"i  !ident_start { return 'CONSTRAINT'; }
KW_REFERENCES  = "REFERENCES"i  !ident_start { return 'REFERENCES'; }



// MySQL extensions to SQL
OPT_SQL_CALC_FOUND_ROWS = "SQL_CALC_FOUND_ROWS"i
OPT_SQL_CACHE           = "SQL_CACHE"i
OPT_SQL_NO_CACHE        = "SQL_NO_CACHE"i
OPT_SQL_SMALL_RESULT    = "SQL_SMALL_RESULT"i
OPT_SQL_BIG_RESULT      = "SQL_BIG_RESULT"i
OPT_SQL_BUFFER_RESULT   = "SQL_BUFFER_RESULT"i

//special character
DOT       = '.'
COMMA     = ','
STAR      = '*'
LPAREN    = '('
RPAREN    = ')'

LBRAKE    = '['
RBRAKE    = ']'

SEMICOLON = ';'
SINGLE_ARROW = '->'
DOUBLE_ARROW = '->>'

OPERATOR_CONCATENATION = '||'
OPERATOR_AND = '&&'
LOGIC_OPERATOR = OPERATOR_CONCATENATION / OPERATOR_AND

// separator
__
  = xs:(whitespace / comment)* {
    return xs.filter(isObject);
  }

___
  = xs:(whitespace / comment)+ {
    return xs.filter(isObject);
  }

comment
  = block_comment
  / line_comment
  / pound_sign_comment

block_comment
  = "/*" cs:(!"*/" char)* "*/" {
    return {
      type: "block_comment",
      text: "/*" + cs.map(second).join('') + "*/",
    };
  }

line_comment
  = "--" cs:(!EOL char)* {
    return {
      type: "line_comment",
      text: "--" + cs.map(second).join(''),
    };
  }

pound_sign_comment
  = "#" cs:(!EOL char)* {
    return {
      type: "line_comment",
      text: "#" + cs.map(second).join(''),
    };
  }

keyword_comment
  = k:KW_COMMENT __ s:KW_ASSIGIN_EQUAL? __ c:literal_string {
    return "[Not implemented]";
  }

char = .

interval_unit
  = KW_UNIT_YEAR
  / KW_UNIT_MONTH
  / KW_UNIT_DAY
  / KW_UNIT_HOUR
  / KW_UNIT_MINUTE
  / KW_UNIT_SECOND

whitespace =
  [ \t\n\r]

EOL
  = EOF
  / [\n\r]+

EOF = !.

//begin procedure extension
proc_stmts
  = proc_stmt*

proc_stmt
  = __ s:(assign_stmt / return_stmt) {
    return "[Not implemented]";
  }

assign_stmt
  = va:(var_decl / without_prefix_var_decl) __ s: (KW_ASSIGN / KW_ASSIGIN_EQUAL) __ e:proc_expr {
    return "[Not implemented]";
  }

return_stmt
  = KW_RETURN __ e:proc_expr {
    return "[Not implemented]";
  }

proc_expr
  = select_stmt
  / proc_join
  / proc_additive_expr
  / proc_array

proc_additive_expr
  = head:proc_multiplicative_expr
    tail:(__ additive_operator  __ proc_multiplicative_expr)* {
      return "[Not implemented]";
    }

proc_multiplicative_expr
  = head:proc_primary
    tail:(__ multiplicative_operator  __ proc_primary)* {
      return "[Not implemented]";
    }

proc_join
  = lt:var_decl __ op:join_op  __ rt:var_decl __ expr:on_clause {
    return "[Not implemented]";
  }

proc_primary
  = literal
  / var_decl
  / column_ref
  / proc_func_call
  / param
  / LPAREN __ e:proc_additive_expr __ RPAREN {
    return "[Not implemented]";
  }

proc_func_name
  = dt:ident tail:(__ DOT __ ident)? {
    return "[Not implemented]";
  }
  / n:ident_name {
    return "[Not implemented]";
  }
  / quoted_ident

proc_func_call
  = name:proc_func_name __ LPAREN __ l:proc_primary_list? __ RPAREN {
    return "[Not implemented]";
  }
  / name:proc_func_name {
    return "[Not implemented]";
  }

proc_primary_list
  = head:proc_primary tail:(__ COMMA __ proc_primary)* {
    return "[Not implemented]";
  }

proc_array =
  LBRAKE __ l:proc_primary_list __ RBRAKE {
    return "[Not implemented]";
  }

var_decl_list
  = head:var_decl tail:(__ COMMA __ var_decl)* {
    return "[Not implemented]";
  }

var_decl
  = p: KW_VAR_PRE d: without_prefix_var_decl {
    return "[Not implemented]";
  }

without_prefix_var_decl
  = name:ident_name m:mem_chain {
    return "[Not implemented]";
  }

mem_chain
  = l:('.' ident_name)* {
    return "[Not implemented]";
  }

data_type
  = character_string_type
  / numeric_type
  / datetime_type
  / json_type
  / text_type
  / enum_type
  / boolean_type
  / binary_type
  / blob_type

boolean_type
  = 'boolean'i { return "[Not implemented]"; }

blob_type
  = b:('blob'i / 'tinyblob'i / 'mediumblob'i / 'longblob'i) { return "[Not implemented]"; }

binary_type
  = 'binary'i { return "[Not implemented]"; }
  / 'varbinary'i { return "[Not implemented]"; }

character_string_type
  = t:(KW_CHAR / KW_VARCHAR) __ LPAREN __ l:[0-9]+ __ RPAREN {
    return "[Not implemented]";
  }
  / t:KW_CHAR { return "[Not implemented]"; }
  / t:KW_VARCHAR { return "[Not implemented]"; }

numeric_type_suffix
  = un: KW_UNSIGNED? __ ze: KW_ZEROFILL? {
    return "[Not implemented]";
  }
numeric_type
  = t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_DOUBLE / KW_BIT) __ LPAREN __ l:[0-9]+ __ r:(COMMA __ [0-9]+)? __ RPAREN __ s:numeric_type_suffix? {
    return "[Not implemented]";
  }
  / t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_DOUBLE)l:[0-9]+ __ s:numeric_type_suffix? {
    return "[Not implemented]";
  }
  / t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_DOUBLE) __ s:numeric_type_suffix? __ {
    return "[Not implemented]";
  }


datetime_type
  = t:(KW_DATE / KW_DATETIME / KW_TIME / KW_TIMESTAMP) __ LPAREN __ l:[0-6] __ RPAREN __ s:numeric_type_suffix? { return "[Not implemented]"; }
  / t:(KW_DATE / KW_DATETIME / KW_TIME / KW_TIMESTAMP) { return "[Not implemented]"; }

enum_type
  = t:KW_ENUM __ e:value_item {
    return "[Not implemented]";
  }

json_type
  = t:KW_JSON { return "[Not implemented]"; }

text_type
  = t:(KW_TINYTEXT / KW_TEXT / KW_MEDIUMTEXT / KW_LONGTEXT) { return "[Not implemented]"; }
