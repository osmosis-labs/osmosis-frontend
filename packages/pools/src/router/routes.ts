import { Dec, Int } from "@keplr-wallet/unit";
import {
  getOsmoRoutedMultihopTotalSwapFee,
  isOsmoRoutedMultihop,
} from "@osmosis-labs/math";

import { NoPoolsError, NotEnoughLiquidityError } from "../errors";
import {
  MultihopSwapResult,
  RoutablePool,
  Route,
  RouteWithAmount,
} from "./types";

export class OptimizedRoutes {
  protected candidatePathsCache = new Map<string, Route[]>();

  protected _pools: ReadonlyArray<RoutablePool> = [];

  constructor(
    protected readonly pools: ReadonlyArray<RoutablePool>,
    protected readonly incventivizedPoolIds: string[],
    protected readonly stakeCurrencyMinDenom: string,
    protected readonly getPoolTotalValueLocked: (poolId: string) => Dec
  ) {
    // Sort by the total value locked.
    this._pools = [...pools].sort((a, b) => {
      const aTvl = this.getPoolTotalValueLocked(a.id);
      const bTvl = this.getPoolTotalValueLocked(b.id);
      return Number(aTvl.sub(bTvl).toString());
    });
  }

  protected getCandidateRoutes(
    tokenInDenom: string,
    tokenOutDenom: string,
    maxHops = 4,
    maxRouteCount = 3
  ): Route[] {
    if (this.pools.length === 0) {
      return [];
    }
    const cacheKey = `${tokenInDenom}/${tokenOutDenom}`;
    const cached = this.candidatePathsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const poolsUsed = Array<boolean>(this.pools.length).fill(false);
    const routes: Route[] = [];

    const computeRoutes = (
      tokenInDenom: string,
      tokenOutDenom: string,
      currentRoute: RoutablePool[],
      currentTokenOuts: string[],
      poolsUsed: boolean[],
      _previousTokenOuts?: string[]
    ) => {
      if (currentRoute.length > maxHops) return;

      if (
        currentRoute.length > 0 &&
        currentRoute[currentRoute.length - 1]!.poolAssetDenoms.includes(
          tokenOutDenom
        )
      ) {
        const foundRoute: Route = {
          pools: [...currentRoute],
          tokenOutDenoms: [...currentTokenOuts, tokenOutDenom],
          tokenInDenom,
        };
        routes.push(foundRoute);
        return;
      }

      if (routes.length >= maxRouteCount) {
        // only find top routes by iterating all pools by high liquidity first
        return;
      }

      for (let i = 0; i < this.pools.length; i++) {
        if (poolsUsed[i]) {
          continue; // skip pool
        }

        const previousTokenOuts = _previousTokenOuts
          ? _previousTokenOuts
          : [tokenInDenom]; // imaginary prev pool

        const curPool = this.pools[i];
        let prevPoolCurPoolTokenMatch: string | undefined;
        const curPoolContainsAssetOutOfLastPool =
          previousTokenOuts &&
          curPool.poolAssetDenoms.some((denom) =>
            previousTokenOuts.some((d) => {
              if (d === denom) {
                prevPoolCurPoolTokenMatch = denom;
                return true;
              }
              return false;
            })
          );
        if (!curPoolContainsAssetOutOfLastPool || !prevPoolCurPoolTokenMatch) {
          continue; // skip pool
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
          curPool.poolAssetDenoms.filter(
            (denom) => denom !== prevPoolCurPoolTokenMatch
          )
        );
        poolsUsed[i] = false;
        currentTokenOuts.pop();
        currentRoute.pop();
      }
    };

    computeRoutes(tokenInDenom, tokenOutDenom, [], [], poolsUsed);
    this.candidatePathsCache.set(cacheKey, routes);

    // TODO: since we use a greedy algorithm, also find routes in reverse

    return routes.filter(({ pools }) => pools.length <= maxHops);
  }

  getOptimizedRoutesByTokenIn(
    tokenIn: {
      denom: string;
      amount: Int;
    },
    tokenOutDenom: string,
    maxPools: number,
    maxRoutes = 3
  ): RouteWithAmount[] {
    if (!tokenIn.amount.isPositive()) {
      throw new Error("Token in amount is zero or negative");
    }

    let routes = this.getCandidateRoutes(
      tokenIn.denom,
      tokenOutDenom,
      maxPools,
      maxRoutes
    );

    // prioritize shorter routes
    routes = routes.sort((path1, path2) => {
      return path1.pools.length < path2.pools.length ? -1 : 1;
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

      // TODO: use total value locked
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
        initialAmount: amount,
      };
    });
  }

  async calculateTokenOutByTokenIn(
    routes: RouteWithAmount[]
  ): Promise<MultihopSwapResult> {
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
      sumAmount = sumAmount.add(path.initialAmount);
    }

    let outDenom: string | undefined;
    for (const route of routes) {
      if (route.pools.length !== route.tokenOutDenoms.length) {
        throw new Error(
          `Invalid path: pools and tokenOutDenoms length mismatch, IDs:${route.pools.map(
            (p) => p.id
          )} ${route.pools
            .flatMap((p) => p.poolAssetDenoms)
            .join(",")} !== ${route.tokenOutDenoms.join(",")}`
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

      const amountFraction = route.initialAmount
        .toDec()
        .quoTruncate(sumAmount.toDec());

      let previousInDenom = route.tokenInDenom;
      let previousInAmount = route.initialAmount;

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
              isIncentivized: this.incventivizedPoolIds.includes(routePool.id),
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
        const tokenOut = await pool.getTokenOutByTokenIn(
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
