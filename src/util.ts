/** Type guard to check that value is NOT undefined */
export const isDefined = <T>(x: T | undefined): x is T => x !== undefined;
