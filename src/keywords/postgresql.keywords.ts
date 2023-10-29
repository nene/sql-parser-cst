// https://www.postgresql.org/docs/14/sql-keywords-appendix.html
// TODO: update for Postgres 16
export const postgresqlKeywords: Record<string, boolean> = {
  ALL: true, // reserved
  ANALYSE: true, // reserved
  ANALYZE: true, // reserved
  AND: true, // reserved
  ANY: true, // reserved
  ARRAY: true, // reserved, requires AS
  AS: true, // reserved, requires AS
  ASC: true, // reserved
  ASYMMETRIC: true, // reserved
  AUTHORIZATION: true, // reserved (can be function or type)
  // BETWEEN: true, // (cannot be function or type)
  // BIGINT: true, // (cannot be function or type)
  // BINARY: true, // reserved (can be function or type)
  // BIT: true, // (cannot be function or type)
  // BOOLEAN: true, // (cannot be function or type)
  BOTH: true, // reserved
  CASE: true, // reserved
  CAST: true, // reserved
  // CHAR: true, // (cannot be function or type), requires AS
  // CHARACTER: true, // (cannot be function or type), requires AS
  CHECK: true, // reserved
  // COALESCE: true, // (cannot be function or type)
  COLLATE: true, // reserved
  // COLLATION: true, // reserved (can be function or type)
  COLUMN: true, // reserved
  // CONCURRENTLY: true, // reserved (can be function or type)
  CONSTRAINT: true, // reserved
  CREATE: true, // reserved, requires AS
  CROSS: true, // reserved (can be function or type)
  CURRENT_CATALOG: true, // reserved
  CURRENT_DATE: true, // reserved
  CURRENT_ROLE: true, // reserved
  CURRENT_SCHEMA: true, // reserved (can be function or type)
  CURRENT_TIME: true, // reserved
  CURRENT_TIMESTAMP: true, // reserved
  CURRENT_USER: true, // reserved
  DAY: true, // requires AS
  // DEC: true, // (cannot be function or type)
  // DECIMAL: true, // (cannot be function or type)
  DEFAULT: true, // reserved
  DEFERRABLE: true, // reserved
  DESC: true, // reserved
  DISTINCT: true, // reserved
  DO: true, // reserved
  ELSE: true, // reserved
  END: true, // reserved
  EXCEPT: true, // reserved, requires AS
  // EXISTS: true, // (cannot be function or type)
  // EXTRACT: true, // (cannot be function or type)
  FALSE: true, // reserved
  FETCH: true, // reserved, requires AS
  FILTER: true, // requires AS
  // FLOAT: true, // (cannot be function or type)
  FOR: true, // reserved, requires AS
  FOREIGN: true, // reserved
  FREEZE: true, // reserved (can be function or type)
  FROM: true, // reserved, requires AS
  FULL: true, // reserved (can be function or type)
  GRANT: true, // reserved, requires AS
  // GREATEST: true, // (cannot be function or type)
  GROUP: true, // reserved, requires AS
  // GROUPING: true, // (cannot be function or type)
  HAVING: true, // reserved, requires AS
  HOUR: true, // requires AS
  ILIKE: true, // reserved (can be function or type)
  IN: true, // reserved
  INITIALLY: true, // reserved
  INNER: true, // reserved (can be function or type)
  // INOUT: true, // (cannot be function or type)
  // INT: true, // (cannot be function or type)
  // INTEGER: true, // (cannot be function or type)
  INTERSECT: true, // reserved, requires AS
  // INTERVAL: true, // (cannot be function or type)
  INTO: true, // reserved, requires AS
  IS: true, // reserved (can be function or type)
  ISNULL: true, // reserved (can be function or type), requires AS
  JOIN: true, // reserved (can be function or type)
  LATERAL: true, // reserved
  LEADING: true, // reserved
  // LEAST: true, // (cannot be function or type)
  LEFT: true, // reserved (can be function or type)
  LIKE: true, // reserved (can be function or type)
  LIMIT: true, // reserved, requires AS
  LOCALTIME: true, // reserved
  LOCALTIMESTAMP: true, // reserved
  MINUTE: true, // requires AS
  MONTH: true, // requires AS
  // NATIONAL: true, // (cannot be function or type)
  NATURAL: true, // reserved (can be function or type)
  // NCHAR: true, // (cannot be function or type)
  // NONE: true, // (cannot be function or type)
  // NORMALIZE: true, // (cannot be function or type)
  NOT: true, // reserved
  NOTNULL: true, // reserved (can be function or type), requires AS
  NULL: true, // reserved
  // NULLIF: true, // (cannot be function or type)
  // NUMERIC: true, // (cannot be function or type)
  OFFSET: true, // reserved, requires AS
  ON: true, // reserved, requires AS
  ONLY: true, // reserved
  OR: true, // reserved
  ORDER: true, // reserved, requires AS
  // OUT: true, // (cannot be function or type)
  OUTER: true, // reserved (can be function or type)
  OVER: true, // requires AS
  OVERLAPS: true, // reserved (can be function or type), requires AS
  // OVERLAY: true, // (cannot be function or type)
  PLACING: true, // reserved
  // POSITION: true, // (cannot be function or type)
  PRECISION: true, // (cannot be function or type), requires AS
  PRIMARY: true, // reserved
  // REAL: true, // (cannot be function or type)
  REFERENCES: true, // reserved
  RETURNING: true, // reserved, requires AS
  RIGHT: true, // reserved (can be function or type)
  // ROW: true, // (cannot be function or type)
  SECOND: true, // requires AS
  SELECT: true, // reserved
  SESSION_USER: true, // reserved
  // SETOF: true, // (cannot be function or type)
  SIMILAR: true, // reserved (can be function or type)
  // SMALLINT: true, // (cannot be function or type)
  SOME: true, // reserved
  // SUBSTRING: true, // (cannot be function or type)
  SYMMETRIC: true, // reserved
  TABLE: true, // reserved
  TABLESAMPLE: true, // reserved (can be function or type)
  THEN: true, // reserved
  // TIME: true, // (cannot be function or type)
  // TIMESTAMP: true, // (cannot be function or type)
  TO: true, // reserved, requires AS
  TRAILING: true, // reserved
  // TREAT: true, // (cannot be function or type)
  // TRIM: true, // (cannot be function or type)
  TRUE: true, // reserved
  UNION: true, // reserved, requires AS
  UNIQUE: true, // reserved
  USER: true, // reserved
  USING: true, // reserved
  // VALUES: true, // (cannot be function or type)
  // VARCHAR: true, // (cannot be function or type)
  VARIADIC: true, // reserved
  VARYING: true, // requires AS
  VERBOSE: true, // reserved (can be function or type)
  WHEN: true, // reserved
  WHERE: true, // reserved, requires AS
  WINDOW: true, // reserved, requires AS
  WITH: true, // reserved, requires AS
  WITHIN: true, // requires AS
  WITHOUT: true, // requires AS
  // XMLATTRIBUTES: true, // (cannot be function or type)
  // XMLCONCAT: true, // (cannot be function or type)
  // XMLELEMENT: true, // (cannot be function or type)
  // XMLEXISTS: true, // (cannot be function or type)
  // XMLFOREST: true, // (cannot be function or type)
  // XMLNAMESPACES: true, // (cannot be function or type)
  // XMLPARSE: true, // (cannot be function or type)
  // XMLPI: true, // (cannot be function or type)
  // XMLROOT: true, // (cannot be function or type)
  // XMLSERIALIZE: true, // (cannot be function or type)
  // XMLTABLE: true, // (cannot be function or type)
  YEAR: true, // requires AS

  // TODO: Temporarily including these actually non-reserved words
  SET: true,
  PARTITION: true,
  ROWS: true,
  RANGE: true,
};
