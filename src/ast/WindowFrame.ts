import { BaseNode } from "./Base";
import { Literal } from "./Literal";

export type AllFrameNodes =
  | FrameClause
  | FrameBetween
  | FrameBound
  | FrameUnbounded;

export interface FrameClause extends BaseNode {
  type: "frame_clause";
  unit: "rows" | "range" | "groups";
  extent: FrameBetween | FrameBound;
  exclude?: "groups" | "ties" | "current row" | "no others";
}

export interface FrameBetween extends BaseNode {
  type: "frame_between";
  begin: FrameBound;
  end: FrameBound;
}

export type FrameBound =
  | FrameBoundCurrentRow
  | FrameBoundPreceding
  | FrameBoundFollowing;

export interface FrameBoundCurrentRow extends BaseNode {
  type: "frame_bound_current_row";
}
export interface FrameBoundPreceding extends BaseNode {
  type: "frame_bound_preceding";
  expr: Literal | FrameUnbounded;
}
export interface FrameBoundFollowing extends BaseNode {
  type: "frame_bound_following";
  expr: Literal | FrameUnbounded;
}
export interface FrameUnbounded extends BaseNode {
  type: "frame_unbounded";
}
