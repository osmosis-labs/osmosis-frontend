import { Dec, Int } from "@keplr-wallet/unit";

import { Route, validateRoute } from "./route";
import { RoutablePool } from "./types";

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

export function cacheKeyForTokenOutGivenIn(
  poolId: string,
  ...params: Parameters<RoutablePool["getTokenOutByTokenIn"]>
) {
  return `poolId:${poolId}/tokenInDenom:${params[0].denom}/tokenInAmount:${params[0].amount}/tokenOutDenom:${params[1]}/${params[2]}`;
}

/** Performs a deep copy of values, with special accommodation for Keplr unit types `Int`, and `Dec`. */
export function deepUnitCopy<T extends object>(object: T): T {
  const copy: any = Array.isArray(object) ? [] : {};
  for (const key in object) {
    // special handle Int and Dec types
    const child = object[key];
    if (child instanceof Int) {
      copy[key] = new Int(child.toString());
      continue;
    }
    if (child instanceof Dec) {
      copy[key] = new Dec((child as Dec).toString());
      continue;
    }

    if (typeof child === "object") {
      copy[key] = deepUnitCopy(child as any);
    } else {
      // value, not reference type
      copy[key] = child;
    }
  }
  return copy;
}
