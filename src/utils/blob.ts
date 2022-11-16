//
// Helpers for parsing binary data (hex and bit strings)
//

/**
 * Converts hex string to decimal array
 *
 *     "5A59" -> [90, 89]
 */
export const parseHexBlob = (data: string): number[] => {
  const allMatches = data.match(/..?/g) || [];
  return allMatches.map((m) => parseInt(m, 16));
};

/**
 * Converts bit string to decimal array
 *
 *     "0101101001011001" -> [90, 89]
 */
export const parseBitBlob = (data: string): number[] => {
  const allMatches = data.match(/.{1,8}/g) || [];
  return allMatches.map((m) => parseInt(m, 2));
};
