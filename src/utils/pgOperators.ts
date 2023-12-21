/**
 * Tests if a given sequence of symbols is valid PostgreSQL operator
 * in the "any other operator" precedence category.
 *
 * Allowed symbols:
 *
 *   + - * / < > = ~ ! @ # % ^ & | ` ?
 *
 * NB! The input to this function must only consist of these characters.
 *
 * restrictions:
 *
 * 1. -- and /* cannot appear anywhere in an operator name,
 *    since they will be taken as the start of a comment.
 *
 * 2. A multiple-character operator name cannot end in + or -,
 *    unless the name also contains at least one of these characters:
 *    ~ ! @ # % ^ & | ` ?
 *
 * |/, ||/, @, &, |, #, ~, >>, <<
 * ~, !~, ~*, !~*, ~~, !~~, ~~*, !~~*
 */
export const isPostgresqlOtherOperator = (op: string) => {
  if (standardOperators.includes(op)) {
    return false;
  }
  // restriction #1
  if (/--|\/\*/.test(op)) {
    return false;
  }
  // restriction #2
  if (/[+-]$/.test(op)) {
    return /[~!@#%^&|`?]/.test(op);
  }
  return true;
};

const standardOperators = [
  // arithmetic
  "+",
  "-",
  "*",
  "/",
  "%",
  "^",
  // comparison
  "<",
  ">",
  "<=",
  ">=",
  "<>",
  "!=",
  "=",
];
