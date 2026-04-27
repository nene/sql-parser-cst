import { BaseNode, Keyword } from "./Base";
import { ConstraintCollate, ConstraintNotNull } from "./Constraint";
import { DataType } from "./DataType";
import {
  Identifier,
  ListExpr,
  ParenExpr,
  BinaryExpr,
  Expr,
  FuncCall,
  CaseWhen,
  CaseElse,
  Variable,
  MemberExpr,
} from "./Expr";
import { StringLiteral } from "./Literal";
import { ExecuteExpr } from "./PreparedStatements";
import { Program } from "./Program";
import { SubSelect } from "./Select";
import { WhenClause } from "./Trigger";

export type AllProceduralNodes =
  | AllProceduralStatements
  | ColonLabel
  | ChevronLabel
  | DeclareClause
  | ExceptionClause
  | ErrorCategory
  | DeclareInit
  | IfClause
  | ElseifClause
  | ElseClause
  | ForRange
  | ForByClause
  | ForeachSlice
  | RaiseLevel
  | RaiseSqlstate
  | RaiseFormatString
  | RaiseUsingClause
  | RaiseOptionElement;

export type AllProceduralStatements =
  | LabeledStmt
  | BlockStmt
  | DeclareStmt
  | SetStmt
  | AssignmentStmt
  | IfStmt
  | CaseStmt
  | LoopStmt
  | RepeatStmt
  | WhileStmt
  | WhileLoopStmt
  | ForStmt
  | ForLoopStmt
  | ForeachStmt
  | BreakStmt
  | ContinueStmt
  | CallStmt
  | ReturnStmt
  | ReturnNextStmt
  | ReturnQueryStmt
  | RaiseStmt
  | NullStmt;

export interface LabeledStmt extends BaseNode {
  type: "labeled_stmt";
  beginLabel: ColonLabel | ChevronLabel;
  statement:
    | BlockStmt
    | LoopStmt
    | RepeatStmt
    | WhileStmt
    | WhileLoopStmt
    | ForStmt
    | ForLoopStmt
    | ForeachStmt;
  endLabel?: Identifier;
}

/** For the label: syntax (as in MySQL, BigQuery, DB2) */
export interface ColonLabel {
  type: "colon_label";
  label: Identifier;
}

/** For the <<label>> syntax (as in PostgreSQL, Oracle) */
export interface ChevronLabel {
  type: "chevron_label";
  label: Identifier;
}

// BEGIN .. END
export interface BlockStmt extends BaseNode {
  type: "block_stmt";
  declareClause?: DeclareClause;
  beginKw: Keyword<"BEGIN">;
  atomicKw?: Keyword<"ATOMIC">;
  program: Program;
  exception?: ExceptionClause;
  endKw: Keyword<"END">;
}

export interface DeclareClause extends BaseNode {
  type: "declare_clause";
  declareKw: Keyword<"DECLARE">;
  program: Program;
}

export interface ExceptionClause extends BaseNode {
  type: "exception_clause";
  exceptionKw: Keyword<"EXCEPTION">;
  whenKw: Keyword<"WHEN">;
  condition: ErrorCategory;
  thenKw: Keyword<"THEN">;
  program: Program;
}

export interface ErrorCategory extends BaseNode {
  type: "error_category";
  errorKw: Keyword<"ERROR">;
}

// DECLARE
export interface DeclareStmt extends BaseNode {
  type: "declare_stmt";
  declareKw?: Keyword<"DECLARE">;
  names: ListExpr<Identifier>;
  constantKw?: Keyword<"CONSTANT">;
  dataType?: DataType;
  constraints: (ConstraintNotNull | ConstraintCollate)[];
  init?: DeclareInit;
}

export interface DeclareInit extends BaseNode {
  type: "declare_init";
  operator: Keyword<"DEFAULT"> | ":=" | "=";
  expr: Expr;
}

// SET
export interface SetStmt extends BaseNode {
  type: "set_stmt";
  setKw: Keyword<"SET">;
  assignments: ListExpr<
    BinaryExpr<
      | Identifier
      | Variable
      | ParenExpr<ListExpr<Identifier> | ParenExpr<ListExpr<Variable>>>,
      "=",
      Expr
    >
  >;
}

// variable := expression
export interface AssignmentStmt extends BaseNode {
  type: "assignment_stmt";
  target: Identifier;
  operator: "=" | ":=";
  expr: Expr | MemberExpr;
}

// IF
export interface IfStmt extends BaseNode {
  type: "if_stmt";
  clauses: (IfClause | ElseifClause | ElseClause)[];
  endIfKw: [Keyword<"END">, Keyword<"IF">];
}

export interface IfClause extends BaseNode {
  type: "if_clause";
  ifKw: Keyword<"IF">;
  condition: Expr;
  thenKw: Keyword<"THEN">;
  consequent: Program;
}

export interface ElseifClause extends BaseNode {
  type: "elseif_clause";
  elseifKw: Keyword<"ELSEIF">;
  condition: Expr;
  thenKw: Keyword<"THEN">;
  consequent: Program;
}

export interface ElseClause extends BaseNode {
  type: "else_clause";
  elseKw: Keyword<"ELSE">;
  consequent: Program;
}

// CASE
export interface CaseStmt extends BaseNode {
  type: "case_stmt";
  caseKw: Keyword<"CASE">;
  expr?: Expr;
  clauses: (CaseWhen<Program> | CaseElse<Program>)[];
  endCaseKw: [Keyword<"END">, Keyword<"CASE">];
}

// LOOP
export interface LoopStmt extends BaseNode {
  type: "loop_stmt";
  loopKw: Keyword<"LOOP">;
  body: Program;
  endLoopKw: [Keyword<"END">, Keyword<"LOOP">];
}

// REPEAT
export interface RepeatStmt extends BaseNode {
  type: "repeat_stmt";
  repeatKw: Keyword<"REPEAT">;
  body: Program;
  untilKw: Keyword<"UNTIL">;
  condition: Expr;
  endRepeatKw: [Keyword<"END">, Keyword<"REPEAT">];
}

// WHILE
export interface WhileStmt extends BaseNode {
  type: "while_stmt";
  whileKw: Keyword<"WHILE">;
  condition: Expr;
  doKw: Keyword<"DO">;
  body: Program;
  endWhileKw: [Keyword<"END">, Keyword<"WHILE">];
}

export interface WhileLoopStmt extends BaseNode {
  type: "while_loop_stmt";
  whileKw: Keyword<"WHILE">;
  condition: Expr;
  loop: LoopStmt;
}

// FOR x IN ... DO ... END FOR
export interface ForStmt extends BaseNode {
  type: "for_stmt";
  forKw: Keyword<"FOR">;
  left: Identifier;
  inKw: Keyword<"IN">;
  right: ParenExpr<Expr | SubSelect>;
  doKw: Keyword<"DO">;
  body: Program;
  endForKw: [Keyword<"END">, Keyword<"FOR">];
}

// FOR x IN ... LOOP ... END LOOP
export interface ForLoopStmt extends BaseNode {
  type: "for_loop_stmt";
  forKw: Keyword<"FOR">;
  left: Identifier;
  inKw: Keyword<"IN">;
  right: SubSelect | ForRange | ExecuteExpr;
  loop: LoopStmt;
}

// [REVERSE] expr..expr [BY expr]
export interface ForRange extends BaseNode {
  type: "for_range";
  reverseKw?: Keyword<"REVERSE">;
  from: Expr;
  to: Expr;
  by?: ForByClause;
}

export interface ForByClause extends BaseNode {
  type: "for_by_clause";
  byKw: Keyword<"BY">;
  expr: Expr;
}

// FOREACH
export interface ForeachStmt extends BaseNode {
  type: "foreach_stmt";
  foreachKw: Keyword<"FOREACH">;
  left: Identifier;
  slice?: ForeachSlice;
  inArrayKw: [Keyword<"IN">, Keyword<"ARRAY">];
  right: Expr;
  loop: LoopStmt;
}

export interface ForeachSlice extends BaseNode {
  type: "foreach_slice";
  sliceKw: Keyword<"SLICE">;
  count: Expr;
}

// BREAK | LEAVE | EXIT
export interface BreakStmt extends BaseNode {
  type: "break_stmt";
  breakKw: Keyword<"BREAK" | "LEAVE" | "EXIT">;
  label?: Identifier;
  when?: WhenClause;
}

// CONTINUE | ITERATE
export interface ContinueStmt extends BaseNode {
  type: "continue_stmt";
  continueKw: Keyword<"CONTINUE" | "ITERATE">;
  label?: Identifier;
  when?: WhenClause;
}

// CALL
export interface CallStmt extends BaseNode {
  type: "call_stmt";
  callKw: Keyword<"CALL">;
  func: FuncCall;
}

// RETURN
export interface ReturnStmt extends BaseNode {
  type: "return_stmt";
  returnKw: Keyword<"RETURN">;
  expr?: Expr;
}

// RETURN NEXT
export interface ReturnNextStmt extends BaseNode {
  type: "return_next_stmt";
  returnNextKw: [Keyword<"RETURN">, Keyword<"NEXT">];
  expr: Expr;
}

// RETURN QUERY
export interface ReturnQueryStmt extends BaseNode {
  type: "return_query_stmt";
  returnQueryKw: [Keyword<"RETURN">, Keyword<"QUERY">];
  expr: SubSelect | ExecuteExpr;
}

// RAISE
export interface RaiseStmt extends BaseNode {
  type: "raise_stmt";
  raiseKw: Keyword<"RAISE">;
  level?: RaiseLevel;
  error?: RaiseSqlstate | RaiseFormatString | Identifier;
  using?: RaiseUsingClause;
}

export interface RaiseLevel extends BaseNode {
  type: "raise_level";
  levelKw: Keyword<
    "DEBUG" | "LOG" | "INFO" | "NOTICE" | "WARNING" | "EXCEPTION"
  >;
}

export interface RaiseSqlstate extends BaseNode {
  type: "raise_sqlstate";
  sqlstateKw: Keyword<"SQLSTATE">;
  code: StringLiteral;
}

export interface RaiseFormatString extends BaseNode {
  type: "raise_format_string";
  format: StringLiteral;
  args?: ListExpr<Expr>;
}

export interface RaiseUsingClause extends BaseNode {
  type: "raise_using_clause";
  usingKw: Keyword<"USING">;
  options: ListExpr<RaiseOptionElement>;
}

export interface RaiseOptionElement extends BaseNode {
  type: "raise_option_element";
  nameKw: Keyword<
    | "MESSAGE"
    | "DETAIL"
    | "HINT"
    | "ERRCODE"
    | "COLUMN"
    | "CONSTRAINT"
    | "DATATYPE"
    | "TABLE"
    | "SCHEMA"
  >;
  operator: "=" | ":=";
  value: Expr;
}

// NULL
export interface NullStmt extends BaseNode {
  type: "null_stmt";
  nullKw: Keyword<"NULL">;
}
