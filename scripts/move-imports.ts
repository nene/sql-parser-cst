import { Pass, Plugin } from "peggy";

/**
 * Takes imports injected by Peggy code block { ... }
 * and moves them to the top of the generated parser file.
 */
export const moveImports: Plugin = {
  use(config) {
    config.passes.generate.push(moveImportsPass);
  },
};

const IMPORT_REGEX = /import\s*\{[^}]*\}\s*from\s*"[^"]*"\s*;/g;

const moveImportsPass: Pass = (ast) => {
  const code = ast.code as unknown as string;

  const imports = code.match(IMPORT_REGEX) || [];
  const withoutImports = code.replace(IMPORT_REGEX, "");
  const withMovedImports = withoutImports.replace(
    /"use strict";\n/,
    `"use strict";\n\n${imports.join("\n")}\n`
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (ast as any).code = withMovedImports;
};
