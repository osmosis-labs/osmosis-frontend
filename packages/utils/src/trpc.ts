export const constructEdgeRouterKey = (type: string | "main" | "mobile") => {
  return `edge-trpc-${type}`;
};

export const constructEdgeUrlPathname = (type: string | "main" | "mobile") => {
  return `/api/${constructEdgeRouterKey(type)}`;
};
