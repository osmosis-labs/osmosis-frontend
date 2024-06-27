import type { RouterOutputs } from "~/utils/trpc";

export type EdgeRouterKey = keyof RouterOutputs["edge"];

export const constructEdgeRouterKey = (type: EdgeRouterKey | "main") => {
  return `edge-trpc-${type}`;
};

export const constructEdgeUrlPathname = (type: EdgeRouterKey | "main") => {
  return `/api/${constructEdgeRouterKey(type)}`;
};
