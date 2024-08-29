import { Dec, Int } from "@keplr-wallet/unit";

import { NotEnoughLiquidityError, NotEnoughQuotedError } from "../errors";
import { NoRouteError } from "./errors";
import {
  cacheKeyForRoute,
  cacheKeyForRouteDenoms,
  Route,
  routeToString,
  RouteWithInAmount,
  validateRoute,
} from "./route";
import {
  Logger,
  Quote,
  RoutablePool,
  SplitTokenInQuote,
  SplitTokenOutQuote,
  Token,
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
  /** **Ordered** IDs of pools to be prioritized in route selection.
   *  The first pools in the array will be selected first. */
  preferredPoolIds?: string[];
  /** Fetch pool total value locked (liquidity) by pool ID. */
  getPoolTotalValueLocked: (poolId: string) => Dec;

  // LIMITS
  /** Max number of pools to hop through.
   *  Default: 4 */
  maxHops?: number;
  /** Max number of routes to find.
   *  Default: 4 */
  maxRoutes?: number;
  /** Max number of routes a swap should be split through.
   *  Default: 2 */
  maxSplit?: number;
  /** Max number of iterations to test for route splits. Must be less than or equal to 100.
   *  i.e. 10 means 0%, 10%, 20%, ..., 100% of the in amount.
   *  Default: 10 (schemed above) */
  maxSplitIterations?: number;

  /** Object used for logging information about current routes. Console can be used. */
  logger?: Logger;
};

/** Use to find routes and simulate swaps through routes.
 *
 *  Maintains a cache for routes and swaps for the lifetime of the instance.
 *  No filtering assumptions are made on provided pools, pools are routed as given.
 *  @throws NotEnoughLiquidityError if there is not enough liquidity in a route.
 *  @throws NoRouteError if there is no route between the tokens.
 */
export class OptimizedRoutes {
  protected readonly _sortedPools: RoutablePool[];
  protected readonly _preferredPoolIds?: string[];
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

  protected readonly _logger?: Logger;

  constructor({
    pools,
    preferredPoolIds,
    getPoolTotalValueLocked,
    maxHops = 4,
    maxRoutes = 6,
    maxSplit = 2,
    maxSplitIterations = 10,
    logger,
  }: OptimizedRoutesParams) {
    let sortedPools = pools
      .slice()
      // Sort by the total value locked.
      .sort((a, b) => {
        const aTvl = getPoolTotalValueLocked(a.id);
        const bTvl = getPoolTotalValueLocked(b.id);
        return Number(bTvl.sub(aTvl).toString());
      });

    // Append preferred pools in order to the list of sorted pools, while also including the sorted pools at the end
    sortedPools = preferredPoolIds
      ? [
          ...preferredPoolIds
            .map((id) => sortedPools.find((pool) => pool.id === id))
            .filter((pool): pool is RoutablePool => !!pool),
          ...sortedPools.filter((pool) => !preferredPoolIds.includes(pool.id)),
        ]
      : sortedPools;

    this._sortedPools = sortedPools;
    this._preferredPoolIds = preferredPoolIds;
    this._getPoolTotalValueLocked = getPoolTotalValueLocked;
    if (maxHops > 5) throw new Error("maxHops must be less than 6");
    this._maxHops = maxHops;
    if (maxRoutes > 6) throw new Error("maxRoutes must be less than 7");
    this._maxRoutes = maxRoutes;
    if (maxSplitIterations > 100)
      throw new Error("maxIterations must be less than or equal to 100");
    if (maxSplit > this._maxRoutes)
      logger?.warn("maxRoutes is less than max split, will be used instead");
    this._maxSplit = maxSplit;
    if (maxSplitIterations <= 0)
      throw new Error("maxIterations must be greater than 0");
    this._maxSplitIterations = maxSplitIterations;

    logger?.info("Routing through", sortedPools.length, "pools");

    this._logger = logger;
  }

  async routeByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string,
    forcePoolId?: string
  ): Promise<SplitTokenInQuote> {
    if (forcePoolId) {
      const pool = this._sortedPools.find((pool) => pool.id === forcePoolId);
      if (!pool) throw new NoRouteError();

      const route: RouteWithInAmount = {
        pools: [pool],
        tokenInDenom: tokenIn.denom,
        tokenOutDenoms: [tokenOutDenom],
        initialAmount: tokenIn.amount,
      };

      return await this.calculateTokenOutByTokenIn([route]);
    }

    const split = await this.getOptimizedRoutesByTokenIn(
      tokenIn,
      tokenOutDenom
    );
    const quote = await this.calculateTokenOutByTokenIn(split);
    return quote;
  }

  async routeByTokenOut(
    _tokenOut: Token,
    _tokenInDenom: string,
    _forcePoolId?: string | undefined
  ): Promise<SplitTokenOutQuote> {
    throw new Error("TFM Router does not implement in given out");
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

    if (routes.length === 0) {
      throw new NoRouteError();
    }

    // filter routes by enough entry liquidity
    // the reason we do this is because the getCandidateRoutes algorithm is greedy and doesn't consider the liquidity of the entry pool
    // since the pools are sorted by liquidity, we can assume that if the first pool doesn't have enough liquidity, then no subsequent pool will in that route
    const routesInitialLimitAmounts = routes.map((route) => {
      const pool = this._sortedPools.find(
        (pool) => pool.id === route.pools[0].id
      );
      if (!pool) throw new Error("Pool not found");
      return pool.getLimitAmountByTokenIn(tokenIn.denom);
    });
    routes = routes.filter((_, i) =>
      routesInitialLimitAmounts[i].gte(tokenIn.amount)
    );

    if (routes.length === 0) {
      throw new NotEnoughLiquidityError();
    }

    // shortest first
    routes = routes.sort((a, b) => a.pools.length - b.pools.length);

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
      // Maintain order of preferred routes.
      const preferredRoutes: Route[] = [];
      // Maintain order of non-preferred routes.
      const nonPreferredRoutes: Route[] = [];

      routes.forEach((route) => {
        if (
          this._preferredPoolIds &&
          route.pools.some((pool) => this._preferredPoolIds?.includes(pool.id))
        ) {
          preferredRoutes.push(route);
        } else {
          nonPreferredRoutes.push(route);
        }
      });

      // Preferred routes first, then non-preferred routes.
      routes = [...preferredRoutes, ...nonPreferredRoutes];
    }

    this._logger?.info(
      "Candidate routes",
      routes.map((r) => routeToString(r))
    );

    // if any of top 2 routes include a preferred pool, split through them
    const splitableRoutes = routes.slice(0, this._maxSplit);

    this._logger?.info(
      "Split or direct through",
      splitableRoutes.map((r) => routeToString(r))
    );

    // If at least one of the routes is not enough quoted AND
    // all routes fail, then we assume that this is the main error for the quote overall
    let isNotEnoughQuoted = false;

    const directQuotes = (
      await Promise.all(
        splitableRoutes.map(async (route, index) => {
          try {
            return await this.calculateTokenOutByTokenIn([
              {
                ...route,
                initialAmount: tokenIn.amount,
              },
            ]);
          } catch (e) {
            if (e instanceof NotEnoughQuotedError) {
              isNotEnoughQuoted = true;
            }

            // if there's not enough liquidity, skip this route
            this._logger?.error(
              `Dismissing direct route at index: ${index}:`,
              e
            );
            this._logger?.info(`Route ${index}:`, routeToString(route));
            return Promise.resolve(undefined);
          }
        })
      )
    ).filter(
      (
        quote
      ): quote is Awaited<ReturnType<typeof this.calculateTokenOutByTokenIn>> =>
        Boolean(quote)
    );

    let splitQuote:
      | Awaited<ReturnType<typeof this.calculateTokenOutByTokenIn>>
      | undefined;
    if (this._maxSplit > 1) {
      try {
        splitQuote = await this.calculateTokenOutByTokenIn(
          (
            await this.findBestSplitTokenIn(splitableRoutes, tokenIn.amount)
          ).sort((a, b) => Number(b.initialAmount.sub(a.initialAmount)))
        );
      } catch (e) {
        // if there's not enough liquidity, skip this route
        this._logger?.error("Dismissing split route:", e);
        this._logger?.info(
          "Routes:",
          splitableRoutes.map((route) => routeToString(route))
        );
      }
    }

    if (directQuotes.length === 0 && !splitQuote) {
      if (isNotEnoughQuoted) {
        throw new NotEnoughQuotedError();
      }

      throw new NoRouteError();
    }

    const bestQuote = directQuotes
      .concat(splitQuote ?? [])
      .reduce<SplitTokenInQuote | null>((bestQuote, curQuote) => {
        if (bestQuote && curQuote.amount.gt(bestQuote.amount)) return curQuote;
        else return bestQuote ?? curQuote;
      }, null);

    if (bestQuote)
      this._logger?.info(
        "Picked quote with route",
        routeToString(bestQuote?.split[0])
      );

    return bestQuote?.split ?? [];
  }

  async calculateTokenOutByTokenIn(
    routes: RouteWithInAmount[]
  ): Promise<SplitTokenInQuote> {
    validateRoutes(routes);

    let totalOutAmount: Int = new Int(0);
    let totalBeforeSpotPriceInOverOut: Dec = new Dec(0);
    let totalAfterSpotPriceInOverOut: Dec = new Dec(0);
    let totalEffectivePriceInOverOut: Dec = new Dec(0);
    let totalSwapFee: Dec = new Dec(0);

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

      for (let i = 0; i < route.pools.length; i++) {
        const pool = this._sortedPools.find(
          (pool) => pool.id === route.pools[i].id
        );
        if (!pool) throw new Error("Pool not found");

        const outDenom = route.tokenOutDenoms[i];

        if (previousInAmount.isZero()) {
          throw new NotEnoughQuotedError();
        }

        // calc out given in through pool, cached
        const calcOutGivenInParams = [
          { denom: previousInDenom, amount: previousInAmount },
          outDenom,
          pool.swapFee, // fee may be lesser
        ] as const;
        const cacheKey = cacheKeyForTokenOutGivenIn(
          pool.id,
          ...calcOutGivenInParams
        );
        const cacheHit = this._calcOutAmtGivenInAmtCache.get(cacheKey);
        let quoteOut: Quote;
        if (cacheHit) {
          quoteOut = cacheHit;
        } else {
          quoteOut = await pool.getTokenOutByTokenIn(...calcOutGivenInParams);
          this._calcOutAmtGivenInAmtCache.set(cacheKey, quoteOut);
        }

        /** If the pool doesn't contain the estimated out amount, there's
         *  not enough liquidity. */
        if (quoteOut.amount.lte(new Int(0))) throw new NotEnoughQuotedError();

        beforeSpotPriceInOverOut = quoteOut.beforeSpotPriceInOverOut
          ? beforeSpotPriceInOverOut.mulTruncate(
              quoteOut.beforeSpotPriceInOverOut
            )
          : beforeSpotPriceInOverOut;
        afterSpotPriceInOverOut = quoteOut.afterSpotPriceInOverOut
          ? afterSpotPriceInOverOut.mulTruncate(
              quoteOut.afterSpotPriceInOverOut
            )
          : afterSpotPriceInOverOut;
        effectivePriceInOverOut = quoteOut.effectivePriceInOverOut
          ? effectivePriceInOverOut.mulTruncate(
              quoteOut.effectivePriceInOverOut
            )
          : effectivePriceInOverOut;
        poolsSwapFee = poolsSwapFee.add(
          new Dec(1).sub(poolsSwapFee).mulTruncate(pool.swapFee)
        );

        // is last pool
        if (i === route.pools.length - 1) {
          totalOutAmount = totalOutAmount.add(quoteOut.amount);

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
          previousInAmount = quoteOut.amount;
        }
      }
    }

    const priceImpactTokenOut = totalBeforeSpotPriceInOverOut.gt(new Dec(0))
      ? totalEffectivePriceInOverOut
          .quo(totalBeforeSpotPriceInOverOut)
          .sub(new Dec(1))
      : new Dec(0);

    return {
      split: routes.sort((a, b) =>
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
    };
  }

  /** Greedily find potential fully unique (no duplicate pools) routes through pools without optimization.
   *
   *  @param tokenInDenom The input token denom.
   *  @param tokenOutDenom The output token denom.
   *  @param pools Pools to use, defaults to instance pools.
   */
  getCandidateRoutes(
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

    // make sure there's at least one pool with token in and one pool with token out
    // otherwise the candidate routes algorithm will hang
    let poolsHaveTokenIn = false;
    let poolsHaveTokenOut = false;
    for (const pool of this._sortedPools) {
      if (pool.poolAssetDenoms.includes(tokenInDenom)) {
        poolsHaveTokenIn = true;
      }
      if (pool.poolAssetDenoms.includes(tokenOutDenom)) {
        poolsHaveTokenOut = true;
      }
      if (poolsHaveTokenIn && poolsHaveTokenOut) break;
    }
    if (!poolsHaveTokenIn || !poolsHaveTokenOut) {
      this._candidateRoutesCache.set(cacheKey, []);
      return [];
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
        // Create a deep copy of the current route, token outs
        // and pools used.
        const currentPoolRoute = currentRoute.slice();
        const currentPoolTokenOuts = currentTokenOuts.slice();
        const currentPoolsUsed = poolsUsed.slice();

        if (currentPoolsUsed[i]) {
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

        currentPoolRoute.push(curPool);
        if (
          currentPoolRoute.length > 1 &&
          prevPoolCurPoolTokenMatch !== tokenInDenom &&
          prevPoolCurPoolTokenMatch !== tokenOutDenom
        ) {
          currentPoolTokenOuts.push(prevPoolCurPoolTokenMatch);
        }
        currentPoolsUsed[i] = true;
        findRoutes(
          tokenInDenom,
          tokenOutDenom,
          currentPoolRoute,
          currentPoolTokenOuts,
          currentPoolsUsed,
          curPool.poolAssetDenoms.filter(
            (denom) => denom !== prevPoolCurPoolTokenMatch
          )
        );
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
    if (sortedOptimalRoutes.length === 1 || this._maxSplitIterations === 1) {
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
              // skip this traversal and similar future attempted traversals (not enough liquidity)
              continue;
            } else {
              // if it's an unexpected error, surface it, but otherwise skip this traversal
              this._logger?.warn(
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
        `Entry pool's limit amount ${totalLimitAmount.toString()} is less than in amount ${tokenInAmount.toString()}`
      );
    }

    return bestSplit;
  }
}
