import { Dec } from "@keplr-wallet/unit";

import { RoutablePool, RouteWithInAmount } from "./types";

/** Single path through pools. */
export interface Route {
  pools: RoutablePool[];
  // tokenOutDenoms means the token to come out from each pool.
  // This should the same length with the pools.
  // Route consists of token in -> pool -> token out -> pool -> token out...
  // But, currently, only 1 intermediate can be supported.
  tokenOutDenoms: string[];
  tokenInDenom: string;
}

export function validateRoute(
  route: Route,
  throwOnError: boolean = true
): boolean {
  // Number of pools does not match number of tokenOutDenoms
  if (route.pools.length !== route.tokenOutDenoms.length) {
    if (throwOnError) {
      throw new Error(
        `Invalid route: pools and tokenOutDenoms length mismatch, ${routeToString(
          route
        )}`
      );
    } else {
      return false;
    }
  }

  // There are no pools in the route
  if (route.pools.length === 0) {
    if (throwOnError) {
      throw new Error("Invalid route: pools length is 0");
    } else {
      return false;
    }
  }

  return true;
}

export function routeToString(route: Route | RouteWithInAmount) {
  const pools = route.pools
    .map((pool, i) => `${pool.id} out:${route.tokenOutDenoms[i]}`)
    .join(" -> ");
  if ("initialAmount" in route) {
    return `in:(${route.initialAmount.toString()}) ${pools}`;
  }
  return pools;
}

/** Calculate a standard weight for a given route. **Lower is better.** */
export async function calculateWeightForRoute(
  route: Route,
  getPoolTotalValueLocked: (poolId: string) => Dec
): Promise<Dec> {
  if (route.pools.length === 1) return new Dec(1); // prioritize direct routes

  const firstPoolTvl = getPoolTotalValueLocked(route.pools[0].id);

  return new Dec(1).sub(firstPoolTvl.quo(new Dec(1).add(firstPoolTvl)));
}

/** Creates a serialized key of:
* - route's:
*    -- pool IDs
*    -- token in denom
*    -- token out denoms
 - token in amount */
export function cacheKeyForRoute(route: Route | RouteWithInAmount): string {
  const key = `in:${route.tokenInDenom}/outs:${route.tokenOutDenoms.join(
    "-"
  )}/poolIds:${route.pools.map(({ id }) => id).join("-")}`;

  if ("initialAmount" in route) {
    return key.concat(`/initialAmount:${route.initialAmount}`);
  }

  return key;
}

export function cacheKeyForRouteDenoms(
  tokenInDenom: string,
  tokenOutDenom: string
): string {
  return `${tokenInDenom}-${tokenOutDenom}`;
}
