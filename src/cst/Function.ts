import { BaseNode, Keyword } from "./Base";
import { BigqueryOptions } from "./dialects/Bigquery";
import { DataType } from "./DataType";
import { Expr, Identifier, ListExpr, ParenExpr, EntityName } from "./Expr";
import { NumberLiteral, StringLiteral } from "./Literal";
import {
  AsClause,
  DeterminismClause,
  LanguageClause,
  WithConnectionClause,
  ReturnsClause,
} from "./ProcClause";
import { SubSelect } from "./Select";
import { BlockStmt } from "./ProceduralLanguage";

export type AllFunctionNodes =
  | AllFunctionStatements
  | FunctionParam
  | FunctionParamDefault
  | ReturnClause
  | DynamicallyLoadedFunction
  | FunctionWindowClause
  | FunctionBehaviorClause
  | FunctionSecurityClause
  | FunctionCostClause;

export type AllFunctionStatements = CreateFunctionStmt | DropFunctionStmt;

// CREATE FUNCTION
export interface CreateFunctionStmt extends BaseNode {
  type: "create_function_stmt";
  createKw: Keyword<"CREATE">;
  orReplaceKw?: [Keyword<"OR">, Keyword<"REPLACE">];
  temporaryKw?: Keyword<"TEMP" | "TEMPORARY">;
  tableKw?: Keyword<"TABLE">;
  functionKw: Keyword<"FUNCTION">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: EntityName;
  params: ParenExpr<ListExpr<FunctionParam>>;
  clauses: CreateFunctionClause[];
}

export interface FunctionParam extends BaseNode {
  type: "function_param";
  mode?: Keyword<"IN" | "OUT" | "INOUT" | "VARIADIC">;
  name?: Identifier;
  dataType: DataType;
  default?: FunctionParamDefault;
}

export interface FunctionParamDefault extends BaseNode {
  type: "function_param_default";
  operator: Keyword<"DEFAULT"> | "=";
  expr: Expr;
}

type CreateFunctionClause =
  | ReturnsClause
  | ReturnClause
  | BlockStmt
  | DeterminismClause
  | LanguageClause
  | AsClause<
      | StringLiteral
      | ParenExpr<Expr> // BigQuery
      | SubSelect // BigQuery
      | DynamicallyLoadedFunction // PostgreSQL
    >
  | BigqueryOptions
  | WithConnectionClause
  | FunctionWindowClause
  | FunctionBehaviorClause
  | FunctionSecurityClause
  | FunctionCostClause;

// PostgreSQL
// Note: Do not confuse this with "returns_clause", which defines the return type.
export interface ReturnClause extends BaseNode {
  type: "return_clause";
  returnKw: Keyword<"RETURN">;
  expr: Expr;
}

// PostgreSQL
// Represents two comma-separated string literals.
export interface DynamicallyLoadedFunction extends BaseNode {
  type: "dynamically_loaded_function";
  objectFile: StringLiteral;
  symbol: StringLiteral;
}

// PostgreSQL
export interface FunctionWindowClause extends BaseNode {
  type: "function_window_clause";
  windowKw: Keyword<"WINDOW">;
}

// PostgreSQL
export interface FunctionBehaviorClause extends BaseNode {
  type: "function_behavior_clause";
  behaviorKw:
    | Keyword<"VOLATILE">
    | Keyword<"STABLE">
    | Keyword<"IMMUTABLE">
    | Keyword<"LEAKPROOF">
    | [Keyword<"NOT">, Keyword<"LEAKPROOF">]
    | [Keyword<"CALLED">, Keyword<"ON">, Keyword<"NULL">, Keyword<"INPUT">]
    | [
        Keyword<"RETURNS">,
        Keyword<"NULL">,
        Keyword<"ON">,
        Keyword<"NULL">,
        Keyword<"INPUT">
      ]
    | Keyword<"STRICT">
    | [Keyword<"PARALLEL">, Keyword<"UNSAFE" | "SAFE" | "RESTRICTED">];
}

// PostgreSQL
export interface FunctionSecurityClause extends BaseNode {
  type: "function_security_clause";
  externalKw?: Keyword<"EXTERNAL">;
  securityKw: [Keyword<"SECURITY">, Keyword<"DEFINER" | "INVOKER">];
}

// PostgreSQL
export interface FunctionCostClause extends BaseNode {
  type: "function_cost_clause";
  costKw: Keyword<"COST">;
  cost: NumberLiteral;
}

export interface DropFunctionStmt extends BaseNode {
  type: "drop_function_stmt";
  dropKw: Keyword<"DROP">;
  tableKw?: Keyword<"TABLE">;
  functionKw: Keyword<"FUNCTION">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: EntityName;
  params?: ParenExpr<ListExpr<FunctionParam>>;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}
