import { Dec, Int } from "@keplr-wallet/unit";
import {
  getOsmoRoutedMultihopTotalSwapFee,
  isOsmoRoutedMultihop,
} from "@osmosis-labs/math";

import { NoPoolsError, NotEnoughLiquidityError } from "./errors";
import { Pool } from "./interface";

export interface RoutePath {
  pools: Pool[];
  // tokenOutDenoms means the token to come out from each pool.
  // This should the same length with the pools.
  // RoutePath consists of token in -> pool -> token out -> pool -> token out...
  // But, currently, only 1 intermediate can be supported.
  tokenOutDenoms: string[];
  tokenInDenom: string;
}

export interface RoutePathWithAmount extends RoutePath {
  amount: Int;
}

export class OptimizedRoutes {
  protected _pools: ReadonlyArray<Pool>;
  protected _incentivizedPoolIds: string[];
  protected candidatePathsCache = new Map<string, RoutePath[]>();

  constructor(
    pools: ReadonlyArray<Pool>,
    incventivizedPoolIds: string[],
    protected readonly stakeCurrencyMinDenom: string
  ) {
    this._pools = pools;
    this._incentivizedPoolIds = incventivizedPoolIds;
  }

  get pools(): ReadonlyArray<Pool> {
    return this._pools;
  }

  protected getCandidatePaths(
    tokenInDenom: string,
    tokenOutDenom: string,
    maxHops = 3,
    maxRouteCount = 3
  ): RoutePath[] {
    if (this.pools.length === 0) {
      return [];
    }
    const cacheKey = `${tokenInDenom}/${tokenOutDenom}`;
    const cached = this.candidatePathsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const poolsUsed = Array<boolean>(this.pools.length).fill(false);
    const routes: RoutePath[] = [];

    const computeRoutes = (
      tokenInDenom: string,
      tokenOutDenom: string,
      currentRoute: Pool[],
      currentTokenOuts: string[],
      poolsUsed: boolean[],
      _previousTokenOuts?: string[]
    ) => {
      if (currentRoute.length > maxHops) return;

      if (
        currentRoute.length > 0 &&
        currentRoute[currentRoute.length - 1]!.hasPoolAsset(tokenOutDenom)
      ) {
        const foundRoute: RoutePath = {
          pools: [...currentRoute],
          tokenOutDenoms: [...currentTokenOuts, tokenOutDenom],
          tokenInDenom,
        };
        const existingRoutes = this.candidatePathsCache.get(cacheKey);
        if (existingRoutes) {
          existingRoutes.push(foundRoute);
          this.candidatePathsCache.set(cacheKey, existingRoutes);
        } else {
          this.candidatePathsCache.set(cacheKey, [foundRoute]);
        }
        routes.push(foundRoute);
        return;
      }

      if (routes.length >= maxRouteCount) {
        // only find top routes by iterating all pools by high liquidity first
        return;
      }

      for (let i = 0; i < this.pools.length; i++) {
        if (poolsUsed[i]) {
          continue;
        }

        const previousTokenOuts = _previousTokenOuts
          ? _previousTokenOuts
          : [tokenInDenom]; // imaginary prev pool

        const curPool = this.pools[i];
        let prevPoolCurPoolTokenMatch: string | undefined;
        const curPoolContainsAssetOutOfLastPool =
          previousTokenOuts &&
          curPool.poolAssets.some(({ denom }) =>
            previousTokenOuts.some((d) => {
              if (d === denom) {
                prevPoolCurPoolTokenMatch = denom;
                return true;
              }
              return false;
            })
          );
        if (!curPoolContainsAssetOutOfLastPool || !prevPoolCurPoolTokenMatch) {
          continue;
        }

        currentRoute.push(curPool);
        if (prevPoolCurPoolTokenMatch !== tokenInDenom)
          currentTokenOuts.push(prevPoolCurPoolTokenMatch);
        poolsUsed[i] = true;
        computeRoutes(
          tokenInDenom,
          tokenOutDenom,
          currentRoute,
          currentTokenOuts,
          poolsUsed,
          curPool.poolAssets
            .filter(({ denom }) => denom !== prevPoolCurPoolTokenMatch)
            .map(({ denom }) => denom)
        );
        poolsUsed[i] = false;
        currentTokenOuts.pop();
        currentRoute.pop();
      }
    };

    computeRoutes(tokenInDenom, tokenOutDenom, [], [], poolsUsed);

    return routes;
  }

  getOptimizedRoutesByTokenIn(
    tokenIn: {
      denom: string;
      amount: Int;
    },
    tokenOutDenom: string,
    maxPools: number,
    maxRoutes = 3
  ): RoutePathWithAmount[] {
    if (!tokenIn.amount.isPositive()) {
      throw new Error("Token in amount is zero or negative");
    }

    let routes = this.getCandidatePaths(
      tokenIn.denom,
      tokenOutDenom,
      maxPools,
      maxRoutes
    );

    // sort routes by highest normalized liquidity first
    routes = routes.sort((path1, path2) => {
      const path1IsDirect = path1.pools.length === 1;
      const path2IsDirect = path2.pools.length === 1;
      if (!path1IsDirect || !path2IsDirect) {
        return path1IsDirect ? -1 : 1;
      }

      const getNormLiquidityInPath = (path: RoutePath) => {
        let totalNormLiquidity = new Dec(0);
        path.pools.forEach((pool, i) => {
          const normLiquidity = pool.getNormalizedLiquidity(
            path.tokenInDenom,
            path.tokenOutDenoms[i]
          );
          totalNormLiquidity = totalNormLiquidity.add(normLiquidity);
        });
        return totalNormLiquidity;
      };

      const path1TotalNormLiquidity = getNormLiquidityInPath(path1);
      const path2TotalNormLiquidity = getNormLiquidityInPath(path2);

      return path1TotalNormLiquidity.gte(path2TotalNormLiquidity) ? -1 : 1;
    });

    // Priority is given to direct swap.
    // For direct swap, sort by normalized liquidity.
    // In case of multihop swap, sort by first normalized liquidity.
    routes = routes.sort((path1, path2) => {
      const path1IsDirect = path1.pools.length === 1;
      const path2IsDirect = path2.pools.length === 1;
      if (!path1IsDirect || !path2IsDirect) {
        return path1IsDirect ? -1 : 1;
      }

      const path1NormalizedLiquidity = path1.pools[0].getNormalizedLiquidity(
        tokenIn.denom,
        path1.tokenOutDenoms[0]
      );
      const path2NormalizedLiquidity = path2.pools[0].getNormalizedLiquidity(
        tokenIn.denom,
        path2.tokenOutDenoms[0]
      );

      return path1NormalizedLiquidity.gte(path2NormalizedLiquidity) ? -1 : 1;
    });

    // TODO: if paths is single pool - confirm enough liquidity otherwise find different route
    if (routes.length === 0) {
      throw new NoPoolsError();
    }

    const initialSwapAmounts: Int[] = [];
    let totalLimitAmount = new Int(0);
    for (const route of routes) {
      const limitAmount = route.pools[0].getLimitAmountByTokenIn(tokenIn.denom);

      totalLimitAmount = totalLimitAmount.add(limitAmount);

      if (totalLimitAmount.lt(tokenIn.amount)) {
        initialSwapAmounts.push(limitAmount);
      } else {
        let sumInitialSwapAmounts = new Int(0);
        for (const initialSwapAmount of initialSwapAmounts) {
          sumInitialSwapAmounts = sumInitialSwapAmounts.add(initialSwapAmount);
        }

        const diff = tokenIn.amount.sub(sumInitialSwapAmounts);
        initialSwapAmounts.push(diff);

        break;
      }
    }

    // No enough liquidity
    if (totalLimitAmount.lt(tokenIn.amount)) {
      throw new NotEnoughLiquidityError();
    }

    // TODO: ...

    return initialSwapAmounts.map((amount, i) => {
      return {
        ...routes[i],
        amount,
      };
    });
  }

  calculateTokenOutByTokenIn(routes: RoutePathWithAmount[]): {
    amount: Int;
    beforeSpotPriceInOverOut: Dec;
    beforeSpotPriceOutOverIn: Dec;
    afterSpotPriceInOverOut: Dec;
    afterSpotPriceOutOverIn: Dec;
    effectivePriceInOverOut: Dec;
    effectivePriceOutOverIn: Dec;
    tokenInFeeAmount: Int;
    swapFee: Dec;
    multiHopOsmoDiscount: boolean;
    priceImpact: Dec;
  } {
    if (routes.length === 0) {
      throw new Error("Paths are empty");
    }

    let totalOutAmount: Int = new Int(0);
    let totalBeforeSpotPriceInOverOut: Dec = new Dec(0);
    let totalAfterSpotPriceInOverOut: Dec = new Dec(0);
    let totalEffectivePriceInOverOut: Dec = new Dec(0);
    let totalSwapFee: Dec = new Dec(0);
    /** Special case when routing through _only_ 2 OSMO pools. */
    let isMultihopOsmoFeeDiscount = false;

    let sumAmount = new Int(0);
    for (const path of routes) {
      sumAmount = sumAmount.add(path.amount);
    }

    let outDenom: string | undefined;
    for (const route of routes) {
      if (route.pools.length !== route.tokenOutDenoms.length) {
        throw new Error(
          "Invalid path: pools and tokenOutDenoms length mismatch"
        );
      }
      if (route.pools.length === 0) {
        throw new Error("Invalid path: pools length is 0");
      }

      if (!outDenom) {
        outDenom = route.tokenOutDenoms[route.tokenOutDenoms.length - 1];
      } else if (
        outDenom !== route.tokenOutDenoms[route.tokenOutDenoms.length - 1]
      ) {
        throw new Error("Paths have different out denom");
      }

      const amountFraction = route.amount
        .toDec()
        .quoTruncate(sumAmount.toDec());

      let previousInDenom = route.tokenInDenom;
      let previousInAmount = route.amount;

      let beforeSpotPriceInOverOut: Dec = new Dec(1);
      let afterSpotPriceInOverOut: Dec = new Dec(1);
      let effectivePriceInOverOut: Dec = new Dec(1);
      let swapFee: Dec = new Dec(0);

      for (let i = 0; i < route.pools.length; i++) {
        const pool = route.pools[i];
        const outDenom = route.tokenOutDenoms[i];

        let poolSwapFee = pool.swapFee;
        if (
          routes.length === 1 &&
          isOsmoRoutedMultihop(
            routes[0].pools.map((routePool) => ({
              id: routePool.id,
              isIncentivized: this._incentivizedPoolIds.includes(routePool.id),
            })),
            route.tokenOutDenoms[0],
            this.stakeCurrencyMinDenom
          )
        ) {
          isMultihopOsmoFeeDiscount = true;
          const { maxSwapFee, swapFeeSum } = getOsmoRoutedMultihopTotalSwapFee(
            routes[0].pools
          );
          poolSwapFee = maxSwapFee.mul(poolSwapFee.quo(swapFeeSum));
        }

        // less fee
        const tokenOut = pool.getTokenOutByTokenIn(
          { denom: previousInDenom, amount: previousInAmount },
          outDenom,
          poolSwapFee
        );

        if (!tokenOut.amount.gt(new Int(0))) {
          // not enough liquidity
          console.warn("Token out is 0 through pool:", pool.id);

          return {
            ...tokenOut,
            tokenInFeeAmount: new Int(0),
            swapFee,
            multiHopOsmoDiscount: false,
          };
        }

        beforeSpotPriceInOverOut = beforeSpotPriceInOverOut.mulTruncate(
          tokenOut.beforeSpotPriceInOverOut
        );
        afterSpotPriceInOverOut = afterSpotPriceInOverOut.mulTruncate(
          tokenOut.afterSpotPriceInOverOut
        );
        effectivePriceInOverOut = effectivePriceInOverOut.mulTruncate(
          tokenOut.effectivePriceInOverOut
        );
        swapFee = swapFee.add(new Dec(1).sub(swapFee).mulTruncate(poolSwapFee));

        // is last pool
        if (i === route.pools.length - 1) {
          totalOutAmount = totalOutAmount.add(tokenOut.amount);

          totalBeforeSpotPriceInOverOut = totalBeforeSpotPriceInOverOut.add(
            beforeSpotPriceInOverOut.mulTruncate(amountFraction)
          );
          totalAfterSpotPriceInOverOut = totalAfterSpotPriceInOverOut.add(
            afterSpotPriceInOverOut.mulTruncate(amountFraction)
          );
          totalEffectivePriceInOverOut = totalEffectivePriceInOverOut.add(
            effectivePriceInOverOut.mulTruncate(amountFraction)
          );
          totalSwapFee = totalSwapFee.add(swapFee.mulTruncate(amountFraction));
        } else {
          previousInDenom = outDenom;
          previousInAmount = tokenOut.amount;
        }
      }
    }

    const priceImpact = totalEffectivePriceInOverOut
      .quo(totalBeforeSpotPriceInOverOut)
      .sub(new Dec("1"));

    return {
      amount: totalOutAmount,
      beforeSpotPriceInOverOut: totalBeforeSpotPriceInOverOut,
      beforeSpotPriceOutOverIn: new Dec(1).quoTruncate(
        totalBeforeSpotPriceInOverOut
      ),
      afterSpotPriceInOverOut: totalAfterSpotPriceInOverOut,
      afterSpotPriceOutOverIn: new Dec(1).quoTruncate(
        totalAfterSpotPriceInOverOut
      ),
      effectivePriceInOverOut: totalEffectivePriceInOverOut,
      effectivePriceOutOverIn: new Dec(1).quoTruncate(
        totalEffectivePriceInOverOut
      ),
      tokenInFeeAmount: sumAmount.sub(
        new Dec(sumAmount).mulTruncate(new Dec(1).sub(totalSwapFee)).round()
      ),
      swapFee: totalSwapFee,
      multiHopOsmoDiscount: isMultihopOsmoFeeDiscount,
      priceImpact,
    };
  }
}
