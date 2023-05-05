import { Route, validateRoute } from "./route";
import { RoutablePool, Token } from "./types";

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

export function validateTokenIn(tokenIn: Token, tokenOutDenom: string) {
  if (tokenIn.denom === tokenOutDenom) {
    throw new Error("Invalid tokens: tokenIn and tokenOut must be different");
  }
  if (!tokenIn.amount.isPositive()) {
    throw new Error("Invalid token: tokenIn amount must be positive");
  }
  if (tokenIn.denom === "") {
    throw new Error("Invalid token: tokenIn denom must not be empty");
  }
  if (tokenOutDenom === "") {
    throw new Error("Invalid token: tokenOut denom must not be empty");
  }
}

export function cacheKeyForTokenOutGivenIn(
  poolId: string,
  ...params: Parameters<RoutablePool["getTokenOutByTokenIn"]>
) {
  return `poolId:${poolId}/tokenInDenom:${params[0].denom}/tokenInAmount:${params[0].amount}/tokenOutDenom:${params[1]}/${params[2]}`;
}
