import {
  readGrammar,
  writeGrammar,
  toLines,
  fromLines,
  caseInsensitiveStringCompare,
} from "./utils";

function extractKeywordsRules(lines: string[]) {
  const startIndex =
    lines.findIndex((line) => /^\/\*! keywords:start /.test(line)) + 1;
  const endIndex = lines.findIndex((line) => /^\/\*! keywords:end /.test(line));
  return {
    before: lines.slice(0, startIndex),
    keywordRules: lines.slice(startIndex, endIndex),
    after: lines.slice(endIndex),
  };
}

// Creates a rule for matching a keyword in the following format:
//
// KEYWORD             = kw:"KEYWORD"i             !ident_part { return loc(createKeyword(kw)); }
//
function createKeywordRule(keyword: string): string {
  const name = keyword.padEnd(19);
  const match = `kw:"${keyword}"i`.padEnd(25);
  return `${name} = ${match} !ident_part { return loc(createKeyword(kw)); }`;
}

function addKeywordsToGrammarFile(keywords: string[]) {
  const { before, keywordRules, after } = extractKeywordsRules(
    toLines(readGrammar())
  );

  const newKeywordRules = [
    ...keywordRules,
    ...keywords.map(createKeywordRule),
  ].sort(caseInsensitiveStringCompare);

  writeGrammar(fromLines([...before, ...newKeywordRules, ...after]));
}

const [_node, _script, ...keywords] = process.argv;

addKeywordsToGrammarFile(keywords);
