import { BaseNode, Keyword } from "./Base";
import { Literal } from "./Literal";

// Window frame
export type AllFrameNodes =
  | FrameClause
  | FrameBetween
  | FrameBound
  | FrameUnbounded
  | FrameExclusion;

export interface FrameClause extends BaseNode {
  type: "frame_clause";
  unitKw: Keyword<"ROWS" | "RANGE" | "GROUPS">;
  extent: FrameBetween | FrameBound;
  exclusion?: FrameExclusion;
}

export interface FrameBetween extends BaseNode {
  type: "frame_between";
  betweenKw: Keyword<"BETWEEN">;
  begin: FrameBound;
  andKw: Keyword<"AND">;
  end: FrameBound;
}

export type FrameBound =
  | FrameBoundCurrentRow
  | FrameBoundPreceding
  | FrameBoundFollowing;

export interface FrameBoundCurrentRow extends BaseNode {
  type: "frame_bound_current_row";
  currentRowKw: [Keyword<"CURRENT">, Keyword<"ROW">];
}
export interface FrameBoundPreceding extends BaseNode {
  type: "frame_bound_preceding";
  expr: Literal | FrameUnbounded;
  precedingKw: Keyword<"PRECEDING">;
}
export interface FrameBoundFollowing extends BaseNode {
  type: "frame_bound_following";
  expr: Literal | FrameUnbounded;
  followingKw: Keyword<"FOLLOWING">;
}
export interface FrameUnbounded extends BaseNode {
  type: "frame_unbounded";
  unboundedKw: Keyword<"UNBOUNDED">;
}
export interface FrameExclusion extends BaseNode {
  type: "frame_exclusion";
  excludeKw: Keyword<"EXCLUDE">;
  kindKw:
    | Keyword<"GROUPS" | "TIES">
    | [Keyword<"CURRENT">, Keyword<"ROW">]
    | [Keyword<"NO">, Keyword<"OTHERS">];
}
