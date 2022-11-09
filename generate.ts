import peggy from "peggy";
import tspegjs from "ts-pegjs";
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
          if (suffix === (options as any).pickSqlDialect) {
            removals[baseName] = true;
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

const allDialects = ["mysql", "sqlite"];

const chosenDialect = process.argv[2];

if (chosenDialect && !allDialects.includes(chosenDialect)) {
  console.log(
    `Expected an SQL dialect (${allDialects.join(
      ", "
    )}), instead got "${chosenDialect}".`
  );
  process.exit(1);
}

const dialects = chosenDialect ? [chosenDialect] : allDialects;

const source = fs.readFileSync(
  path.resolve(__dirname, "./src/sql.pegjs"),
  "utf-8"
);

dialects.forEach((dialect) => {
  console.log(`Generating parser for: ${dialect}`);
  const parser = peggy.generate(source, {
    plugins: [tspegjs, pickSqlDialect],
    pickSqlDialect: dialect,
    output: "source",
    format: "commonjs",
    tspegjs: {
      customHeader: `
        import { __RESERVED_KEYWORDS__ } from "../keywords/${dialect}.keywords";
        import {
          setRangeFunction,
          setOptionsFunction,
          identity,
          trailing,
          surrounding,
          createBinaryExprChain,
          createBinaryExpr,
          createJoinExprChain,
          createPrefixOpExpr,
          createPostfixOpExpr,
          createKeyword,
          read,
          readCommaSepList,
          readSpaceSepList,
          createIdentifier,
          createAlias,
          createParenExpr,
          createExprList,
          hasParamType,
          isEnabledWhitespace,
          loc,
        } from "../grammar_utils";

        const isReservedKeyword = (name: string) => {
          return __RESERVED_KEYWORDS__[name.toUpperCase()];
        };
      `,
    },
  } as peggy.SourceBuildOptions<"source">);

  fs.writeFileSync(
    path.resolve(__dirname, `./src/dialects/${dialect}.ts`),
    parser
  );
});
