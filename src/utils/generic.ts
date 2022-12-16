/** Identity function */
export const identity = <T>(x: T): T => x;

/** Last item in array */
export const last = <T>(arr: T[]): T => arr[arr.length - 1];

/** Type guard to check that value is NOT undefined */
export const isDefined = <T>(x: T | undefined): x is T => x !== undefined;

/** Type guard for strings */
export const isString = (x: any): x is string => typeof x === "string";

/** Type guard for objects */
export const isObject = (x: any): x is Record<string, any> =>
  typeof x === "object" && x !== null && !(x instanceof Array);
