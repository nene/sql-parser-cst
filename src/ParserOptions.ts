export type DialectName = "sqlite" | "mysql";

export type ParamType = "?" | "?nr" | ":name" | "$name" | "@name";

export type ParserOptions = {
  dialect: DialectName;
  preserveComments?: boolean;
  preserveNewlines?: boolean;
  preserveSpaces?: boolean;
  includeRange?: boolean;
  paramTypes?: ParamType[];
};
