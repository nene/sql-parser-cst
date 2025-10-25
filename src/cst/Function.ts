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
import { AlterFunctionAction } from "./AlterAction";
import {
  ResetAllParametersClause,
  ResetParameterClause,
  SetParameterClause,
  SetParameterFromCurrentClause,
} from "./Parameter";

export type AllFunctionNodes =
  | AllFunctionStatements
  | FunctionSignature
  | FunctionParam
  | FunctionParamDefault
  | ReturnClause
  | DynamicallyLoadedFunction
  | FunctionWindowClause
  | FunctionBehaviorClause
  | FunctionSecurityClause
  | FunctionCostClause
  | FunctionRowsClause
  | FunctionSupportClause
  | FunctionTransformClause
  | TransformType;

export type AllFunctionStatements =
  | CreateFunctionStmt
  | DropFunctionStmt
  | AlterFunctionStmt;

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

// Used elsewhere for referencing function definitions.
export interface FunctionSignature extends BaseNode {
  type: "function_signature";
  name: EntityName;
  params?: ParenExpr<ListExpr<FunctionParam>>;
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
  | FunctionCostClause
  | FunctionRowsClause
  | FunctionSupportClause
  | FunctionTransformClause
  | SetParameterClause
  | SetParameterFromCurrentClause;

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

// PostgreSQL
export interface FunctionRowsClause extends BaseNode {
  type: "function_rows_clause";
  rowsKw: Keyword<"ROWS">;
  rows: NumberLiteral;
}

// PostgreSQL
export interface FunctionSupportClause extends BaseNode {
  type: "function_support_clause";
  supportKw: Keyword<"SUPPORT">;
  name: EntityName;
}

// PostgreSQL
export interface FunctionTransformClause extends BaseNode {
  type: "function_transform_clause";
  transformKw: Keyword<"TRANSFORM">;
  types: ListExpr<TransformType>;
}

// PostgreSQL
export interface TransformType extends BaseNode {
  type: "transform_type";
  forTypeKw: [Keyword<"FOR">, Keyword<"TYPE">];
  dataType: DataType;
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

// PostgreSQL
export interface AlterFunctionStmt extends BaseNode {
  type: "alter_function_stmt";
  alterKw: Keyword<"ALTER">;
  functionKw: Keyword<"FUNCTION">;
  name: EntityName;
  params?: ParenExpr<ListExpr<FunctionParam>>;
  actions: (AlterFunctionAction | AlterFunctionClause)[];
  behaviorKw?: Keyword<"RESTRICT">;
}

type AlterFunctionClause =
  | SetParameterClause
  | SetParameterFromCurrentClause
  | ResetParameterClause
  | ResetAllParametersClause
  | FunctionBehaviorClause
  | FunctionSecurityClause
  | FunctionCostClause
  | FunctionRowsClause
  | FunctionSupportClause;
