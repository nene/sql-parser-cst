import {
  readGrammar,
  writeGrammar,
  toLines,
  fromLines,
  caseInsensitiveStringCompare,
  extractRules,
} from "./utils";

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
  const { before, rules, after } = extractRules(
    toLines(readGrammar()),
    "keywords"
  );

  const newKeywordRules = [...rules, ...keywords.map(createKeywordRule)].sort(
    caseInsensitiveStringCompare
  );

  writeGrammar(fromLines([...before, ...newKeywordRules, ...after]));
}

const [_node, _script, ...keywords] = process.argv;

addKeywordsToGrammarFile(keywords);
