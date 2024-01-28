import {
  readGrammar,
  writeGrammar,
  toLines,
  fromLines,
  caseInsensitiveStringCompare,
  extractRules,
} from "./utils";

// Creates a rule for a template type, e.g.:
//
// alias$foo = .
//
function createTemplateRule(type: string, name: string): string {
  return `${type}$${name} = .`;
}

function addTemplateRuleToGrammarFile(ruleName: string) {
  const [type, ...parts] = ruleName.split("$");

  let name: string;
  if (parts.length === 0) {
    throw new Error(`Expected to see $ in rule name: ${ruleName}`);
  } else if (parts.length > 1) {
    // Recursively create all sub-rules
    addTemplateRuleToGrammarFile(parts.join("$"));
    name = parts.join("$");
  } else {
    name = parts[0];
  }

  const { before, rules, after } = extractRules(toLines(readGrammar()), type);

  const newRules = [...rules, createTemplateRule(type, name)].sort(
    caseInsensitiveStringCompare
  );

  writeGrammar(fromLines([...before, ...newRules, ...after]));
}

const [_node, _script, ...rules] = process.argv;

rules.forEach((rule) => {
  addTemplateRuleToGrammarFile(rule);
});
