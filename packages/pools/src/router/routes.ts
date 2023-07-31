import { Dec, Int } from "@keplr-wallet/unit";
import {
  getOsmoRoutedMultihopTotalSwapFee,
  isOsmoRoutedMultihop,
} from "@osmosis-labs/math";

import { NotEnoughLiquidityError } from "../errors";
import { NoRouteError } from "./errors";
import {
  cacheKeyForRoute,
  cacheKeyForRouteDenoms,
  Route,
  RouteWithInAmount,
  validateRoute,
} from "./route";
import {
  Quote,
  RoutablePool,
  SplitTokenInQuote,
  Token,
  TokenOutGivenInRouter,
} from "./types";
import {
  cacheKeyForTokenOutGivenIn,
  invertRoute,
  validateRoutes,
  validateTokenIn,
} from "./utils";

export type OptimizedRoutesParams = {
  /** All pools to be routed through. */
  pools: ReadonlyArray<RoutablePool>;
  /** IDs of pools to be prioritized in route selection. */
  preferredPoolIds?: string[];
  /** IDs of pools receiving OSMO incentives. */
  incentivizedPoolIds: string[];
  /** Min/base denom of stake currency of chain (OSMO) */
  stakeCurrencyMinDenom: string;
  /** Fetch pool total value locked (liquidity) by pool ID. */
  getPoolTotalValueLocked: (poolId: string) => Dec;

  // LIMITS
  /** Max number of pools to hop through. */
  maxHops?: number;
  /** Max number of routes to find. */
  maxRoutes?: number;
  /** Max number of routes a swap should be split through. */
  maxSplit?: number;
  /** Max number of iterations to test for route splits.
   *  i.e. 10 means 0%, 10%, 20%, ..., 100% of the in amount. */
  maxSplitIterations?: number;
};

/** Use to find routes and simulate swaps through routes.
 *
 *  Maintains a cache for routes and swaps for the lifetime of the instance.
 *  No filtering assumptions are made on provided pools, pools are routed as given.
 *  @throws NotEnoughLiquidityError if there is not enough liquidity in a route.
 *  @throws NoRouteError if there is no route between the tokens.
 */
export class OptimizedRoutes implements TokenOutGivenInRouter {
  protected readonly _sortedPools: RoutablePool[];
  protected readonly _preferredPoolIds?: string[];
  protected readonly _incentivizedPoolIds: string[];
  protected readonly _stakeCurrencyMinDenom: string;
  protected readonly _getPoolTotalValueLocked: (poolId: string) => Dec;

  // limits
  protected readonly _maxHops: number;
  protected readonly _maxRoutes: number;
  protected readonly _maxSplit: number;
  protected readonly _maxSplitIterations: number;

  // caches
  protected readonly _candidateRoutesCache: Map<string, Route[]> = new Map();
  protected readonly _calcOutAmtGivenInAmtCache: Map<string, Quote> = new Map();
  protected readonly _calcRouteOutAmtGivenInAmtCache: Map<string, Int> =
    new Map();

  constructor({
    pools,
    preferredPoolIds,
    incentivizedPoolIds,
    stakeCurrencyMinDenom,
    getPoolTotalValueLocked,
    maxHops = 4,
    maxRoutes = 4,
    maxSplit = 2,
    maxSplitIterations = 10,
  }: OptimizedRoutesParams) {
    this._sortedPools = pools
      .slice()
      // Sort by the total value locked.
      .sort((a, b) => {
        const aTvl = getPoolTotalValueLocked(a.id);
        const bTvl = getPoolTotalValueLocked(b.id);
        return Number(bTvl.sub(aTvl).toString());
      })
      // lift preferred pools to the front
      .reduce((pools, pool) => {
        if (preferredPoolIds && preferredPoolIds.includes(pool.id)) {
          pools.unshift(pool);
        } else {
          pools.push(pool);
        }
        return pools;
      }, [] as RoutablePool[]);
    this._preferredPoolIds = preferredPoolIds;
    this._incentivizedPoolIds = incentivizedPoolIds;
    this._stakeCurrencyMinDenom = stakeCurrencyMinDenom;
    this._getPoolTotalValueLocked = getPoolTotalValueLocked;
    if (maxHops > 5) throw new Error("maxHops must be less than 6");
    this._maxHops = maxHops;
    if (maxRoutes > 6) throw new Error("maxRoutes must be less than 7");
    this._maxRoutes = maxRoutes;
    if (maxSplitIterations >= 100)
      throw new Error("maxIterations must be less than 100");
    if (maxSplit > this._maxRoutes)
      console.warn("maxRoutes is less than max split, will be used instead");
    this._maxSplit = maxSplit;
    if (maxSplitIterations <= 0)
      throw new Error("maxIterations must be greater than 0");
    this._maxSplitIterations = maxSplitIterations;
  }

  async routeByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string
  ): Promise<SplitTokenInQuote> {
    const split = await this.getOptimizedRoutesByTokenIn(
      tokenIn,
      tokenOutDenom
    );
    const quote = await this.calculateTokenOutByTokenIn(split);
    return quote;
  }

  async getOptimizedRoutesByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string
  ): Promise<RouteWithInAmount[]> {
    if (this._sortedPools.length === 0) {
      return [];
    }
    validateTokenIn(tokenIn, tokenOutDenom);

    let routes = this.getCandidateRoutes(tokenIn.denom, tokenOutDenom);

    // find routes with swapped in/out tokens since getCandidateRoutes is a greedy algorithm
    const tokenOutToInRoutes = this.getCandidateRoutes(
      tokenOutDenom,
      tokenIn.denom
    );
    const invertedRoutes = tokenOutToInRoutes.map(invertRoute);
    routes = [...routes, ...invertedRoutes];

    // shortest first
    routes = routes.sort((a, b) => a.pools.length - b.pools.length);

    if (routes.length === 0) {
      throw new NoRouteError();
    }

    // filter routes by enough entry liquidity
    const routesInitialLimitAmounts = await Promise.all(
      routes.map((route) =>
        route.pools[0].getLimitAmountByTokenIn(tokenIn.denom)
      )
    );
    routes = routes.filter((_, i) =>
      routesInitialLimitAmounts[i].gte(tokenIn.amount)
    );

    if (routes.length === 0) {
      throw new NotEnoughLiquidityError();
    }

    // filter routes by unique pools, maintaining sort order
    const uniquePoolIds = new Set<string>();
    routes = routes.reduce((includedRoutes, route) => {
      if (route.pools.some(({ id }) => uniquePoolIds.has(id))) {
        return includedRoutes;
      } else {
        route.pools.forEach(({ id }) => uniquePoolIds.add(id));
        includedRoutes.push(route);
        return includedRoutes;
      }
    }, [] as Route[]);

    // prioritize (pick) routes by preference
    if (this._preferredPoolIds && this._preferredPoolIds.length > 0) {
      routes = routes.reduce((routes, route) => {
        if (
          this._preferredPoolIds &&
          route.pools.some((pool) => this._preferredPoolIds?.includes(pool.id))
        ) {
          routes.unshift(route);
        } else {
          routes.push(route);
        }
        return routes;
      }, [] as Route[]);
    }

    // if any of top 2 routes include a preferred pool, split through them
    const selectedSplit = routes.slice(0, this._maxSplit);

    const splitIncludesPreferredPool =
      routes.length > 1
        ? selectedSplit.some(({ pools }) =>
            pools.some(({ id }) => this._preferredPoolIds?.includes(id))
          )
        : false;

    const split = (
      await this.findBestSplitTokenIn(selectedSplit, tokenIn.amount)
    ).sort((a, b) => Number(b.initialAmount.sub(a.initialAmount)));

    if (splitIncludesPreferredPool || selectedSplit.length === 1) return split;

    const directOutAmount = (
      await this.calculateTokenOutByTokenIn([
        { ...routes[0], initialAmount: tokenIn.amount },
      ])
    ).amount;

    const splitOutAmount = (await this.calculateTokenOutByTokenIn(split))
      .amount;

    if (directOutAmount.gte(splitOutAmount)) {
      return [{ ...routes[0], initialAmount: tokenIn.amount }];
    } else {
      return split;
    }
  }

  async calculateTokenOutByTokenIn(
    routes: RouteWithInAmount[]
  ): Promise<SplitTokenInQuote> {
    validateRoutes(routes);

    /** Tracks special case when routing through _only_ 2 OSMO pools for a single route. */
    const osmoFeeDiscountForRoute = new Array(routes.length).fill(false);

    let totalOutAmount: Int = new Int(0);
    let totalBeforeSpotPriceInOverOut: Dec = new Dec(0);
    let totalAfterSpotPriceInOverOut: Dec = new Dec(0);
    let totalEffectivePriceInOverOut: Dec = new Dec(0);
    let totalSwapFee: Dec = new Dec(0);
    let totalNumTicksCrossed = 0;
    const routePoolsSwapFees: Dec[][] = [];

    const sumInitialAmount = routes.reduce(
      (sum, route) => sum.add(route.initialAmount),
      new Int(0)
    );

    if (routes.length > 0 && sumInitialAmount.isZero()) {
      throw new Error("All initial amounts are zero");
    }

    for (const route of routes) {
      const amountFraction = route.initialAmount
        .toDec()
        .quoTruncate(sumInitialAmount.toDec());

      let previousInDenom = route.tokenInDenom;
      let previousInAmount = route.initialAmount;

      let beforeSpotPriceInOverOut: Dec = new Dec(1);
      let afterSpotPriceInOverOut: Dec = new Dec(1);
      let effectivePriceInOverOut: Dec = new Dec(1);
      let poolsSwapFee: Dec = new Dec(0);
      const poolsSwapFees: Dec[] = [];

      for (let i = 0; i < route.pools.length; i++) {
        const pool = route.pools[i];
        const outDenom = route.tokenOutDenoms[i];

        let poolSwapFee = pool.swapFee;
        if (
          isOsmoRoutedMultihop(
            route.pools.map(({ id }) => ({
              id,
              isIncentivized: this._incentivizedPoolIds.includes(id),
            })),
            route.tokenOutDenoms[0],
            this._stakeCurrencyMinDenom
          )
        ) {
          osmoFeeDiscountForRoute[routes.indexOf(route)] = true;
          const { maxSwapFee, swapFeeSum } = getOsmoRoutedMultihopTotalSwapFee(
            route.pools
          );
          poolSwapFee = maxSwapFee.mul(poolSwapFee.quo(swapFeeSum));
        }
        poolsSwapFees.push(poolSwapFee);

        // calc out given in through pool, cached
        const calcOutGivenInParams = [
          { denom: previousInDenom, amount: previousInAmount },
          outDenom,
          poolSwapFee, // fee may be lesser
        ] as const;
        const cacheKey = cacheKeyForTokenOutGivenIn(
          pool.id,
          ...calcOutGivenInParams
        );
        const cacheHit = this._calcOutAmtGivenInAmtCache.get(cacheKey);
        let tokenOut;
        if (cacheHit) {
          tokenOut = cacheHit;
        } else {
          tokenOut = await pool.getTokenOutByTokenIn(...calcOutGivenInParams);
          this._calcOutAmtGivenInAmtCache.set(cacheKey, tokenOut);
        }

        if (tokenOut.amount.lte(new Int(0)))
          throw new NotEnoughLiquidityError();

        if (tokenOut.numTicksCrossed) {
          totalNumTicksCrossed += tokenOut.numTicksCrossed;
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
        poolsSwapFee = poolsSwapFee.add(
          new Dec(1).sub(poolsSwapFee).mulTruncate(poolSwapFee)
        );

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
          totalSwapFee = totalSwapFee.add(
            poolsSwapFee.mulTruncate(amountFraction)
          );
        } else {
          previousInDenom = outDenom;
          previousInAmount = tokenOut.amount;
        }
      }
      routePoolsSwapFees.push(poolsSwapFees);
    }

    const priceImpactTokenOut = totalBeforeSpotPriceInOverOut.gt(new Dec(0))
      ? totalEffectivePriceInOverOut
          .quo(totalBeforeSpotPriceInOverOut)
          .sub(new Dec(1))
      : new Dec(0);

    return {
      split: routes
        .map((route, i) => ({
          ...route,
          effectiveSwapFees: routePoolsSwapFees[i],
          multiHopOsmoDiscount: osmoFeeDiscountForRoute[i],
        }))
        .sort((a, b) =>
          Number(b.initialAmount.sub(a.initialAmount).toString())
        ),
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
      tokenInFeeAmount: sumInitialAmount.sub(
        new Dec(sumInitialAmount)
          .mulTruncate(new Dec(1).sub(totalSwapFee))
          .round()
      ),
      swapFee: totalSwapFee,
      priceImpactTokenOut,
      numTicksCrossed: totalNumTicksCrossed,
    };
  }

  /** Greedily find potential fully unique (no duplicate pools) routes through pools without optimization.
   *
   *  @param tokenInDenom The input token denom.
   *  @param tokenOutDenom The output token denom.
   *  @param opts Options for the search.
   */
  protected getCandidateRoutes(
    tokenInDenom: string,
    tokenOutDenom: string,
    pools = this._sortedPools
  ): Route[] {
    if (pools.length === 0) {
      return [];
    }

    const cacheKey = cacheKeyForRouteDenoms(tokenInDenom, tokenOutDenom);
    const cached = this._candidateRoutesCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const routes: Route[] = [];

    const findRoutes = (
      tokenInDenom: string,
      tokenOutDenom: string,
      currentRoute: RoutablePool[],
      currentTokenOuts: string[],
      poolsUsed: boolean[],
      _previousTokenOuts?: string[]
    ) => {
      if (currentRoute.length > this._maxHops) return;

      if (
        currentRoute.length > 0 &&
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        currentRoute[currentRoute.length - 1]!.poolAssetDenoms.includes(
          tokenOutDenom
        )
      ) {
        const foundRoute: Route = {
          pools: currentRoute.slice(),
          tokenOutDenoms: [...currentTokenOuts, tokenOutDenom],
          tokenInDenom,
        };
        routes.push(foundRoute);
        return;
      }

      if (routes.length > this._maxRoutes) {
        // only find top routes by iterating all pools by high liquidity first
        return;
      }

      for (let i = 0; i < pools.length; i++) {
        if (poolsUsed[i]) {
          continue; // skip pool
        }

        const previousTokenOuts = _previousTokenOuts
          ? _previousTokenOuts
          : [tokenInDenom]; // imaginary prev pool

        const curPool = pools[i];

        let prevPoolCurPoolTokenMatch: string | undefined;
        curPool.poolAssetDenoms.forEach((denom) =>
          previousTokenOuts.forEach((d) => {
            if (d === denom) {
              prevPoolCurPoolTokenMatch = denom;
            }
          })
        );
        if (!prevPoolCurPoolTokenMatch) {
          continue; // skip pool
        }

        currentRoute.push(curPool);
        if (
          currentRoute.length > 1 &&
          prevPoolCurPoolTokenMatch !== tokenInDenom &&
          prevPoolCurPoolTokenMatch !== tokenOutDenom
        ) {
          currentTokenOuts.push(prevPoolCurPoolTokenMatch);
        }
        poolsUsed[i] = true;
        findRoutes(
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

    findRoutes(
      tokenInDenom,
      tokenOutDenom,
      [],
      [],
      Array<boolean>(pools.length).fill(false)
    );
    const validRoutes = routes.filter(
      (route) =>
        validateRoute(route, false) && route.pools.length <= this._maxHops
    );
    this._candidateRoutesCache.set(cacheKey, validRoutes);
    return validRoutes;
  }

  /**
   * This function performs a binary search to find a subset of candidate routes that yield an optimal split trade.
   * It takes into account the input token amount and the maximum number of iterations allowed.
   *
   * The time complexity of the splitRecursive function can be expressed as O(n * m), where:
   *   - n is the number of elements in sortedOptimalRoutes
   *   - m is the value of maxIterations
   *
   * @function findBestSplitTokenIn
   * @async
   * @param sortedOptimalRoutes An array of optimal routes for the split trade. Optimal: will attempt to include all routes in same split. Sorted: routes should be sorted by weight, best first since this is a greedy search.
   * @param tokenInAmount The amount of input tokens for the trade.
   * @returns A promise that resolves to an array of routes with their corresponding input amounts, which form the optimal split trade.
   * @throws Throws an error if maxIterations is not greater than 0. Throws an error if there is not enough liquidity for the split trade or in a route.
   */
  protected async findBestSplitTokenIn(
    sortedOptimalRoutes: Route[],
    tokenInAmount: Int
  ): Promise<RouteWithInAmount[]> {
    if (sortedOptimalRoutes.length > this._maxSplitIterations) {
      throw new Error(
        "maxIterations must be greater than or equal to the number of routes"
      );
    }

    if (sortedOptimalRoutes.length === 0) {
      return [];
    }
    // nothing to split
    if (sortedOptimalRoutes.length === 1) {
      return [
        {
          ...sortedOptimalRoutes[0],
          initialAmount: tokenInAmount,
        },
      ];
    }

    /** Only relevant to this search, track the out amount for this route of a certain in amount. */
    type RouteWithInAndOutAmount = RouteWithInAmount & { outAmount: Int };

    let bestSplit: RouteWithInAmount[] = [];
    let bestOutAmount = new Int(0);

    // DFS on the % then the route
    const splitRecursive = async (
      remainingInAmount: Int,
      remainingRoutes: RouteWithInAndOutAmount[],
      currentSplit: RouteWithInAndOutAmount[]
    ): Promise<void> => {
      // base case: once all routes have been accounted for, check if maximal case
      if (remainingRoutes.length === 0) {
        const totalOutAmount = currentSplit.reduce(
          (total, route) => total.add(route.outAmount),
          new Int(0)
        );
        if (totalOutAmount.gt(bestOutAmount)) {
          bestOutAmount = totalOutAmount;
          // deep copy to preserve optimal initial amounts and out amounts that would get mutated
          bestSplit = currentSplit.map((route) => ({
            ...route,
            initialAmount: new Int(route.initialAmount.toString()),
            outAmount: new Int(route.outAmount.toString()),
          }));
        }

        // unfurl recursion
        return;
      }

      // test routes with various splits: 0%, 10%, 20%, ..., 100% @ maxIterations = 10
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const route = remainingRoutes.shift()! as RouteWithInAndOutAmount;
      for (let i = 0; i <= this._maxSplitIterations; i++) {
        const fraction = new Dec(i).quo(new Dec(this._maxSplitIterations));
        const inAmount = new Dec(remainingInAmount).mul(fraction).truncate();
        if (inAmount.isZero()) continue; // skip this traversal (0 in not worth considering)

        route.initialAmount = inAmount;

        const cacheKey = cacheKeyForRoute(route);
        const cacheHit = this._calcRouteOutAmtGivenInAmtCache.get(cacheKey);
        let outAmount;
        if (cacheHit) {
          outAmount = cacheHit;
        } else {
          try {
            const { amount } = await this.calculateTokenOutByTokenIn([route]);
            this._calcRouteOutAmtGivenInAmtCache.set(cacheKey, amount);
            outAmount = amount;
          } catch (e) {
            if (e instanceof NotEnoughLiquidityError) {
              continue; // skip this traversal and similar future attempted traversals (not enough liquidity)
            } else {
              console.warn(
                "Unexpected error when simulating potential split",
                e
              );
              continue;
            }
          }
        }

        route.outAmount = outAmount;

        currentSplit.push(route);
        await splitRecursive(
          remainingInAmount.sub(inAmount),
          remainingRoutes,
          currentSplit
        );
        currentSplit.pop();
      }

      remainingRoutes.unshift(route);
    };

    // start with routes with 0 in and out amount, as we're looking for the sum max out amounts
    const zeroAmountRoutes = sortedOptimalRoutes.map((route) => ({
      ...route,
      initialAmount: new Int(0),
      outAmount: new Int(0),
    }));
    await splitRecursive(tokenInAmount, zeroAmountRoutes, []);

    // Not enough liquidity
    const totalLimitAmount = bestSplit.reduce(
      (acc, route) => acc.add(route.initialAmount),
      new Int(0)
    );
    if (totalLimitAmount.lt(tokenInAmount)) {
      throw new NotEnoughLiquidityError(
        `Entry pools' limit amount ${totalLimitAmount.toString()} is less than in amount ${tokenInAmount.toString()}`
      );
    }

    return bestSplit;
  }
}
