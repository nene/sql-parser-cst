import peggy from "peggy";
import fs from "fs";
import path from "path";

const pickSqlDialect: peggy.Plugin = {
  use(config, options) {
    config.passes.transform.unshift((ast) => {
      // IMPORTANT: Peggy only allows mutating the rules array in-place.
      // So I can't use e.g. Array.filter() to easily remove rules.
      // See: https://github.com/peggyjs/peggy/issues/328
      const removals: Record<string, boolean> = {};
      const renames: Record<string, string> = {};
      ast.rules.forEach((rule) => {
        const m = /^(.+)\$(.+)$/.exec(rule.name);
        if (m) {
          const baseName = m[1];
          const suffix = m[2];
          removals[baseName] = true;
          if (suffix === (options as any).pickSqlDialect) {
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

const source = fs.readFileSync(path.resolve(__dirname, "./sql.pegjs"), "utf-8");

const dialects = ["mysql", "sqlite"];

dialects.forEach((dialect) => {
  const parser = peggy.generate(source, {
    plugins: [pickSqlDialect],
    pickSqlDialect: dialect,
    output: "source",
    format: "commonjs",
  } as peggy.SourceBuildOptions<"source">);

  fs.writeFileSync(path.resolve(__dirname, `./dialects/${dialect}.js`), parser);
});
