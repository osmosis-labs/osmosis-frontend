export const constructEdgeRouterKey = (type: string | "main") => {
  return `edge-trpc-${type}`;
};

export const constructEdgeUrlPathname = (type: string | "main") => {
  return `/api/${constructEdgeRouterKey(type)}`;
};
