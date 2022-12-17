import { BaseNode, Keyword } from "./Base";
import { DataType } from "./DataType";
import {
  Identifier,
  ListExpr,
  ParenExpr,
  BinaryExpr,
  Expr,
  FuncCall,
} from "./Expr";
import { StringLiteral } from "./Literal";
import { Program } from "./Program";
import { SubSelect } from "./Select";

export type AllProceduralNodes =
  | AllProceduralStatements
  | DeclareDefault
  | IfClause
  | ElseifClause
  | ElseClause
  | RaiseMessage;

export type AllProceduralStatements =
  | DeclareStmt
  | SetStmt
  | IfStmt
  | LoopStmt
  | RepeatStmt
  | WhileStmt
  | ForStmt
  | BreakStmt
  | ContinueStmt
  | CallStmt
  | ReturnStmt
  | RaiseStmt;

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
}

// CONTINUE | ITERATE
export interface ContinueStmt extends BaseNode {
  type: "continue_stmt";
  continueKw: Keyword<"CONTINUE" | "ITERATE">;
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
