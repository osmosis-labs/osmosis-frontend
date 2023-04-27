import { Dec, Int } from "@keplr-wallet/unit";
import {
  getOsmoRoutedMultihopTotalSwapFee,
  isOsmoRoutedMultihop,
} from "@osmosis-labs/math";

import { NotEnoughLiquidityError } from "../errors";
import { NoRouteError } from "./errors";
import { calculateWeightForRoute, Route } from "./route";
import {
  RoutablePool,
  RouteWithInAmount,
  SplitTokenInQuote,
  TokenOutGivenInRouter,
} from "./types";
import { invertRoute, validateRoutes } from "./utils";

export type OptimizedRoutesParams = {
  pools: ReadonlyArray<RoutablePool>;
  incentivizedPoolIds: string[];
  stakeCurrencyMinDenom: string;
  routeCache?: Map<string, RouteWithInAmount[]>;
  getPoolTotalValueLocked: (poolId: string) => Dec;
  maxHops?: number;
  maxRoutes?: number;
};

export class OptimizedRoutes implements TokenOutGivenInRouter {
  protected readonly _pools: RoutablePool[];
  protected readonly _incentivizedPoolIds: string[];
  protected readonly _stakeCurrencyMinDenom: string;
  protected readonly _candidatePathsCache = new Map<string, Route[]>();
  protected readonly _getPoolTotalValueLocked: (poolId: string) => Dec;
  protected readonly _maxHops: number;
  protected readonly _maxRoutes: number;

  constructor({
    pools,
    incentivizedPoolIds,
    stakeCurrencyMinDenom,
    routeCache,
    getPoolTotalValueLocked,
    maxHops = 4,
    maxRoutes = 4,
  }: OptimizedRoutesParams) {
    // Sort by the total value locked.
    this._pools = pools.slice().sort((a, b) => {
      const aTvl = getPoolTotalValueLocked(a.id);
      const bTvl = getPoolTotalValueLocked(b.id);
      return Number(aTvl.sub(bTvl).toString());
    });
    this._incentivizedPoolIds = incentivizedPoolIds;
    this._stakeCurrencyMinDenom = stakeCurrencyMinDenom;
    if (routeCache) this._candidatePathsCache = routeCache;
    this._getPoolTotalValueLocked = getPoolTotalValueLocked;
    if (maxHops > 5) throw new Error("maxHops must be less than 5");
    this._maxHops = maxHops;
    if (maxRoutes > 10) throw new Error("maxRoutes must be less than 10");
    this._maxRoutes = maxRoutes;
  }

  /** Find optimal routes for a given amount of token in and out token, best first. */
  async getOptimizedRoutesByTokenIn(
    tokenIn: {
      denom: string;
      amount: Int;
    },
    tokenOutDenom: string
  ): Promise<RouteWithInAmount[]> {
    if (!tokenIn.amount.isPositive() || this._pools.length === 0) {
      return [];
    }

    let routes = this.getCandidateRoutes(tokenIn.denom, tokenOutDenom);

    // find routes with swapped in/out tokens since getCandidateRoutes is a greedy algorithm
    const reverseRoutes = this.getCandidateRoutes(tokenOutDenom, tokenIn.denom);
    const invertedRoutes = reverseRoutes.map(invertRoute);
    routes = [...routes, ...invertedRoutes];

    if (routes.length === 0) {
      throw new NoRouteError();
    }

    // sort routes by weight
    const routeWeights = await Promise.all(
      routes.map((route) =>
        calculateWeightForRoute(route, this._getPoolTotalValueLocked)
      )
    );
    routes = routes.sort((path1, path2) => {
      const path1Index = routes.indexOf(path1);
      const path2Index = routes.indexOf(path2);
      const path1Weight = routeWeights[path1Index];
      const path2Weight = routeWeights[path2Index];

      return path1Weight.gte(path2Weight) ? -1 : 1;
    });

    // determine if the routes have enough liquidity --

    // Is direct swap, but not enough liquidity
    if (routes.length > 1 && routes[0].pools.length === 1) {
      const directSwapLimit = await routes[0].pools[0].getLimitAmountByTokenIn(
        tokenIn.denom
      );
      if (directSwapLimit.lt(tokenIn.amount)) {
        routes = routes.slice(1); // remove direct swap route
      }
    }

    const initialSwapAmounts: Int[] = [];
    let totalLimitAmount = new Int(0);
    for (const route of routes) {
      const limitAmount = await route.pools[0].getLimitAmountByTokenIn(
        tokenIn.denom
      );
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

    // Not enough liquidity
    if (totalLimitAmount.lt(tokenIn.amount)) {
      throw new NotEnoughLiquidityError(
        `Entry pools' limit amount ${totalLimitAmount.toString()} is less than in amount ${tokenIn.amount.toString()}`
      );
    }

    // only take routes with valid initialAmounts
    return initialSwapAmounts.map((amount, i) => {
      return {
        ...routes[i],
        initialAmount: amount,
      };
    });
  }

  /** Calculate the amount of token out by simulating a swap through a route. */
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

    const sumInitialAmount = routes.reduce(
      (sum, route) => sum.add(route.initialAmount),
      new Int(0)
    );

    if (sumInitialAmount.isZero())
      throw new Error("All initial amounts are zero");

    for (const route of routes) {
      const amountFraction = route.initialAmount
        .toDec()
        .quoTruncate(sumInitialAmount.toDec());

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
              isIncentivized: this._incentivizedPoolIds.includes(routePool.id),
            })),
            route.tokenOutDenoms[0],
            this._stakeCurrencyMinDenom
          )
        ) {
          osmoFeeDiscountForRoute[routes.indexOf(route)] = true;
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
            split: routes.map((route) => ({
              ...route,
              multiHopOsmoDiscount: false,
            })),
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

    const priceImpactTokenOut = totalEffectivePriceInOverOut
      .quo(totalBeforeSpotPriceInOverOut)
      .sub(new Dec("1"));

    return {
      split: routes
        .map((route, i) => ({
          ...route,
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
    };
  }

  /** Find potential routes through pools without optimization. */
  protected getCandidateRoutes(
    tokenInDenom: string,
    tokenOutDenom: string
  ): Route[] {
    if (this._pools.length === 0) {
      return [];
    }
    const cacheKey = `${tokenInDenom}/${tokenOutDenom}`;
    const cached = this._candidatePathsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const poolsUsed = Array<boolean>(this._pools.length).fill(false);
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

      for (let i = 0; i < this._pools.length; i++) {
        if (poolsUsed[i]) {
          continue; // skip pool
        }

        const previousTokenOuts = _previousTokenOuts
          ? _previousTokenOuts
          : [tokenInDenom]; // imaginary prev pool

        const curPool = this._pools[i];

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

    findRoutes(tokenInDenom, tokenOutDenom, [], [], poolsUsed);
    this._candidatePathsCache.set(cacheKey, routes);
    return routes.filter(({ pools }) => pools.length <= this._maxHops);
  }

  /** Binary searches for a subset of candidate routes for an optimal split trade. */
  protected async findBestSplitTokenIn(
    candidateRoutes: Route[],
    tokenInAmount: Int,
    maxIterations: number = 100
  ): Promise<RouteWithInAmount[]> {
    let bestSplit: RouteWithInAmount[] = [];
    let bestOutAmount = new Int(0);

    type RouteWithInAndOutAmount = RouteWithInAmount & { outAmount: Int };

    const calculateTokenOutByTokenIn = this.calculateTokenOutByTokenIn;

    async function splitRecursive(
      remainingInAmount: Int,
      remainingRoutes: RouteWithInAndOutAmount[],
      currentSplit: RouteWithInAndOutAmount[]
    ): Promise<void> {
      if (remainingRoutes.length === 0) {
        const totalOutAmount = currentSplit.reduce(
          (total, route) => total.add(route.outAmount),
          new Int(0)
        );
        if (totalOutAmount.gt(bestOutAmount)) {
          bestOutAmount = totalOutAmount;
          bestSplit = currentSplit;
        }
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const route = remainingRoutes.shift()! as RouteWithInAndOutAmount;
      for (let i = 0; i <= maxIterations; i++) {
        const fraction = new Dec(i).quo(new Dec(maxIterations));
        const inAmount = new Dec(remainingInAmount).mul(fraction).truncate();

        route.initialAmount = inAmount;

        const quote = await calculateTokenOutByTokenIn([route]);
        if (quote.amount.isZero()) {
          continue;
        }

        route.outAmount = quote.amount;

        currentSplit.push(route);
        await splitRecursive(
          remainingInAmount.sub(inAmount),
          remainingRoutes,
          currentSplit
        );
        currentSplit.pop();
      }

      remainingRoutes.unshift(route);
    }

    const zeroAmountRoutes = candidateRoutes.map((route) => ({
      ...route,
      initialAmount: new Int(0),
      outAmount: new Int(0),
    }));
    await splitRecursive(tokenInAmount, zeroAmountRoutes, []);
    return bestSplit;
  }
}
