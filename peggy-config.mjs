import { moveImports } from "./plugins/build/move-imports.js";
import { ruleTemplates } from "./plugins/build/rule-templates.js";

export default {
  dts: true,
  format: "es",
  input: "src/parser.pegjs",
  plugins: [moveImports, ruleTemplates],
};
