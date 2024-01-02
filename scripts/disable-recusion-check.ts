import { Plugin } from "peggy";

/**
 * Removes the infinite recursion check pass from Peggy.
 *
 * Currently this pass is excessively slow.
 * See: https://github.com/peggyjs/peggy/issues/457
 */
export const disableRecursionCheck: Plugin = {
  use(config, options) {
    if (options.disableRecursionCheck) {
      config.passes.check = config.passes.check.filter(
        (pass) => pass.name !== "reportInfiniteRecursion"
      );
    }
  },
};
