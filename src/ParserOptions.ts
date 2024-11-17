export const validDialectNames = {
  sqlite: true,
  mysql: true,
  mariadb: true,
  bigquery: true,
  postgresql: true,
};

export type DialectName = keyof typeof validDialectNames;

export type ParamType =
  | "?"
  | "?nr"
  | "$nr"
  | ":name"
  | "$name"
  | "@name"
  | "@`name`";

export type ParserOptions = {
  dialect: DialectName;
  includeComments?: boolean;
  includeNewlines?: boolean;
  includeSpaces?: boolean;
  includeRange?: boolean;
  paramTypes?: ParamType[];
  acceptUnsupportedGrammar?: boolean;
  /** SQL file name, used when reporting syntax errors */
  filename?: string;
};
