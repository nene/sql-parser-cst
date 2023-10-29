//
// helpers for parsing unicode escape sequences
//

/**
 * Converts unicode escape sequences to actual characters.
 *
 *     "\0061"    --> "a"
 *     "\+000061" --> "a"
 */
export const parseUnicodeEscapes = (str: string): string => {
  return str.replace(
    /\\([0-9A-F]{4})|\\\+([0-9A-F]{6})/g,
    (_?: any, h1?: string, h2?: string) =>
      String.fromCodePoint(parseInt((h1 ?? h2) as string, 16))
  );
};
