import peggy from "peggy";

const pickSql: peggy.Plugin = {
  use(config, options) {
    config.passes.transform.unshift((ast) => {
      const removals: Record<string, boolean> = {};
      const renames: Record<string, string> = {};
      ast.rules.forEach((rule) => {
        const m = /^(.+)\$(.+)$/.exec(rule.name);
        if (m) {
          const baseName = m[1];
          const suffix = m[2];
          removals[baseName] = true;
          if (suffix === (options as any).pickSql) {
            renames[rule.name] = baseName;
          }
        }
      });
      // drop rules to be replaced
      ast.rules.forEach((rule) => {
        if (removals[rule.name]) {
          rule.name = rule.name + "$unused";
        }
      });
      // rename rules
      ast.rules.forEach((rule) => {
        if (renames[rule.name]) {
          rule.name = renames[rule.name];
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

expr$2 = "mother"
`,
  {
    plugins: [pickSql],
    pickSql: "2",
  } as peggy.ParserBuildOptions
);

console.log(parser.parse("mother"));
