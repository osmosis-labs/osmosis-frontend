import {
  constructEdgeRouterKey as constructEdgeRouterKeyUtils,
  constructEdgeUrlPathname as constructEdgeUrlPathnameUtils,
} from "@osmosis-labs/utils";

import type { RouterOutputs } from "~/utils/trpc";

export type EdgeRouterKey = keyof RouterOutputs["edge"];

// Re-define this function to include 'EdgeRouterKey' for better type safety
export const constructEdgeRouterKey = (
  type: EdgeRouterKey | "main" | "mobile"
) => {
  return constructEdgeRouterKeyUtils(type);
};

// Re-define this function to include 'EdgeRouterKey' for better type safety
export const constructEdgeUrlPathname = (
  type: EdgeRouterKey | "main" | "mobile"
) => {
  return constructEdgeUrlPathnameUtils(type);
};
