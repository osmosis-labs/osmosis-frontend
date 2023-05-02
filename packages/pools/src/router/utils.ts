import { Route } from "./route";

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
