import { Plugin } from "peggy";

/**
 * Removes the infinite recursion check pass from Peggy.
 *
 * Currently this pass is excessively slow.
 * See: https://github.com/peggyjs/peggy/issues/457
 */
export const disableRecursionCheck: Plugin = {
  use(config) {
    config.passes.check = config.passes.check.filter(
      (pass) => pass.name !== "reportInfiniteRecursion"
    );
  },
};
