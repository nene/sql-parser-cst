import { BaseNode, Keyword } from "./Base";
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
} from "./Expr";
import { StringLiteral } from "./Literal";
import { Program } from "./Program";
import { SubSelect } from "./Select";

export type AllProceduralNodes =
  | AllProceduralStatements
  | ExceptionClause
  | ErrorCategory
  | DeclareDefault
  | IfClause
  | ElseifClause
  | ElseClause
  | RaiseMessage;

export type AllProceduralStatements =
  | LabeledStmt
  | BlockStmt
  | DeclareStmt
  | SetStmt
  | IfStmt
  | CaseStmt
  | LoopStmt
  | RepeatStmt
  | WhileStmt
  | ForStmt
  | BreakStmt
  | ContinueStmt
  | CallStmt
  | ReturnStmt
  | RaiseStmt;

export interface LabeledStmt extends BaseNode {
  type: "labeled_stmt";
  beginLabel: Identifier;
  statement: BlockStmt | LoopStmt | RepeatStmt | WhileStmt | ForStmt;
  endLabel?: Identifier;
}

// BEGIN .. END
export interface BlockStmt extends BaseNode {
  type: "block_stmt";
  beginKw: Keyword<"BEGIN">;
  atomicKw?: Keyword<"ATOMIC">;
  program: Program;
  exception?: ExceptionClause;
  endKw: Keyword<"END">;
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
  declareKw: Keyword<"DECLARE">;
  names: ListExpr<Identifier>;
  dataType?: DataType;
  default?: DeclareDefault;
}

export interface DeclareDefault extends BaseNode {
  type: "declare_default";
  defaultKw: Keyword<"DEFAULT">;
  expr: Expr;
}

// SET
export interface SetStmt extends BaseNode {
  type: "set_stmt";
  setKw: Keyword<"SET">;
  assignments: ListExpr<
    BinaryExpr<Identifier | ParenExpr<ListExpr<Identifier>>, "=", Expr>
  >;
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

// FOR
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

// BREAK | LEAVE
export interface BreakStmt extends BaseNode {
  type: "break_stmt";
  breakKw: Keyword<"BREAK" | "LEAVE">;
  label?: Identifier;
}

// CONTINUE | ITERATE
export interface ContinueStmt extends BaseNode {
  type: "continue_stmt";
  continueKw: Keyword<"CONTINUE" | "ITERATE">;
  label?: Identifier;
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

// RAISE
export interface RaiseStmt extends BaseNode {
  type: "raise_stmt";
  raiseKw: Keyword<"RAISE">;
  message?: RaiseMessage;
}

export interface RaiseMessage extends BaseNode {
  type: "raise_message";
  usingMessageKw: [Keyword<"USING">, Keyword<"MESSAGE">];
  string: StringLiteral;
}
