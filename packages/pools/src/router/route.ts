import { Dec, Int } from "@keplr-wallet/unit";
import { Currency } from "@osmosis-labs/types";

import { PoolType } from "../types";

export interface ResultPool {
  id: string;

  swapFee?: Dec;
  type?: PoolType;
  inCurrency?: Currency;
  outCurrency?: Currency;

  /** Code ID if Cosmwasm pool. */
  codeId?: string;
}

/** Single route through pools. */
export interface Route {
  pools: ResultPool[];
  // tokenOutDenoms means the token to come out from each pool.
  // This should the same length with the pools.
  // Route consists of token in -> pool -> token out -> pool -> token out...
  // But, currently, only 1 intermediate can be supported.
  tokenOutDenoms: string[];
  tokenInDenom: string;
}

/** Represents a route through pools, with the initial amount in. */
export interface RouteWithInAmount extends Route {
  initialAmount: Int;
}

/** Single route through pools. */
export interface OutRoute {
  pools: ResultPool[];
  // tokenOutDenoms means the token to come out from each pool.
  // This should the same length with the pools.
  // Route consists of token in -> pool -> token out -> pool -> token out...
  // But, currently, only 1 intermediate can be supported.
  tokenInDenoms: string[];
  tokenOutDenom: string;
}

/** Represents a route through pools, with the initial amount in. */
export interface RouteWithOutAmount extends OutRoute {
  initialAmount: Int;
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

export function routeToString(
  route: Route | RouteWithInAmount,
  showDenoms = true
) {
  const pools = route.pools
    .map((pool, i) =>
      showDenoms
        ? `${pool.id} out:${route.tokenOutDenoms[i].slice(0, 8)}`
        : pool.id
    )
    .join(" -> ");
  if ("initialAmount" in route) {
    return `in:(${route.initialAmount.toString()}) ${pools}`;
  }
  return pools;
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
