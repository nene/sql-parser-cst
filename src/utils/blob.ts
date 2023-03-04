//
// Helpers for parsing binary data (hex and bit strings)
//

/**
 * Converts hex string to decimal array
 *
 *     "5A59" -> [90, 89]
 */
export const parseHexBlob = (data: string): number[] => {
  return chunksFromRight(data, 2).map((m) => parseInt(m, 16));
};

/**
 * Converts bit string to decimal array
 *
 *     "0101101001011001" -> [90, 89]
 */
export const parseBitBlob = (data: string): number[] => {
  return chunksFromRight(data, 8).map((m) => parseInt(m, 2));
};

/**
 * Slices string to chunks of specified max size,
 * starting the measurement from right, like so:
 *
 *     chunksFromRight("ABCDEFG", 3) -> ["A", "BCD", "EFG"]
 */
export const chunksFromRight = (text: string, chunkSize: number): string[] => {
  let startIndex = text.length % chunkSize;
  const chunks: string[] = [];
  if (startIndex > 0) {
    chunks.push(text.slice(0, startIndex));
  }
  while (startIndex < text.length) {
    chunks.push(text.slice(startIndex, startIndex + chunkSize));
    startIndex += chunkSize;
  }
  return chunks;
};

/**
 * Converts string to decimal array
 */
export const parseTextBlob = (data: string): number[] => {
  // TextEncoder is globally available in NodeJS,
  // but for some reason the type is missing.
  // See: https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/60038
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return [...new TextEncoder().encode(data)]; // eslint-disable-line
};
