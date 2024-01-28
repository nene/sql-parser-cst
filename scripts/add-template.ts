import fs from "fs";
import path from "path";

function readGrammar(): string {
  return fs.readFileSync(
    path.resolve(__dirname, "../src/parser.pegjs"),
    "utf-8"
  );
}

function writeGrammar(source: string) {
  return fs.writeFileSync(
    path.resolve(__dirname, "../src/parser.pegjs"),
    source
  );
}

function toLines(str: string): string[] {
  return str.split("\n");
}

function fromLines(lines: string[]): string {
  return lines.join("\n");
}

function caseInsensitiveStringCompare(a: string, b: string): -1 | 0 | 1 {
  const aa = a.toLocaleLowerCase();
  const bb = b.toLowerCase();
  return aa < bb ? -1 : aa > bb ? 1 : 0;
}

function extractTemplateRules(lines: string[], type: string) {
  const startRegex = new RegExp(`^\\/\\*! ${type}:start `);
  const endRegex = new RegExp(`^\\/\\*! ${type}:end `);

  const startIndex = lines.findIndex((line) => startRegex.test(line)) + 1;
  const endIndex = lines.findIndex((line) => endRegex.test(line));

  return {
    before: lines.slice(0, startIndex),
    rules: lines.slice(startIndex, endIndex),
    after: lines.slice(endIndex),
  };
}

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

  const { before, rules, after } = extractTemplateRules(
    toLines(readGrammar()),
    type
  );

  const newRules = [...rules, createTemplateRule(type, name)].sort(
    caseInsensitiveStringCompare
  );

  writeGrammar(fromLines([...before, ...newRules, ...after]));
}

const [_node, _script, ...rules] = process.argv;

rules.forEach((rule) => {
  addTemplateRuleToGrammarFile(rule);
});
