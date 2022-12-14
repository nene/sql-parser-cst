import { ast, Pass, Plugin } from "peggy";

/**
 * Given a template rule:
 *
 *     parens$__template__ = "(" x:__template__ ")" { return x; }
 *     __template__ = .
 *
 * And some normal rules:
 *
 *     number = [0-9]+
 *     string = '"' [^""]* '"'
 *
 * Auto generates rules according to the template:
 *
 *     parens$number = .
 *     parens$string = .
 *
 * equivalent to having written manually:
 *
 *     parens$number = "(" x:number ")" { return x; }
 *     parens$string = "(" x:string ")" { return x; }
 *
 */
export const ruleTemplates: Plugin = {
  use(config) {
    config.passes.transform.unshift(ruleTemplatesPass);
  },
};

const ruleTemplatesPass: Pass = (ast) => {
  const templates: Record<string, ast.Rule> = {};

  ast.rules.forEach((rule) => {
    const templateName = matchRuleTemplate(rule.name);
    if (templateName) {
      templates[templateName] = rule;
    }
  });

  console.log("templates:");
  console.log(Object.keys(templates));

  ast.rules = ast.rules.map((rule) => {
    const match = matchRuleWithTemplate(rule.name, templates);
    if (match) {
      console.log("subrule:");
      console.log(match.subRuleName);
      return {
        ...rule,
        expression: cloneRuleExpr(
          match.template.expression,
          rule.expression.location,
          match.subRuleName
        ),
      };
    }
    return rule;
  });
};

const matchRuleTemplate = (name: string): string | undefined => {
  const matches = /^(\w+)\$__template__$/.exec(name) || [];
  return matches[1];
};

const matchRuleWithTemplate = (
  name: string,
  templates: Record<string, ast.Rule>
): RuleWithTemplate | undefined => {
  const [, templateName, subRuleName] = /^(\w+)\$(.+)$/.exec(name) || [];
  const template = templates[templateName];
  return template && subRuleName !== "__template__"
    ? { template, subRuleName }
    : undefined;
};

type RuleWithTemplate = { template: ast.Rule; subRuleName: string };

const cloneRuleExpr = <T>(
  expr: T,
  location: ast.Rule["expression"]["location"],
  subRuleName: string
): T => {
  if (expr instanceof Array) {
    return expr.map((x) => cloneRuleExpr(x, location, subRuleName)) as T;
  } else if (isRecord(expr)) {
    const copy: Record<string, any> = {};
    for (const [key, value] of Object.entries(expr)) {
      if (["location", "labelLocation", "codeLocation"].includes(key)) {
        copy[key] = location;
      } else {
        copy[key] = cloneRuleExpr(value, location, subRuleName);
      }
    }
    if (expr.type === "rule_ref" && expr.name === "__template__") {
      copy.name = subRuleName;
    }
    return copy as T;
  } else {
    return expr;
  }
};

const isRecord = (x: any): x is Record<string, any> => {
  return typeof x === "object" && x !== null;
};
