import { Dec } from "@keplr-wallet/unit";

import { calculateWeightForRoute, Route } from "../route";
import { makeMockRoutablePool, MockRoutablePool } from "./pool";

describe("route weight calculations", () => {
  describe("calculateWeightForRoute", () => {
    const lowLiqPools = [
      makeMockRoutablePool("100", ["tokenA", "tokenB"]),
      makeMockRoutablePool("50", ["tokenB", "tokenC"]),
      makeMockRoutablePool("20", ["tokenC", "tokenD"]),
    ];
    const highLiqPools = [
      makeMockRoutablePool("1000", ["tokenA", "tokenB"]),
      makeMockRoutablePool("500", ["tokenB", "tokenC"]),
      makeMockRoutablePool("200", ["tokenC", "tokenD"]),
    ];
    /** Higher liquidity at the end of the route */
    const lowDepthPools = [
      makeMockRoutablePool("20", ["tokenA", "tokenB"]),
      makeMockRoutablePool("500", ["tokenB", "tokenC"]),
      makeMockRoutablePool("800", ["tokenC", "tokenD"]),
    ];

    it("should return a lower weight for a route with higher liquidity (lower is better)", async () => {
      const tokenInDenom = "tokenA";
      const routeLowLiq: Route = {
        pools: lowLiqPools,
        tokenOutDenoms: getTokenOuts(lowLiqPools, tokenInDenom),
        tokenInDenom,
      };
      const routeHighLiq: Route = {
        pools: highLiqPools,
        tokenOutDenoms: getTokenOuts(highLiqPools, tokenInDenom),
        tokenInDenom,
      };
      const lowLiqWeight = await calculateWeightForRoute(
        routeLowLiq,
        makeTvlFunc(lowLiqPools)
      );
      const highLiqWeight = await calculateWeightForRoute(
        routeHighLiq,
        makeTvlFunc(highLiqPools)
      );
      expect(lowLiqWeight.gt(highLiqWeight)).toBeTruthy();
    });

    it("should return a lower weight for a route with higher liquidity at the end of the route but less depth", async () => {
      const tokenInDenom = "tokenA";
      const routeLowLiq: Route = {
        pools: lowLiqPools,
        tokenOutDenoms: getTokenOuts(lowLiqPools, tokenInDenom),
        tokenInDenom,
      };
      const lowDepth: Route = {
        pools: lowDepthPools,
        tokenOutDenoms: getTokenOuts(lowDepthPools, tokenInDenom),
        tokenInDenom,
      };
      const lowLiqWeight = await calculateWeightForRoute(
        routeLowLiq,
        makeTvlFunc(lowLiqPools)
      );
      const lowDepthWeight = await calculateWeightForRoute(
        lowDepth,
        makeTvlFunc(lowDepthPools)
      );
      expect(lowLiqWeight.gt(lowDepthWeight)).toBeTruthy();
    });
  });
});

function getTokenOuts(pools: MockRoutablePool[], tokenIn: string) {
  const tokenOuts = [];
  for (const pool of pools) {
    const tokenOut = pool.poolAssetDenoms.find((d) => d !== tokenIn);
    if (!tokenOut) throw new Error("Invalid pool");
    tokenOuts.push(tokenOut);
  }
  return tokenOuts;
}

function makeTvlFunc(pools: MockRoutablePool[]): (poolId: string) => Dec {
  return (poolId: string) => {
    const pool = pools.find((p) => p.id === poolId);
    if (!pool) throw new Error("Pool not found");
    return pool.limitAmount.toDec();
  };
}
