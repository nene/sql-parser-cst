import { Pass, Plugin } from "peggy";

/**
 * Takes imports injected by Peggy code block { ... }
 * and moves them to the top of the generated parser file.
 */
export const moveImports: Plugin = {
  use(config) {
    config.passes.generate.unshift(removeImportsPass);
    config.passes.generate.push(addImportsPass);
  },
};

const IMPORT_REGEX = /import\s*\{[^}]*\}\s*from\s*"[^"]*"\s*;/g;
let imports: string[] = [];

const removeImportsPass: Pass = (ast) => {
  if (!ast.initializer) {
    return;
  }
  const code = ast.initializer.code;

  imports = code.match(IMPORT_REGEX) || [];
  const withoutImports = code.replace(IMPORT_REGEX, "");
  ast.initializer.code = withoutImports;
};

const addImportsPass: Pass = (ast) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ast.code.children[1] = `${imports.join("\n")}\n`;
};
