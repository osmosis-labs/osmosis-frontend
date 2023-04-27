import { Route, validateRoute } from "./route";

export function invertRoute(route: Route) {
  return {
    pools: [...route.pools].reverse(),
    tokenOutDenoms: [
      route.tokenInDenom,
      ...route.tokenOutDenoms.slice(0, -1),
    ].reverse(),
    tokenInDenom: route.tokenOutDenoms[route.tokenOutDenoms.length - 1],
  };
}

export function validateRoutes(routes: Route[]) {
  routes.forEach((route) => validateRoute(route));

  if (
    new Set(
      routes.map(
        (route) => route.tokenOutDenoms[route.tokenOutDenoms.length - 1]
      )
    ).size !== 1
  ) {
    throw new Error("Invalid routes: tokenOut for each route must be the same");
  }
}
