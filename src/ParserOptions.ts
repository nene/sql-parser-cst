export const validDialectNames = {
  sqlite: true,
  mysql: true,
};

export type DialectName = keyof typeof validDialectNames;

export type ParamType = "?" | "?nr" | ":name" | "$name" | "@name";

export type ParserOptions = {
  dialect: DialectName;
  preserveComments?: boolean;
  preserveNewlines?: boolean;
  preserveSpaces?: boolean;
  includeRange?: boolean;
  paramTypes?: ParamType[];
};
