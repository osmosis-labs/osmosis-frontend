import { Dec } from "@keplr-wallet/unit";

import { RoutablePool } from "./types";

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

/** Throws if route is invalid */
export function validateRoute(route: Route) {
  // Number of pools does not match number of tokenOutDenoms
  if (route.pools.length !== route.tokenOutDenoms.length) {
    throw new Error(
      `Invalid path: pools and tokenOutDenoms length mismatch, IDs:${route.pools.map(
        (p) => p.id
      )} ${route.pools
        .flatMap((p) => p.poolAssetDenoms)
        .join(",")} !== ${route.tokenOutDenoms.join(",")}`
    );
  }

  // There are no pools in the route
  if (route.pools.length === 0) {
    throw new Error("Invalid path: pools length is 0");
  }
}

/** Calculate a standard weight for a given route. **Lower is better.** */
export async function calculateWeightForRoute(
  route: Route,
  getPoolTotalValueLocked: (poolId: string) => Dec
): Promise<Dec> {
  const avgTvl = getAveragePoolValueLocked(route, getPoolTotalValueLocked);

  return new Dec(1).sub(avgTvl.quo(new Dec(1).add(avgTvl)));
}

export function getAveragePoolValueLocked(
  route: Route,
  getPoolTotalValueLocked: (poolId: string) => Dec
) {
  const poolsTvl = route.pools.map(({ id }) => getPoolTotalValueLocked(id));
  return poolsTvl
    .reduce((a, b) => a.add(b), new Dec(0))
    .quo(new Dec(route.pools.length));
}
