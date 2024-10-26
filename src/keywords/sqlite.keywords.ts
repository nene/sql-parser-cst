// SQLite keywords are listed in:
// https://www.sqlite.org/lang_keywords.html
//
// However, not all of them are fully reserved.
// I've marked the ones that by my testing are reserved with (R).
// This might or might not be fully accurate.
export const sqliteKeywords: Record<string, boolean> = {
  ABORT: true,
  ACTION: true,
  ADD: true, // (R)
  AFTER: true,
  ALL: true, // (R)
  ALTER: true, // (R)
  ALWAYS: true,
  ANALYZE: true,
  AND: true, // (R)
  AS: true, // (R)
  ASC: true,
  ATTACH: true,
  AUTOINCREMENT: true, // (R)
  BEFORE: true,
  BEGIN: true,
  BETWEEN: true,
  BY: true,
  CASCADE: true,
  CASE: true,
  CAST: true,
  CHECK: true,
  COLLATE: true,
  COLUMN: true,
  COMMIT: true,
  CONFLICT: true,
  CONSTRAINT: true,
  CREATE: true,
  CROSS: true,
  CURRENT: true,
  CURRENT_DATE: true,
  CURRENT_TIME: true,
  CURRENT_TIMESTAMP: true,
  DATABASE: true,
  DEFAULT: true,
  DEFERRABLE: true,
  DEFERRED: true,
  DELETE: true,
  DESC: true,
  DETACH: true,
  DISTINCT: true, // (R)
  DO: true,
  DROP: true, // (R)
  EACH: true,
  ELSE: true, // (R)
  END: true,
  ESCAPE: true, // (R)
  EXCEPT: true, // (R)
  EXCLUDE: true,
  EXCLUSIVE: true,
  EXISTS: true, // (R)
  EXPLAIN: true,
  FAIL: true,
  FILTER: true,
  FIRST: true,
  FOLLOWING: true,
  FOR: true,
  FOREIGN: true, // (R)
  FROM: true, // (R)
  FULL: true,
  GENERATED: true,
  GLOB: true,
  GROUP: true, // (R)
  GROUPS: true,
  HAVING: true, // (R)
  IF: true, // (R)
  IGNORE: true,
  IMMEDIATE: true,
  IN: true, // (R)
  INDEX: true, // (R)
  INDEXED: true,
  INITIALLY: true,
  INNER: true,
  INSERT: true, // (R)
  INSTEAD: true,
  INTERSECT: true, // (R)
  INTO: true, // (R)
  IS: true, // (R)
  ISNULL: true, // (R)
  JOIN: true, // (R)
  KEY: true,
  LAST: true,
  LEFT: true,
  LIKE: true,
  LIMIT: true, // (R)
  MATCH: true,
  MATERIALIZED: true,
  NATURAL: true,
  NO: true,
  NOT: true, // (R)
  NOTHING: true, // (R)
  NOTNULL: true, // (R)
  NULL: true, // (R)
  NULLS: true,
  OF: true,
  OFFSET: true,
  ON: true, // (R)
  OR: true, // (R)
  ORDER: true, // (R)
  OTHERS: true,
  OUTER: true,
  OVER: true,
  PARTITION: true,
  PLAN: true,
  PRAGMA: true,
  PRECEDING: true,
  PRIMARY: true, // (R)
  QUERY: true,
  RAISE: true,
  RANGE: true,
  RECURSIVE: true,
  REFERENCES: true, // (R)
  REGEXP: true,
  REINDEX: true,
  RELEASE: true,
  RENAME: true,
  REPLACE: true,
  RESTRICT: true,
  RETURNING: true, // (R)
  RIGHT: true,
  ROLLBACK: true,
  ROW: true,
  ROWS: true,
  SAVEPOINT: true,
  SELECT: true, // (R)
  SET: true, // (R)
  TABLE: true, // (R)
  TEMP: true,
  TEMPORARY: true,
  THEN: true, // (R)
  TIES: true,
  TO: true, // (R)
  TRANSACTION: true, // (R)
  TRIGGER: true,
  UNBOUNDED: true,
  UNION: true, // (R)
  UNIQUE: true, // (R)
  UPDATE: true, // (R)
  USING: true, // (R)
  VACUUM: true,
  VALUES: true, // (R)
  VIEW: true,
  VIRTUAL: true,
  WHEN: true, // (R)
  WHERE: true, // (R)
  WINDOW: true,
  WITH: true,
  WITHOUT: true,
};
