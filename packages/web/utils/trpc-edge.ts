import type { RouterOutputs } from "~/utils/trpc";

export type EdgeRouterKey = keyof RouterOutputs["edge"];

export const constructEdgeUrlPathname = (type: EdgeRouterKey | "main") => {
  return `/api/edge-trpc-${type}`;
};
