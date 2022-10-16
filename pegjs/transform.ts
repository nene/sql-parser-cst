import peggy from "peggy";

const transformPlugin: peggy.Plugin = {
  use(config) {
    config.passes.transform.unshift((ast) => {
      const replacements1: Record<string, string> = {};
      const replacements2: Record<string, string> = {};
      ast.rules.forEach((rule) => {
        const m = /^(.+)\$1$/.exec(rule.name);
        if (m) {
          const baseName = m[1];
          replacements1[baseName] = rule.name;
          replacements2[rule.name] = baseName;
        }
      });
      // drop rules to be replaced
      ast.rules.forEach((rule) => {
        if (replacements1[rule.name]) {
          rule.name = rule.name + "$unused";
        }
      });
      // rename rules
      ast.rules.forEach((rule) => {
        if (replacements2[rule.name]) {
          rule.name = replacements2[rule.name];
        }
      });
    });
  },
};

const parser = peggy.generate(
  `
start = expr

expr = "hello"

expr$1 = "world"
`,
  {
    plugins: [transformPlugin],
  }
);

console.log(parser.parse("world"));
