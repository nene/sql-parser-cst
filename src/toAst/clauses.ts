import { cstToAst } from "../cstToAst";
import {
  FromClause,
  LimitClause,
  OrderByClause,
  WhereClause,
  WithClause as CstWithClause,
} from "../cst/Node";
import {
  Expr,
  Identifier,
  SortSpecification,
  TableExpr,
  WithClause as AstWithClause,
} from "../ast/Node";

export const withClause = (clause: CstWithClause) => ({
  with: cstToAst<AstWithClause>(clause),
});

export const fromClause = (clause: FromClause) => ({
  from: cstToAst<TableExpr>(clause.expr),
});

export const whereClause = (clause: WhereClause) => ({
  where: cstToAst<Expr>(clause.expr),
});

export const orderByClause = (clause: OrderByClause) => ({
  orderBy: cstToAst<(Identifier | SortSpecification)[]>(
    clause.specifications.items
  ),
});

export const limitClause = (clause: LimitClause) => ({
  limit: cstToAst<Expr>(clause.count),
  offset: clause.offset && cstToAst<Expr>(clause.offset),
});
