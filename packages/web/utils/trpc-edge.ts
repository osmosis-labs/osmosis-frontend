import {
  constructEdgeRouterKey as constructEdgeRouterKeyUtils,
  constructEdgeUrlPathname as constructEdgeUrlPathnameUtils,
} from "@osmosis-labs/utils";

import type { RouterOutputs } from "~/utils/trpc";

export type EdgeRouterKey = keyof RouterOutputs["edge"];

export const constructEdgeRouterKey = (type: EdgeRouterKey | "main") => {
  return constructEdgeRouterKeyUtils(type);
};

export const constructEdgeUrlPathname = (type: EdgeRouterKey | "main") => {
  return constructEdgeUrlPathnameUtils(type);
};
