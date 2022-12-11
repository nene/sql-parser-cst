import { ast, Pass, Plugin } from "peggy";

/**
 * Generates code for dollar-rules:
 *
 * alias$foo = ...
 * list$foo = ...
 * paren$foo = ...
 */
export const dollarRules: Plugin = {
  use(config) {
    config.passes.transform.unshift(dollarRulesPass);
  },
};

const dollarRulesPass: Pass = (ast) => {
  ast.rules = ast.rules.map((rule) => {
    if (isAliasRule(rule)) {
      return createAliasRule(rule);
    } else {
      return rule;
    }
  });
};

const isAliasRule = (rule: ast.Rule) => /^alias\$/.test(rule.name);

/**
 * Generates rule matching the template:
 *
 *     alias$my_rule
 *       = expr:my_rule alias:(__ alias)? {
 *         return loc(createAlias(expr, alias));
 *       }
 */
function createAliasRule(rule: ast.Rule): ast.Rule {
  return {
    ...rule,
    expression: {
      type: "action",
      expression: {
        type: "sequence",
        elements: [
          {
            type: "labeled",
            label: "expr",
            expression: {
              type: "rule_ref",
              name: extractSubRuleName(rule.name),
              location: rule.location,
            },
            location: rule.location,
            labelLocation: rule.location,
          },
          {
            type: "labeled",
            label: "alias",
            expression: {
              type: "optional",
              expression: {
                type: "group",
                expression: {
                  type: "sequence",
                  elements: [
                    {
                      type: "rule_ref",
                      name: "__",
                      location: rule.location,
                    },
                    {
                      type: "rule_ref",
                      name: "alias",
                      location: rule.location,
                    },
                  ],
                  location: rule.location,
                },
                location: rule.location,
              },
              location: rule.location,
            },
            location: rule.location,
            labelLocation: rule.location,
          },
        ],
        location: rule.location,
      },
      code: "\n    return loc(createAlias(expr, alias));\n  ",
      codeLocation: rule.location,
      location: rule.location,
    },
  };
}

const extractSubRuleName = (ruleName: string): string =>
  (ruleName.match(/^\w+\$(.*)/) || [])[1];